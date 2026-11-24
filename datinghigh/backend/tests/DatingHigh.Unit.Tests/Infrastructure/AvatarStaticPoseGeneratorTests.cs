using System.Net;
using System.Text.Json;
using DatingHigh.Application.Media;
using DatingHigh.Infrastructure.Media;
using DatingHigh.Domain;
using SkiaSharp;
namespace DatingHigh.Unit.Tests.Infrastructure;
public sealed class AvatarStaticPoseGeneratorTests
{
    [Fact]
    public async Task PoseSheet_Unsupported2KModel_RejectsBeforeProviderCall()
    {
        var calls=0;using var http=new HttpClient(new Handler(_=>{calls++;return Task.FromResult(Reply(Sheet()));}));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential","gemini-2.5-flash-image"));
        var error=await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateExpressionAsync(new(new byte[]{1},"image/jpeg"),"pose-stand"));
        Assert.Equal("IMAGE_PROVIDER_UNAVAILABLE",error.Code);Assert.Equal(0,calls);
    }
    [Fact]
    public async Task PoseSheet_UsesOneSelectedMasterAndSingle2KRequest_ReturnsTransparentPng()
    {
        var calls=0;using var http=new HttpClient(new Handler(async request=>{
            calls++;using var json=JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            var parts=json.RootElement.GetProperty("contents")[0].GetProperty("parts");Assert.Equal(2,parts.GetArrayLength());Assert.Contains("read",parts[0].GetProperty("text").GetString());
            Assert.Equal("2K",json.RootElement.GetProperty("generationConfig").GetProperty("imageConfig").GetProperty("imageSize").GetString());
            return Reply(Sheet());
        }));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential"));
        var result=await generator.GenerateExpressionAsync(new(new byte[]{1},"image/jpeg"),"pose-read");
        Assert.Equal(1,calls);Assert.Equal("image/png",result.MimeType);Assert.Equal(1500,result.Width);Assert.Equal(800,result.Height);
        using var decoded=SKBitmap.Decode(result.Bytes.ToArray());Assert.Equal(0,decoded.GetPixel(0,0).Alpha);
    }
    [Theory]
    [InlineData(true,false)][InlineData(false,true)]
    public async Task PoseSheet_MissingOrRepeatedFrame_RejectsBeforeStorage(bool missing,bool duplicate)
    {
        using var http=new HttpClient(new Handler(_=>Task.FromResult(Reply(Sheet(missing,duplicate)))));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential"));
        await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateExpressionAsync(new(new byte[]{1},"image/jpeg"),"pose-sit"));
    }
    private static byte[] Sheet(bool missing=false,bool duplicate=false){
        using var bitmap=new SKBitmap(1500,800);using var canvas=new SKCanvas(bitmap);canvas.Clear(SKColors.Transparent);
        for(var n=0;n<(missing?4:5);n++){using var ink=new SKPaint{Color=new SKColor((byte)(duplicate?100:60+n*30),100,160)};canvas.DrawCircle(n*300+150,100,45,ink);canvas.DrawRect(n*300+70,150,160,560,ink);}
        using var image=SKImage.FromBitmap(bitmap);using var png=image.Encode(SKEncodedImageFormat.Png,100);return png.ToArray();
    }
    private static HttpResponseMessage Reply(byte[] png)=>new(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType="image/png",data=Convert.ToBase64String(png)}}}}}}}))};
    private sealed class Handler(Func<HttpRequestMessage,Task<HttpResponseMessage>> send):HttpMessageHandler{protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>send(request);}
}
