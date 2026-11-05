using System.Net;
using System.Text.Json;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;

namespace DatingHigh.Unit.Tests.Infrastructure;

public sealed class AvatarGeneratorTests
{
    [Theory,Trait("Case","AP-UT-067")]
    [InlineData("image/jpeg")][InlineData("image/png")][InlineData("image/webp")]
    public async Task Generate_UndecodableProviderImage_IsAProviderFailure_NotAnInvalidSourcePhoto(string mime)
    {
        var calls=0;using var http=new HttpClient(new Handler(_=>{
            calls++;return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=JsonContent(new{candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType=mime,data="AQID"}}}}}}})});
        }));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential"));
        var photo=new PrivateMediaContent(new byte[]{1},"image/jpeg");
        var error=await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateAsync([photo,photo],"warm"));
        Assert.Equal(503,error.Status);Assert.Equal("IMAGE_PROVIDER_NO_IMAGE",error.Code);Assert.Equal(1,calls);
    }
    [Fact,Trait("Case","AP-UT-037"),Trait("Case","AP-UT-038")]
    public async Task Generate_ExplicitTwoPhotoRequest_SendsOneFixedPromptWithoutSecretInUrl()
    {
        var calls=0;
        using var http=new HttpClient(new Handler(async request=>{
            calls++;
            Assert.Equal("generativelanguage.googleapis.com",request.RequestUri!.Host);
            Assert.DoesNotContain("key",request.RequestUri.Query);
            Assert.Equal("test-only-credential",request.Headers.GetValues("x-goog-api-key").Single());
            using var json=JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            Assert.Equal(6,json.RootElement.GetProperty("contents")[0].GetProperty("parts").GetArrayLength());
            Assert.Contains("8-head-tall anime proportions",json.RootElement.GetProperty("contents")[0].GetProperty("parts")[0].GetProperty("text").GetString());Assert.Contains("STYLE ONLY",json.RootElement.GetProperty("contents")[0].GetProperty("parts")[3].GetProperty("text").GetString());Assert.Contains("do NOT copy their close-up framing",json.RootElement.GetProperty("contents")[0].GetProperty("parts")[3].GetProperty("text").GetString());
            Assert.Equal("3:4",json.RootElement.GetProperty("generationConfig").GetProperty("imageConfig").GetProperty("aspectRatio").GetString());
            var bytes=ImageCompressionTests.Picture(480,640);
            return new(HttpStatusCode.OK){Content=JsonContent(new{candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType="image/png",data=Convert.ToBase64String(bytes)}}}}}}})};
        }));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential","gemini-3.1-flash-image"));
        var photo=new PrivateMediaContent(ImageCompressionTests.Picture(),"image/png");
        var result=await generator.GenerateAsync([photo,photo],"warm");
        Assert.Equal(1,calls);Assert.Equal(480,result.Width);Assert.Equal(640,result.Height);
    }

    [Theory,Trait("Case","AP-UT-029"),Trait("Case","AP-UT-067")]
    [InlineData(0)][InlineData(1)][InlineData(6)]
    public async Task Generate_InvalidPhotoCount_NeverCallsProvider(int count)
    {
        using var http=new HttpClient(new Handler(_=>throw new InvalidOperationException("must not call")));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential","gemini-3.1-flash-image"));
        var photo=new PrivateMediaContent(new byte[]{1},"image/jpeg");
        await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateAsync(Enumerable.Repeat(photo,count).ToArray(),"warm"));
    }

    [Theory,Trait("Case","AP-UT-067"),Trait("Case","AP-UT-068")]
    [InlineData("{}")] [InlineData("{\"candidates\":[{\"content\":{\"parts\":[]}}]}")]
    public async Task Generate_NoImage_NeverClaimsSuccessOrRetries(string body)
    {
        var calls=0;
        using var http=new HttpClient(new Handler(_=>{calls++;return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(body)});}));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential","gemini-3.1-flash-image"));
        var photo=new PrivateMediaContent(new byte[]{1},"image/jpeg");
        Assert.Equal("IMAGE_PROVIDER_NO_IMAGE",(await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateAsync([photo,photo],"warm"))).Code);
        Assert.Equal(1,calls);
    }

    [Fact,Trait("Case","AP-UT-071"),Trait("Case","AP-UT-072")]
    public async Task Generate_ProviderTimeout_NeverAutomaticallyRetries()
    {
        var calls=0;using var http=new HttpClient(new Handler(_=>{calls++;throw new TaskCanceledException();}));
        var generator=new GeminiAvatarImageGenerator(http,new ImageCompressionService(),new("test-only-credential","gemini-3.1-flash-image"));
        var photo=new PrivateMediaContent(new byte[]{1},"image/jpeg");
        Assert.Equal("IMAGE_PROVIDER_UNCERTAIN",(await Assert.ThrowsAsync<DomainException>(()=>generator.GenerateAsync([photo,photo],"warm"))).Code);
        Assert.Equal(1,calls);
    }
    private static StringContent JsonContent(object value)=>new(JsonSerializer.Serialize(value));
    private sealed class Handler(Func<HttpRequestMessage,Task<HttpResponseMessage>> call):HttpMessageHandler
    {protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>call(request);}
}
