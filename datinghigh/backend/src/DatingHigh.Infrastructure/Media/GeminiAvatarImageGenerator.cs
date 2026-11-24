using System.Net.Http.Json;
using System.Text.Json;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using Microsoft.Extensions.Logging;
using SkiaSharp;

namespace DatingHigh.Infrastructure.Media;

/// <summary>只在 server 設定；ApiKey 不可出現在 URI、response 或任何日誌。</summary>
public sealed record GeminiOptions(string ApiKey,string Model="gemini-3.1-flash-image");
/// <summary>固定主機、單次請求、無自動重試的 Gemini 真圖 adapter。</summary>
public sealed class GeminiAvatarImageGenerator(HttpClient http,IImageCompressionService compression,GeminiOptions options,ILogger<GeminiAvatarImageGenerator>? logger=null):IAvatarImageGenerator,IAvatarExpressionGenerator
{
    public const string PromptVersion="datinghigh-adv-full-body.v2";
    public string Model=>options.Model;
    public string ExpressionPromptVersion=>"datinghigh-expression-and-static.v3";
    public bool SupportsStaticPoses=>options.Model is "gemini-3.1-flash-image" or "gemini-3-pro-image";
    public async Task<CompressedImage> GenerateExpressionAsync(PrivateMediaContent master,string expression,CancellationToken ct=default)
    {
        if(expression.StartsWith("pose-",StringComparison.Ordinal)){
            var pose=expression switch{"pose-stand"=>"standing naturally, complete legs and shoes","pose-sit"=>"sitting with anatomically bent hips and knees, hands on lap","pose-read"=>"sitting and reading an open book held in both hands","pose-hold"=>"standing and holding a closed book with both hands",_=>throw new DomainException("INVALID_AVATAR_EXPRESSION")};
            if(master.Bytes.Length is <1 or >2000000||master.MimeType is not("image/jpeg" or "image/png" or "image/webp"))throw new DomainException("INVALID_IMAGE");
            if(string.IsNullOrWhiteSpace(options.ApiKey)||options.Model is not("gemini-3.1-flash-image" or "gemini-3-pro-image"))throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
            var posePrompt=$"datinghigh-static-poses.v1. The ONE attached image is the sole selected adult identity and clothing master. Produce ONE 16:9 transparent sprite sheet: exactly FIVE complete full-body figures, in five equal-width columns, left-to-right neutral / gentle symmetric smile / surprised / thoughtful / concerned. ALL five figures are {pose}. Preserve the exact face, eyes, hair, glasses, costume, proportions, shoes, rendering and colors from the master. The head, neck and clothing must be seamless; do not paste facial fragments. Each complete figure stays entirely inside its own column with a generous transparent gutter on both sides and safe top/bottom margins; never cross a column boundary. Same camera scale in all columns; no furniture, extra people, labels, text or panels. The book is a simple original prop. For deterministic alpha extraction, use ONLY a perfectly flat vivid magenta #FF00FF background including limb gaps; reserve that exact key for background, no gradient, cast shadow, texture, checkerboard or reflected magenta. Five clearly distinct facial expressions, keep the same body pose and identity.";
            return await GenerateImageAsync([new{text=posePrompt},new{inlineData=new{mimeType=master.MimeType,data=Convert.ToBase64String(master.Bytes.Span)}}],true,ct,true);
        }
        var meaning=expression switch{
            "neutral"=>"relaxed natural eyebrows and eyes, naturally closed relaxed mouth",
            "smile"=>"gently upturned mouth corners with relaxed eyebrows and eyes",
            "surprised"=>"widened eyes, raised eyebrows and slightly open mouth",
            "thoughtful"=>"slightly averted gaze, gently drawn eyebrows and naturally closed mouth",
            "concerned"=>"slightly furrowed eyebrows and gently pressed lips, without crying",
            _=>throw new DomainException("INVALID_AVATAR_EXPRESSION")};
        if(master.Bytes.Length is <1 or >2000000||master.MimeType is not("image/jpeg" or "image/png" or "image/webp"))throw new DomainException("INVALID_IMAGE");
        if(string.IsNullOrWhiteSpace(options.ApiKey)||options.Model is not("gemini-3.1-flash-image" or "gemini-3-pro-image" or "gemini-2.5-flash-image"))throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
        var prompt=$"{ExpressionPromptVersion}. The ONE attached image is the selected adult full-body standing master. Create exactly one matching full-body standing sprite with the fixed expression '{expression}': {meaning}. Change only the eyebrows, eyes and mouth required for that expression. Keep identity, facial proportions, hairstyle, hair color, clothing, arms, hands, legs, shoes, standing pose, lineart, shading and 3:4 framing identical to the reference. Keep the complete head and both feet inside safe margins. Do not add speaking motion, text, other people or infer the real person's emotions. For deterministic alpha extraction, replace ONLY the background with perfectly uniform solid vivid magenta RGB(255,0,255), #FF00FF, including gaps between limbs. Reserve this exact saturated magenta for background only; do not tint or reflect magenta onto the subject. No background gradients, shadows, texture, checkerboard or additional objects. If the reference uses magenta clothing, retain its design in a slightly less saturated tone to keep the reserved key separate. Preserve crisp facial detail and dark clean outlines. The reference is the sole identity and style source.";
        return await GenerateImageAsync([new{text=prompt},new{inlineData=new{mimeType=master.MimeType,data=Convert.ToBase64String(master.Bytes.Span)}}],true,ct);
    }
    public async Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default)
    {
        if(photos.Count is <2 or >5||styleId is not("warm" or "moon" or "sakura" or "forest"))
            throw new DomainException("INVALID_AVATAR_SELECTION");
        if(string.IsNullOrWhiteSpace(options.ApiKey)||options.Model is not("gemini-3.1-flash-image" or "gemini-3-pro-image" or "gemini-2.5-flash-image"))
            throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
        var palette=styleId switch{"moon"=>"subtle moonlit lavender","sakura"=>"soft cherry blossom pink","forest"=>"gentle sage green",_=>"warm pale rose"};
        string prompt;
        // 依使用者決策：完整沿用已驗證 portrait.v3，只調整全身取景及其畫幅座標；身份、畫風、衣裝與手勢文字保留。
        // 原型的兩張圖片只作美術參考，絕不可混入真人來源、被誤認為本人或當生成結果。
        prompt=$"{PromptVersion}. The first {photos.Count} images are photographs of the ADULT subject: use ONLY these first images for identity. The final two images are ART STYLE REFERENCES from our prototype: use them ONLY for rendering style, never for facial identity or hairstyle. Create exactly ONE full-body standing 3:4 Japanese dating visual-novel / otome-game character sprite of the adult subject where the character generously fills the 3:4 frame from top of hair (~2%–3% from the top edge) down to both feet and shoe soles near the bottom edge (95%–97% of canvas height)—show the complete head, hands, torso, legs and both feet; do NOT make a waist-up or close-up chest crop. Match the prototype's crisp dark tapered lineart, clean soft cel shading, polished anime hair highlights, expressive but not oversized eyes, warm blush, luminous pastel bokeh and small sparkles. Do NOT make a photorealistic painted portrait, 3D render, fashion photograph or textured oil painting. Within this anime illustration style preserve the adult subject's recognizable facial features, jaw/chin contour, eye spacing and eyelid shape, nose and lip proportions, facial hair, glasses shape, hairline, fringe and bareheaded hairstyle from the REAL PHOTOS (always depict the character bareheaded without hats, caps or bulky earflap headgear so the full hair and neck are clearly visible). Do not replace the face with the generic faces in the style references. Strictly match our built-in 3:4 character sprites' 8-head-tall anime proportions and large frame-filling presence: keep the head and face small and compact relative to the broad shoulders—cheek-to-cheek face width is only ~8%–9% of canvas width, full hair width ~13%–14% of canvas width, and the chin sits high at ~15%–17% from the top edge above a long, slender exposed neck; meanwhile the broad, square adult shoulders, chest and outer arms/elbows expand to fill ~37%–41% of the horizontal canvas width (leaving ~29%–31% side margins at the left and right edges, ~4.6x the face width, never narrow-shouldered or shrunken with wide empty side margins), with the complete standing figure extending all the way down to both feet and shoe soles near the bottom edge of the canvas and natural upper-body hand gestures (such as touching the collar/chin, adjusting glasses, or hands resting at the waist), simple {palette} background, stylish tailored everyday clothing. Exclude hats, children, other people, text, logos, source-photo background and collages. A polished new game character, faithful to the adult's visible features, in exactly our prototype's anime/ADV visual language.";
        var parts=new List<object>{new{text=prompt}};
        foreach(var photo in photos)
        {
            if(photo.Bytes.Length is <1 or >200000||photo.MimeType is not("image/jpeg" or "image/png" or "image/webp"))
                throw new DomainException("INVALID_IMAGE");
            parts.Add(new{inlineData=new{mimeType=photo.MimeType,data=Convert.ToBase64String(photo.Bytes.Span)}});
        }
        parts.Add(new{text="The following two images are STYLE ONLY references (they are tight close-up avatar crops: do NOT copy their close-up framing or large head-to-canvas ratio). Do not copy their faces, hair or clothing. Render the photographed adult's features bareheaded (no hats) with this prototype's exact lineart, cel shading and luminous colors, matching our built-in 3:4 full-body standing sprites: the character fills the frame from top of hair (~2%–3% from top) down to both feet and shoe soles near the bottom edge (95%–97% height, complete legs and shoes), with a small compact face (~8%–9% of canvas width, chin high at ~15%–17% from top), long slender neck, and broad shoulders/elbows filling ~37%–41% of the canvas width (~4.6x face width, natural side margins)."});
        foreach(var name in new[]{"sun","forest"}){
            using var reference=typeof(GeminiAvatarImageGenerator).Assembly.GetManifestResourceStream($"DatingHigh.Infrastructure.Media.StyleReferences.{name}.jpg")
                ??throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
            using var bytes=new MemoryStream();await reference.CopyToAsync(bytes,ct);
            parts.Add(new{inlineData=new{mimeType="image/jpeg",data=Convert.ToBase64String(bytes.ToArray())}});
        }
        return await GenerateImageAsync(parts,false,ct);
    }
    private async Task<CompressedImage> GenerateImageAsync(List<object> parts,bool sprite,CancellationToken ct,bool staticSheet=false)
    {
        using var request=new HttpRequestMessage(HttpMethod.Post,$"https://generativelanguage.googleapis.com/v1beta/models/{options.Model}:generateContent");
        request.Headers.Add("x-goog-api-key",options.ApiKey);
        request.Content=JsonContent.Create(new{
            contents=new[]{new{role="user",parts}},
            generationConfig=new{responseModalities=new[]{"TEXT","IMAGE"},candidateCount=1,imageConfig=new{aspectRatio=staticSheet?"16:9":"3:4",imageSize=staticSheet?"2K":"1K"}}
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
            if(staticSheet)return AvatarStaticPoseImage.Prepare(decoded);
            var prepared=sprite?AvatarChromaMask.Apply(decoded):decoded;
            using var input=new MemoryStream(prepared,false);
            // 正式 AI 化身不套用來源照片的 200 KB 限制，維持 1K 人臉品質。
            var image=await compression.CompressAsync(input,2_000_000,
                new(sprite&&!ReferenceEquals(prepared,decoded)?"image/png":images[0].Mime,PreserveTransparency:sprite,MinimumWidth:sprite?600:1,MinimumHeight:sprite?800:1,LosslessWebp:sprite),deadline.Token);
            if(Math.Abs((double)image.Width/image.Height-0.75)>0.015)
                throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);
            if(sprite){
                using var bitmap=SKBitmap.Decode(image.Bytes.ToArray());var transparent=0;var solid=0;
                foreach(var pixel in bitmap.Pixels){if(pixel.Alpha<128)transparent++;else solid++;}
                if(transparent<bitmap.Width*bitmap.Height/100||solid<bitmap.Width*bitmap.Height/20)
                    throw new DomainException("AVATAR_TRANSPARENCY_REQUIRED",503);
                if(!AvatarFullBodyQuality.HasCompleteStandingFigure(bitmap))
                    throw new DomainException("AVATAR_FULL_BODY_INVALID",503);
            }
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
