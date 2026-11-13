using DatingHigh.Domain;
using SkiaSharp;

namespace DatingHigh.Infrastructure.Media;

/// <summary>只處理模型契約的保留洋紅底；不推測任意照片背景，不呼叫其他供應商。</summary>
public static class AvatarChromaMask
{
    private static readonly object DecoderGate=new();
    private static DomainException Invalid()=>new("AVATAR_TRANSPARENCY_REQUIRED",503);
    private static bool Key(SKColor p)=>p.Red>=191&&p.Green<=64&&p.Blue>=191&&Math.Min(p.Red,p.Blue)-p.Green>=144;
    public static byte[] Apply(byte[] encoded)
    {lock(DecoderGate)return ApplyCore(encoded);}
    private static byte[] ApplyCore(byte[] encoded)
    {
        using var data=SKData.CreateCopy(encoded);using var codec=SKCodec.Create(data);
        if(codec is null||codec.EncodedFormat is not(SKEncodedImageFormat.Jpeg or SKEncodedImageFormat.Png or SKEncodedImageFormat.Webp)||codec.FrameCount>1||codec.Info.Width>4096||codec.Info.Height>4096||(long)codec.Info.Width*codec.Info.Height>8388608)throw Invalid();
        using var source=SKBitmap.Decode(encoded);
        if(source is null||source.Width<1||source.Height<1||source.Width>4096||source.Height>4096||(long)source.Width*source.Height>8388608)throw Invalid();
        var pixels=source.Pixels;var transparent=pixels.Count(p=>p.Alpha<128);
        if(transparent>=Math.Max(1,pixels.Length/100)&&pixels.Length-transparent>=Math.Max(1,pixels.Length/20))return encoded;
        var width=source.Width;var height=source.Height;
        if(!Key(pixels[0])||!Key(pixels[width-1])||!Key(pixels[(height-1)*width])||!Key(pixels[^1]))throw Invalid();
        var background=new bool[pixels.Length];var removed=0;
        // 保留色不得出現在衣物；同色封閉空隙也須透明，不能只從外框flood fill。
        for(var i=0;i<pixels.Length;i++)if(Key(pixels[i])){background[i]=true;removed++;}
        if(removed<pixels.Length/100||pixels.Length-removed<pixels.Length/20)throw Invalid();
        // 距離場只供邊緣找鄰近未染色的人物顏色；不改動人物內部。
        var distance=new byte[pixels.Length];for(var i=0;i<distance.Length;i++)distance[i]=background[i]?(byte)0:(byte)17;
        for(var y=0;y<height;y++)for(var x=0;x<width;x++){var i=y*width+x;if(x>0)distance[i]=(byte)Math.Min(distance[i],distance[i-1]+1);if(y>0)distance[i]=(byte)Math.Min(distance[i],distance[i-width]+1);}
        for(var y=height-1;y>=0;y--)for(var x=width-1;x>=0;x--){var i=y*width+x;if(x+1<width)distance[i]=(byte)Math.Min(distance[i],distance[i+1]+1);if(y+1<height)distance[i]=(byte)Math.Min(distance[i],distance[i+width]+1);}
        var output=(SKColor[])pixels.Clone();
        for(var y=0;y<height;y++)for(var x=0;x<width;x++){
            var i=y*width+x;if(background[i]){output[i]=SKColors.Transparent;continue;}
            var p=pixels[i];if(distance[i]>16||Math.Min(p.Red,p.Blue)-p.Green<=24)continue;
            var samples=0;double red=0,green=0,blue=0;for(var dy=-16;dy<=16;dy++)for(var dx=-16;dx<=16;dx++){
                var nx=x+dx;var ny=y+dy;if(nx>=0&&nx<width&&ny>=0&&ny<height&&background[ny*width+nx]){var sample=pixels[ny*width+nx];red+=sample.Red;green+=sample.Green;blue+=sample.Blue;samples++;}
            }
            if(samples==0)continue;red/=samples;green/=samples;blue/=samples;
            // 由鄰近實際背景與內側人物顏色投影alpha，避免反解把JPEG雜訊放大成綠邊。
            var best=double.PositiveInfinity;var alpha=0d;SKColor foreground=default;for(var dy=-20;dy<=20;dy++)for(var dx=-20;dx<=20;dx++){
                var nx=x+dx;var ny=y+dy;if(nx<0||nx>=width||ny<0||ny>=height)continue;
                var index=ny*width+nx;var f=pixels[index];
                var magenta=Math.Min(f.Red,f.Blue);
                if(background[index]||magenta-f.Green>24&&magenta>f.Green*1.5+16||distance[index]<4&&magenta-f.Green>24)continue;
                var dr=f.Red-red;var dg=f.Green-green;var db=f.Blue-blue;var norm=dr*dr+dg*dg+db*db;if(norm<1)continue;
                var a=Math.Clamp(((p.Red-red)*dr+(p.Green-green)*dg+(p.Blue-blue)*db)/norm,0,1);
                var er=p.Red-(red+a*dr);var eg=p.Green-(green+a*dg);var eb=p.Blue-(blue+a*db);
                var error=er*er+eg*eg+eb*eb+(dx*dx+dy*dy)*.1;
                if(error>=best)continue;foreground=f;alpha=a;best=error;
            }
            if(double.IsPositiveInfinity(best))continue;
            output[i]=new SKColor(foreground.Red,foreground.Green,foreground.Blue,(byte)Math.Round(p.Alpha*alpha));
        }
        using var result=new SKBitmap(new SKImageInfo(width,height,SKColorType.Rgba8888,SKAlphaType.Unpremul));result.Pixels=output;
        using var image=SKImage.FromBitmap(result);using var png=image.Encode(SKEncodedImageFormat.Png,100);return png.ToArray();
    }
}
