using System.Text.Json.Nodes;
using DatingHigh.Application.Media;
using DatingHigh.Infrastructure.Media;
using SkiaSharp;
namespace DatingHigh.Integration.Tests;
/// <summary>測試限定：正式虛構角色的同一來源在RAM重排成五欄；不是真供應商或身份品質證據。</summary>
internal static class AvatarStaticPoseFixture
{
    public static CompressedImage Sheet(string pose)
    {
        var root=new DirectoryInfo(AppContext.BaseDirectory);while(root is not null&&!File.Exists(Path.Combine(root.FullName,"contracts/builtin-static-poses.json")))root=root.Parent;
        if(root is null)throw new InvalidOperationException("Static fixture root not found");
        var package=JsonNode.Parse(File.ReadAllBytes(Path.Combine(root.FullName,"contracts/builtin-static-poses.json")))!["packs"]!["male-02"]!;
        var frames=package["poses"]!.AsArray().Single(p=>p!["id"]!.GetValue<string>()==pose)!["frames"]!;
        using var bitmap=new SKBitmap(2000,1100);using(var canvas=new SKCanvas(bitmap)){
            canvas.Clear(SKColors.Transparent);var index=0;
            foreach(var emotion in new[]{"neutral","smile","surprised","thoughtful","concerned"}){
                var frame=frames[emotion]!;var asset=package["assets"]!.AsArray().Single(a=>a!["id"]!.GetValue<string>()==frame["assetId"]!.GetValue<string>())!;
                using var source=SKBitmap.Decode(File.ReadAllBytes(Path.Combine(root.FullName,$"frontend/client/public/avatars/static-poses.v1/male-02/{asset["sha256"]!.GetValue<string>()}.png")));using var image=SKImage.FromBitmap(source);
                var region=frame["region"]!;float x=(float)region["x"]!.GetValue<double>(),y=(float)region["y"]!.GetValue<double>(),w=(float)region["width"]!.GetValue<double>(),h=(float)region["height"]!.GetValue<double>();
                var scale=Math.Min(360/w,1050/h);var dw=w*scale;var dh=h*scale;
                canvas.DrawImage(image,new SKRect(x,y,x+w,y+h),new SKRect(index*400+(400-dw)/2,25,index*400+(400+dw)/2,25+dh),new SKSamplingOptions(SKFilterMode.Nearest));index++;
            }
        }
        using var result=SKImage.FromBitmap(bitmap);using var png=result.Encode(SKEncodedImageFormat.Png,100);return AvatarStaticPoseImage.Prepare(png.ToArray());
    }
}
