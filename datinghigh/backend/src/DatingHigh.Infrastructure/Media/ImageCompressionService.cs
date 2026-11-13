using DatingHigh.Application.Media;
using DatingHigh.Domain;
using SkiaSharp;

namespace DatingHigh.Infrastructure.Media;

/// <summary>Skia 安全解碼後繪製全新 sRGB bitmap；原始圖片從不寫檔或傳到 R2。</summary>
public sealed class ImageCompressionService:IImageCompressionService
{
    // 限制每個 API process 同時解碼的記憶體；等待者仍受 request cancellation 控制。
    private static readonly SemaphoreSlim Decoders=new(2);
    public async Task<CompressedImage> CompressAsync(Stream input,int targetBytes=200_000,ImageCompressionOptions? options=null,CancellationToken ct=default)
    {
        options??=new();
        if(targetBytes<1||options.MaxPixels<1||options.MaxDimension<1||options.MaxInputBytes<1||options.MinimumWidth<1||options.MinimumHeight<1)
            throw new ArgumentOutOfRangeException(nameof(targetBytes));
        if(options.LosslessWebp&&!options.PreserveTransparency)throw new ArgumentException("Lossless WebP requires transparent output",nameof(options));
        await Decoders.WaitAsync(ct);
        try
        {
            using var buffer=new MemoryStream();var chunk=new byte[16384];int read;
            while((read=await input.ReadAsync(chunk,ct))>0)
            {
                if(buffer.Length+read>options.MaxInputBytes)throw new DomainException("IMAGE_TOO_LARGE",413);
                await buffer.WriteAsync(chunk.AsMemory(0,read),ct);
            }
            ct.ThrowIfCancellationRequested();
            using var data=SKData.CreateCopy(buffer.GetBuffer().AsSpan(0,checked((int)buffer.Length)));
            using var codec=SKCodec.Create(data);
            if(codec is null)throw new DomainException("INVALID_IMAGE");
            var mime=codec.EncodedFormat switch{
                SKEncodedImageFormat.Jpeg=>"image/jpeg",SKEncodedImageFormat.Png=>"image/png",SKEncodedImageFormat.Webp=>"image/webp",_=>null
            };
            var info=codec.Info;
            if(mime is null||options.DeclaredMimeType is not null&&options.DeclaredMimeType!=mime||
               info.Width<1||info.Height<1||info.Width>options.MaxDimension||info.Height>options.MaxDimension||
               (long)info.Width*info.Height>options.MaxPixels||codec.FrameCount>1)
                throw new DomainException("INVALID_IMAGE");
            using var colorSpace=SKColorSpace.CreateSrgb();
            using var decoded=new SKBitmap(new SKImageInfo(info.Width,info.Height,SKColorType.Rgba8888,SKAlphaType.Premul,colorSpace));
            if(codec.GetPixels(decoded.Info,decoded.GetPixels())!=SKCodecResult.Success)
                throw new DomainException("INVALID_IMAGE");
            var rotated=(int)codec.EncodedOrigin>=5;
            var width=rotated?info.Height:info.Width;var height=rotated?info.Width:info.Height;
            if(width<options.MinimumWidth||height<options.MinimumHeight)throw new DomainException("IMAGE_RESOLUTION_TOO_LOW");
            var alpha=options.PreserveTransparency?SKAlphaType.Premul:SKAlphaType.Opaque;
            var background=options.PreserveTransparency?SKColors.Transparent:SKColors.White;
            using var normalized=new SKBitmap(new SKImageInfo(width,height,SKColorType.Rgba8888,alpha,colorSpace));
            using(var canvas=new SKCanvas(normalized))
            {
                canvas.Clear(background);
                var w=info.Width;var h=info.Height;
                var values=(int)codec.EncodedOrigin switch{
                    2=>(-1f,0f,(float)w,0f,1f,0f),3=>(-1f,0f,(float)w,0f,-1f,(float)h),
                    4=>(1f,0f,0f,0f,-1f,(float)h),5=>(0f,1f,0f,1f,0f,0f),
                    6=>(0f,-1f,(float)h,1f,0f,0f),7=>(0f,-1f,(float)h,-1f,0f,(float)w),
                    8=>(0f,1f,0f,-1f,0f,(float)w),_=>(1f,0f,0f,0f,1f,0f)
                };
                canvas.SetMatrix(new SKMatrix{ScaleX=values.Item1,SkewX=values.Item2,TransX=values.Item3,
                    SkewY=values.Item4,ScaleY=values.Item5,TransY=values.Item6,Persp2=1});
                using var pixels=SKImage.FromBitmap(decoded);
                canvas.DrawImage(pixels,0,0,new SKSamplingOptions(SKFilterMode.Nearest));
            }
            using var original=SKImage.FromBitmap(normalized);
            while(true)
            {
                ct.ThrowIfCancellationRequested();
                using var resized=new SKBitmap(new SKImageInfo(width,height,SKColorType.Rgba8888,alpha,colorSpace));
                using(var canvas=new SKCanvas(resized))
                {
                    canvas.Clear(background);
                    canvas.DrawImage(original,new SKRect(0,0,width,height),new SKSamplingOptions(SKFilterMode.Linear,SKMipmapMode.Linear));
                }
                using var image=SKImage.FromBitmap(resized);
                if(options.LosslessWebp){
                    using var pixmap=resized.PeekPixels();using var output=pixmap.Encode(new SKWebpEncoderOptions(SKWebpEncoderCompression.Lossless,100));
                    if(output is not null&&output.Size<=targetBytes)return new(output.ToArray(),"image/webp",width,height);
                }
                else for(var quality=96;quality>=60;quality-=4)
                {
                    ct.ThrowIfCancellationRequested();
                    using var output=image.Encode(options.PreserveTransparency?SKEncodedImageFormat.Webp:SKEncodedImageFormat.Jpeg,quality);
                    if(output is not null&&output.Size<=targetBytes)
                        return new(output.ToArray(),options.PreserveTransparency?"image/webp":"image/jpeg",width,height);
                }
                if(Math.Min(width,height)<=128)throw new DomainException("COMPRESSED_IMAGE_TOO_LARGE",413);
                var scale=Math.Max(0.8,128d/Math.Min(width,height));
                var nextWidth=Math.Max(1,(int)(width*scale));var nextHeight=Math.Max(1,(int)(height*scale));
                if(nextWidth<options.MinimumWidth||nextHeight<options.MinimumHeight)throw new DomainException("COMPRESSED_IMAGE_TOO_LARGE",413);
                width=nextWidth;height=nextHeight;
            }
        }
        finally{Decoders.Release();}
    }
}
