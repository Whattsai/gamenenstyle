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
        prompt=$"{PromptVersion}. The first {photos.Count} images are photographs of the ADULT subject: use ONLY these first images for identity. The final two images are ART STYLE REFERENCES from our prototype: use them ONLY for rendering style, never for facial identity or hairstyle. Create exactly ONE waist-up 3:4 Japanese dating visual-novel / otome-game illustration of the adult subject. Match the prototype's crisp dark tapered lineart, clean soft cel shading, polished anime hair highlights, expressive but not oversized eyes, warm blush, luminous pastel bokeh and small sparkles. Do NOT make a photorealistic painted portrait, 3D render, fashion photograph or textured oil painting. Within this anime illustration style preserve the adult subject's recognizable face width, cheek fullness, jaw/chin shape, eye spacing and eyelid shape, nose and lip proportions, glasses shape, hairline, fringe and hairstyle from the REAL PHOTOS. Do not replace the face with the generic faces in the style references, sharpen the chin or slim the face. Keep mature adult proportions and natural skin tone. Complete head with margin and body down to waist, simple {palette} background, everyday clothing. Exclude children, other people, text, logos, source-photo background and collages. A polished new game character, faithful to the adult's visible features, in exactly our prototype's anime/ADV visual language.";
        var parts=new List<object>{new{text=prompt}};
        foreach(var photo in photos)
        {
            if(photo.Bytes.Length is <1 or >200000||photo.MimeType is not("image/jpeg" or "image/png" or "image/webp"))
                throw new DomainException("INVALID_IMAGE");
            parts.Add(new{inlineData=new{mimeType=photo.MimeType,data=Convert.ToBase64String(photo.Bytes.Span)}});
        }
        parts.Add(new{text="The following two images are STYLE ONLY references. Do not copy their faces, hair or clothing. Render the photographed adult's features with this prototype's lineart, cel shading and luminous colors."});
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
