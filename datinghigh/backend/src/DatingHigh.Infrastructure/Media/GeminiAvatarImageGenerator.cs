using System.Net.Http.Json;
using System.Text.Json;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using Microsoft.Extensions.Logging;

namespace DatingHigh.Infrastructure.Media;

/// <summary>只在 server 設定；ApiKey 不可出現在 URI、response 或任何日誌。</summary>
public sealed record GeminiOptions(string ApiKey,string Model="gemini-3.1-flash-image");
/// <summary>固定主機、單次請求、無自動重試的 Gemini 真圖 adapter。</summary>
public sealed class GeminiAvatarImageGenerator(HttpClient http,IImageCompressionService compression,GeminiOptions options,ILogger<GeminiAvatarImageGenerator>? logger=null):IAvatarImageGenerator
{
    public const string PromptVersion="datinghigh-adv-portrait.v3";
    public async Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default)
    {
        if(photos.Count is <2 or >5||styleId is not("warm" or "moon" or "sakura" or "forest"))
            throw new DomainException("INVALID_AVATAR_SELECTION");
        if(string.IsNullOrWhiteSpace(options.ApiKey)||options.Model is not("gemini-3.1-flash-image" or "gemini-3-pro-image" or "gemini-2.5-flash-image"))
            throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
        var palette=styleId switch{"moon"=>"subtle moonlit lavender","sakura"=>"soft cherry blossom pink","forest"=>"gentle sage green",_=>"warm pale rose"};
        string prompt;
        // 原型的兩張圖片只作美術參考，絕不可混入真人來源、被誤認為本人或當生成結果。
        prompt=$"{PromptVersion}. The first {photos.Count} images are photographs of the ADULT subject: use ONLY these first images for identity. The final two images are ART STYLE REFERENCES from our prototype: use them ONLY for rendering style, never for facial identity or hairstyle. Create exactly ONE waist-up standing 3:4 Japanese dating visual-novel / otome-game character sprite of the adult subject where the character generously fills the 3:4 frame from top of hair (~2%–3% from the top edge) down to the waist/belt line right at the bottom edge (95%–99% of canvas height)—do NOT make a close-up chest crop, and do NOT zoom out to show pants, hips, crotch or legs below the belt. Match the prototype's crisp dark tapered lineart, clean soft cel shading, polished anime hair highlights, expressive but not oversized eyes, warm blush, luminous pastel bokeh and small sparkles. Do NOT make a photorealistic painted portrait, 3D render, fashion photograph or textured oil painting. Within this anime illustration style preserve the adult subject's recognizable facial features, jaw/chin contour, eye spacing and eyelid shape, nose and lip proportions, facial hair, glasses shape, hairline, fringe and bareheaded hairstyle from the REAL PHOTOS (always depict the character bareheaded without hats, caps or bulky earflap headgear so the full hair and neck are clearly visible). Do not replace the face with the generic faces in the style references. Strictly match our built-in 3:4 character sprites' 8-head-tall anime proportions and large frame-filling presence: keep the head and face small and compact relative to the broad shoulders—cheek-to-cheek face width is only ~18%–19% of canvas width, full hair width ~28% of canvas width, and the chin sits high at ~27%–29% from the top edge above a long, slender exposed neck; meanwhile the broad, square adult shoulders, chest and outer arms/elbows expand to fill ~88%–92% of the horizontal canvas width (leaving only narrow ~4%–6% side margins at the left and right edges, ~4.6x the face width, never narrow-shouldered or shrunken with wide empty side margins), with the full upper torso extending all the way down to the waist/belt right at the bottom edge of the canvas and natural upper-body hand gestures (such as touching the collar/chin, adjusting glasses, or hands resting at the waist), simple {palette} background, stylish tailored everyday clothing. Exclude hats, pants/legs below the belt, children, other people, text, logos, source-photo background and collages. A polished new game character, faithful to the adult's visible features, in exactly our prototype's anime/ADV visual language.";
        var parts=new List<object>{new{text=prompt}};
        foreach(var photo in photos)
        {
            if(photo.Bytes.Length is <1 or >200000||photo.MimeType is not("image/jpeg" or "image/png" or "image/webp"))
                throw new DomainException("INVALID_IMAGE");
            parts.Add(new{inlineData=new{mimeType=photo.MimeType,data=Convert.ToBase64String(photo.Bytes.Span)}});
        }
        parts.Add(new{text="The following two images are STYLE ONLY references (they are tight close-up avatar crops: do NOT copy their close-up framing or large head-to-canvas ratio). Do not copy their faces, hair or clothing. Render the photographed adult's features bareheaded (no hats) with this prototype's exact lineart, cel shading and luminous colors, matching our built-in 3:4 waist-up standing sprites: the character fills the frame from top of hair (~2%–3% from top) down to the waist/belt right at the bottom edge (95%–99% height, no pants/legs below the belt), with a small compact face (~18%–19% of canvas width, chin high at ~27%–29% from top), long slender neck, and broad shoulders/elbows filling ~88%–92% of the canvas width (~4.6x face width, only narrow side margins)."});
        foreach(var name in new[]{"sun","forest"}){
            using var reference=typeof(GeminiAvatarImageGenerator).Assembly.GetManifestResourceStream($"DatingHigh.Infrastructure.Media.StyleReferences.{name}.jpg")
                ??throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
            using var bytes=new MemoryStream();await reference.CopyToAsync(bytes,ct);
            parts.Add(new{inlineData=new{mimeType="image/jpeg",data=Convert.ToBase64String(bytes.ToArray())}});
        }
        using var request=new HttpRequestMessage(HttpMethod.Post,$"https://generativelanguage.googleapis.com/v1beta/models/{options.Model}:generateContent");
        request.Headers.Add("x-goog-api-key",options.ApiKey);
        request.Content=JsonContent.Create(new{
            contents=new[]{new{role="user",parts}},
            generationConfig=new{responseModalities=new[]{"TEXT","IMAGE"},candidateCount=1,imageConfig=new{aspectRatio="3:4",imageSize="1K"}}
        });
        try
        {
            using var deadline=CancellationTokenSource.CreateLinkedTokenSource(ct);deadline.CancelAfter(TimeSpan.FromSeconds(90));
            using var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,deadline.Token);
            if((int)response.StatusCode==429)throw new DomainException("RATE_LIMITED",429,60);
            if(!response.IsSuccessStatusCode)throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
            using var stream=await response.Content.ReadAsStreamAsync(deadline.Token);
            using var buffer=new MemoryStream();var chunk=new byte[16384];int count;
            while((count=await stream.ReadAsync(chunk,deadline.Token))>0)
            {
                if(buffer.Length+count>12*1024*1024)throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);
                await buffer.WriteAsync(chunk.AsMemory(0,count),deadline.Token);
            }
            using var json=JsonDocument.Parse(buffer.GetBuffer().AsMemory(0,(int)buffer.Length),new JsonDocumentOptions{MaxDepth=16});
            var images=new List<(string Mime,string Data)>();
            if(json.RootElement.TryGetProperty("candidates",out var candidates))
                foreach(var candidate in candidates.EnumerateArray())
                    if(candidate.TryGetProperty("content",out var content)&&content.TryGetProperty("parts",out var outputParts))
                        foreach(var part in outputParts.EnumerateArray())
                            if(part.TryGetProperty("inlineData",out var inline)&&inline.TryGetProperty("data",out var data)&&inline.TryGetProperty("mimeType",out var mime))
                                images.Add((mime.GetString()??"",data.GetString()??""));
            if(images.Count!=1)throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);
            var decoded=Convert.FromBase64String(images[0].Data);
            using var input=new MemoryStream(decoded,false);
            // 正式 AI 化身不套用來源照片的 200 KB 限制，維持 1K 人臉品質。
            var image=await compression.CompressAsync(input,2_000_000,new(images[0].Mime),deadline.Token);
            if(Math.Abs((double)image.Width/image.Height-0.75)>0.015)
                throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);
            return image;
        }
        catch(Exception error)when(error is OperationCanceledException or HttpRequestException)
        {
            logger?.LogWarning("Avatar provider transport failed Type={Type} Network={Network} CallerCancelled={CallerCancelled}",
                error.GetType().Name,error is HttpRequestException network?network.HttpRequestError.ToString():"cancelled",ct.IsCancellationRequested);
            throw new DomainException("IMAGE_PROVIDER_UNCERTAIN",503);
        }
        catch(DomainException error)when(error.Code is "INVALID_IMAGE" or "IMAGE_TOO_LARGE" or "COMPRESSED_IMAGE_TOO_LARGE")
        {throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);}
        catch(Exception error)when(error is JsonException or FormatException or InvalidOperationException)
        {throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);}
    }
}
