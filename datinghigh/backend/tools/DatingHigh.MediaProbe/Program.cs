using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;

// 只輸出匿名容量／時間／錯誤分類；來源影像與 server secret 不進日誌或持久副本。
try
{
    if(args.Length==0)throw new ArgumentException();
    var compression=new ImageCompressionService();
    if(args[0]=="prepare-assets")
    {
        foreach(var path in Directory.EnumerateFiles(args[1],"*.png"))
        {
            using var input=File.OpenRead(path);
            var result=await compression.CompressAsync(input,180000,new("image/png"));
            if(Math.Abs((double)result.Width/result.Height-0.75)>0.002)throw new DomainException("INVALID_IMAGE");
            await File.WriteAllBytesAsync(Path.ChangeExtension(path,"jpg"),result.Bytes.ToArray());
        }
        Console.WriteLine("{\"prepared\":true}");return;
    }
    if(args[0]!="provider")throw new ArgumentException();
    using var document=JsonDocument.Parse(await Console.In.ReadToEndAsync());
    var photos=new List<PrivateMediaContent>();
    foreach(var item in document.RootElement.GetProperty("photoPaths").EnumerateArray())
    {
        using var input=File.OpenRead(item.GetString()!);
        var photo=await compression.CompressAsync(input);
        photos.Add(new(photo.Bytes,photo.MimeType));
    }
    var output=Path.GetFullPath(document.RootElement.GetProperty("outputPath").GetString()!);
    var allowed=Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(),".local"))+Path.DirectorySeparatorChar;
    if(!output.StartsWith(allowed,StringComparison.OrdinalIgnoreCase))throw new ArgumentException();
    var options=new GeminiOptions(Environment.GetEnvironmentVariable("GEMINI_API_KEY")??"");
    using var telemetry=new ProbeUsageHandler{InnerHandler=new SocketsHttpHandler{AllowAutoRedirect=false}};
    using var http=new HttpClient(telemetry){Timeout=TimeSpan.FromSeconds(100)};
    var generator=new GeminiAvatarImageGenerator(http,compression,options);
    var timer=Stopwatch.StartNew();var generated=await generator.GenerateAsync(photos,"warm");
    Directory.CreateDirectory(Path.GetDirectoryName(output)!);
    await File.WriteAllBytesAsync(output,generated.Bytes.ToArray());
    Console.WriteLine(JsonSerializer.Serialize(new{
        status="generated",sourceCount=photos.Count,model=options.Model,promptVersion=GeminiAvatarImageGenerator.PromptVersion,
        count=1,durationMs=timer.ElapsedMilliseconds,width=generated.Width,height=generated.Height,
        byteLength=generated.Bytes.Length,sourceBytes=photos.Select(p=>p.Bytes.Length).ToArray(),
        outputSha256=Convert.ToHexStringLower(SHA256.HashData(generated.Bytes.Span)),
        sourceExifRemoved=photos.All(p=>p.Bytes.Span.IndexOf("Exif"u8)<0),
        reportedModelVersion=telemetry.Model,usage=telemetry.Usage
    }));
}
catch(Exception error)
{
    Console.WriteLine(JsonSerializer.Serialize(new{status="failed",code=error is DomainException d?d.Code:"PROBE_UNAVAILABLE"}));
    Environment.ExitCode=1;
}

// 僅量測工具使用；只擷取有白名單的匿名計量，response影像留在記憶體後交由既有adapter驗證。
sealed class ProbeUsageHandler:DelegatingHandler
{
    public string? Model{get;private set;}
    public JsonObject? Usage{get;private set;}
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)
    {
        var response=await base.SendAsync(request,ct);
        if(!response.IsSuccessStatusCode)return response;
        await response.Content.LoadIntoBufferAsync(12*1024*1024,ct);
        using var json=JsonDocument.Parse(await response.Content.ReadAsByteArrayAsync(ct));
        if(json.RootElement.TryGetProperty("modelVersion",out var model)&&model.GetString() is {Length:<=100} value&&System.Text.RegularExpressions.Regex.IsMatch(value,"^[a-zA-Z0-9._-]+$"))Model=value;
        if(json.RootElement.TryGetProperty("usageMetadata",out var usage)){
            Usage=new();
            foreach(var key in new[]{"promptTokenCount","candidatesTokenCount","totalTokenCount","thoughtsTokenCount","cachedContentTokenCount"})
                if(usage.TryGetProperty(key,out var count)&&count.TryGetInt64(out var n)&&n>=0)Usage[key]=n;
            foreach(var key in new[]{"promptTokensDetails","candidatesTokensDetails"})if(usage.TryGetProperty(key,out var details)&&details.ValueKind==JsonValueKind.Array){
                var items=new JsonArray();foreach(var item in details.EnumerateArray())if(item.TryGetProperty("modality",out var modality)&&modality.GetString() is "TEXT" or "IMAGE"&&item.TryGetProperty("tokenCount",out var count)&&count.TryGetInt64(out var n)&&n>=0)items.Add(new JsonObject{["modality"]=modality.GetString(),["tokenCount"]=n});Usage[key]=items;
            }
        }
        return response;
    }
}
