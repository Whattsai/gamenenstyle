using System.Net;
using System.Text.Json;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;
using SkiaSharp;

namespace DatingHigh.Unit.Tests.Infrastructure;

public sealed class AvatarExpressionGeneratorTests
{
    [Theory]
    [InlineData("neutral")][InlineData("smile")][InlineData("surprised")][InlineData("thoughtful")][InlineData("concerned")]
    public async Task Expression_UsesOnlySelectedMasterAndFixedSemantics_NoPhotoOrStyleReferenceResend(string expression)
    {
        var calls=0;
        using var http=new HttpClient(new Handler(async request=>{
            calls++;using var json=JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            var parts=json.RootElement.GetProperty("contents")[0].GetProperty("parts");Assert.Equal(2,parts.GetArrayLength());
            Assert.Contains(expression,parts[0].GetProperty("text").GetString());Assert.Contains("only the eyebrows, eyes and mouth",parts[0].GetProperty("text").GetString());
            Assert.Equal("AQID",parts[1].GetProperty("inlineData").GetProperty("data").GetString());
            using var bitmap=StandingSprite();Assert.True(AvatarFullBodyQuality.HasCompleteStandingFigure(bitmap),AvatarFullBodyQuality.GetStandingFigureFailure(bitmap));using var image=SKImage.FromBitmap(bitmap);using var png=image.Encode(SKEncodedImageFormat.Png,100);
            return new(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType="image/png",data=Convert.ToBase64String(png.ToArray())}}}}}}}))};
        }));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential"));
        var result=await generator.GenerateExpressionAsync(new(new byte[]{1,2,3},"image/jpeg"),expression);
        Assert.Equal(1,calls);Assert.Equal("image/webp",result.MimeType);
        using var decoded=SKBitmap.Decode(result.Bytes.ToArray());Assert.Equal(0,decoded.GetPixel(0,0).Alpha);
    }

    [Fact]
    public async Task Expression_OpaqueOrUnknownExpression_NeverBecomesReady()
    {
        var calls=0;
        using var http=new HttpClient(new Handler(_=>{calls++;return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType="image/png",data=Convert.ToBase64String(ImageCompressionTests.Picture(600,800))}}}}}}}))});}));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential"));
        await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateExpressionAsync(new(new byte[]{1},"image/jpeg"),"angry"));Assert.Equal(0,calls);
        var error=await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateExpressionAsync(new(new byte[]{1},"image/jpeg"),"smile"));
        Assert.Equal("AVATAR_TRANSPARENCY_REQUIRED",error.Code);Assert.Equal(1,calls);
    }
    [Fact]
    public async Task Expression_MissingLegsMissingFootOrCroppedSole_IsRejectedBeforeReady()
    {
        foreach(var bitmap in new[]{StandingSprite(withLegs:false),StandingSprite(withRightFoot:false),StandingSprite(croppedSole:true)})
        {
            using(bitmap)
            {
                using var image=SKImage.FromBitmap(bitmap);using var png=image.Encode(SKEncodedImageFormat.Png,100);
                using var http=new HttpClient(new Handler(_=>Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType="image/png",data=Convert.ToBase64String(png.ToArray())}}}}}}}))})));
                var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential"));
                var error=await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateExpressionAsync(new(new byte[]{1},"image/jpeg"),"neutral"));
                Assert.Equal("AVATAR_FULL_BODY_INVALID",error.Code);
            }
        }
    }
    [Fact]
    public void FullBodyQuality_AcceptsShoesThatAreNarrowerThanTrouserLegs()
    {
        using var bitmap=StandingSprite(narrowShoes:true);
        Assert.True(AvatarFullBodyQuality.HasCompleteStandingFigure(bitmap),AvatarFullBodyQuality.GetStandingFigureFailure(bitmap));
    }
    private static SKBitmap StandingSprite(bool withLegs=true,bool withRightFoot=true,bool croppedSole=false,bool narrowShoes=false)
    {
        var bitmap=new SKBitmap(600,800);using var canvas=new SKCanvas(bitmap);canvas.Clear(SKColors.Transparent);
        using var fill=new SKPaint{Color=SKColors.Coral};
        void rect(float left,float top,float right,float bottom)=>canvas.DrawRect(new SKRect(left,top,right,bottom),fill);
        rect(240,40,360,190);rect(190,180,410,480);
        if(withLegs){rect(225,450,290,690);rect(310,450,375,690);rect(narrowShoes?235:205,680,narrowShoes?280:305,755);if(withRightFoot||croppedSole)rect(narrowShoes?320:300,680,narrowShoes?365:400,croppedSole?800:755);else rect(310,680,375,735);}
        return bitmap;
    }
    private sealed class Handler(Func<HttpRequestMessage,Task<HttpResponseMessage>> call):HttpMessageHandler
    {protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>call(request);}
}
