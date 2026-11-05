using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;
using SkiaSharp;

namespace DatingHigh.Unit.Tests.Infrastructure;

public sealed class ImageCompressionTests
{
    public static byte[] Picture(int width=480,int height=640,SKEncodedImageFormat format=SKEncodedImageFormat.Png)
    {
        using var bitmap=new SKBitmap(width,height);
        using(var canvas=new SKCanvas(bitmap))
        {
            canvas.Clear(SKColors.Coral);
            using var paint=new SKPaint{Color=SKColors.Navy};
            canvas.DrawRect(0,0,width/2f,height/2f,paint);
        }
        using var image=SKImage.FromBitmap(bitmap);
        using var data=image.Encode(format,95);
        return data.ToArray();
    }

    [Theory,Trait("Case","AP-UT-035"),Trait("Case","AP-UT-036")]
    [InlineData(SKEncodedImageFormat.Jpeg,"image/jpeg")]
    [InlineData(SKEncodedImageFormat.Png,"image/png")]
    [InlineData(SKEncodedImageFormat.Webp,"image/webp")]
    public async Task Compress_ActualFormats_DecodesWithoutUpscaling(SKEncodedImageFormat format,string mime)
    {
        using var input=new MemoryStream(Picture(format:format));
        var result=await new ImageCompressionService().CompressAsync(input,options:new(mime));
        Assert.InRange(result.Bytes.Length,1,200000);
        Assert.Equal("image/jpeg",result.MimeType);
        Assert.Equal(480,result.Width);Assert.Equal(640,result.Height);
        using var decoded=SKBitmap.Decode(result.Bytes.ToArray());
        Assert.NotNull(decoded);Assert.Equal(result.Width,decoded.Width);
    }

    [Fact,Trait("Case","AP-UT-036")]
    public async Task Compress_SegmentedNonSeekableStream_EnforcesCustomTarget()
    {
        using var input=new Segments(Picture(1600,1200));
        var result=await new ImageCompressionService().CompressAsync(input,3000,new("image/png"));
        Assert.InRange(result.Bytes.Length,1,3000);
        Assert.True(result.Width<=1600&&result.Height<=1200);
        Assert.InRange(Math.Abs((double)result.Width/result.Height-4d/3),0,0.02);
    }

    [Theory,Trait("Case","AP-UT-057"),Trait("Case","AP-UT-058")]
    [InlineData("image/jpeg")][InlineData("image/gif")][InlineData("image/svg+xml")]
    public async Task Compress_ForgedMime_RejectsBeforeReturningBytes(string mime)
    {
        using var input=new MemoryStream(Picture());
        var error=await Assert.ThrowsAsync<DomainException>(()=>new ImageCompressionService().CompressAsync(input,options:new(mime)));
        Assert.Equal("INVALID_IMAGE",error.Code);
    }

    [Fact,Trait("Case","AP-UT-055"),Trait("Case","AP-UT-056")]
    public async Task Compress_StreamOver8MiB_RejectsEvenWithoutLength()
    {
        using var input=new Segments(new byte[8*1024*1024+1],8191);
        var error=await Assert.ThrowsAsync<DomainException>(()=>new ImageCompressionService().CompressAsync(input,options:new("image/png")));
        Assert.Equal(413,error.Status);
    }

    [Fact,Trait("Case","AP-UT-059"),Trait("Case","AP-UT-060")]
    public async Task Compress_ImpossibleByteTarget_DoesNotReturnRawOriginal()
    {
        using var input=new MemoryStream(Picture());
        var error=await Assert.ThrowsAsync<DomainException>(()=>new ImageCompressionService().CompressAsync(input,1,new("image/png")));
        Assert.Equal("COMPRESSED_IMAGE_TOO_LARGE",error.Code);
    }

    [Fact,Trait("Case","AP-UT-057")]
    public async Task Compress_PixelBombAndTruncatedData_Rejects()
    {
        using var input=new MemoryStream(Picture());
        await Assert.ThrowsAsync<DomainException>(()=>new ImageCompressionService().CompressAsync(input,options:new("image/png",MaxPixels:100)));
        using var broken=new MemoryStream(Picture()[..30]);
        await Assert.ThrowsAsync<DomainException>(()=>new ImageCompressionService().CompressAsync(broken,options:new("image/png")));
    }

    [Fact,Trait("Case","AP-UT-036")]
    public async Task Compress_ExifOrientationAndPrivateMetadata_NormalizesAndDropsMetadata()
    {
        var jpeg=Picture(320,480,SKEncodedImageFormat.Jpeg);
        // Synthetic EXIF orientation=6 (90° CW); no real person or GPS data.
        byte[] exif=[0xff,0xe1,0,34,69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,6,0,0,0,0,0,0,0];
        using var input=new MemoryStream([..jpeg[..2],..exif,..jpeg[2..]]);
        var result=await new ImageCompressionService().CompressAsync(input,options:new("image/jpeg"));
        Assert.Equal(480,result.Width);Assert.Equal(320,result.Height);
        Assert.False(result.Bytes.Span.IndexOf("Exif"u8)>=0);
        using var decoded=SKBitmap.Decode(result.Bytes.ToArray());
        Assert.True(decoded.GetPixel(400,50).Blue>decoded.GetPixel(400,50).Red);
    }

    [Fact]
    public async Task Compress_Cancelled_DoesNotDecodeOrSave()
    {
        using var input=new MemoryStream(Picture());
        await Assert.ThrowsAnyAsync<OperationCanceledException>(()=>new ImageCompressionService().CompressAsync(input,ct:new CancellationToken(true)));
    }

    [Theory,Trait("Case","AP-UT-103")]
    [InlineData(160,200)][InlineData(333,777)][InlineData(800,600)]
    public async Task Compress_Exactly200000ByteSegmentedInput_PreservesDimensionsAndDropsPadding(int width,int height)
    {
        var original=Picture(width,height,SKEncodedImageFormat.Jpeg);Assert.True(original.Length<200000);
        var bytes=new byte[200000];original.CopyTo(bytes,0);using var input=new Segments(bytes,97);
        var result=await new ImageCompressionService().CompressAsync(input,options:new("image/jpeg"));
        Assert.InRange(result.Bytes.Length,1,200000);Assert.Equal(width,result.Width);Assert.Equal(height,result.Height);
        Assert.Equal("image/jpeg",result.MimeType);Assert.True(result.Bytes.Length<bytes.Length);
        using var decoded=SKBitmap.Decode(result.Bytes.ToArray());Assert.Equal(width,decoded.Width);Assert.Equal(height,decoded.Height);
    }

    [Theory,Trait("Case","AP-UT-036")]
    [InlineData(1,0)][InlineData(2,1)][InlineData(3,3)][InlineData(4,2)]
    [InlineData(5,0)][InlineData(6,1)][InlineData(7,3)][InlineData(8,2)]
    public async Task Compress_AllEightExifOrigins_OrientEveryCornerAndRemoveExif(int origin,int navyCorner)
    {
        var jpeg=Picture(320,480,SKEncodedImageFormat.Jpeg);
        byte[] exif=[0xff,0xe1,0,34,69,120,105,102,0,0,73,73,42,0,8,0,0,0,1,0,18,1,3,0,1,0,0,0,(byte)origin,0,0,0,0,0,0,0];
        using var input=new Segments([..jpeg[..2],..exif,..jpeg[2..]]);
        var result=await new ImageCompressionService().CompressAsync(input,options:new("image/jpeg"));
        Assert.Equal(origin>=5?480:320,result.Width);Assert.Equal(origin>=5?320:480,result.Height);
        Assert.True(result.Bytes.Span.IndexOf("Exif"u8)<0);using var decoded=SKBitmap.Decode(result.Bytes.ToArray());
        for(var corner=0;corner<4;corner++){
            var x=decoded.Width*(corner%2==0?1:3)/4;var y=decoded.Height*(corner<2?1:3)/4;
            var pixel=decoded.GetPixel(x,y);Assert.Equal(corner==navyCorner,pixel.Blue>pixel.Red);
        }
    }

    [Fact,Trait("Case","AP-UT-059"),Trait("Case","AP-UT-060")]
    public async Task Compress_DecodableHighEntropyPanorama_CannotSilentlyGoBelowMinimumQuality()
    {
        using var bitmap=new SKBitmap(128,8192);var pixels=bitmap.GetPixelSpan();new Random(937).NextBytes(pixels);
        for(var n=3;n<pixels.Length;n+=4)pixels[n]=255;
        using var image=SKImage.FromBitmap(bitmap);using var png=image.Encode(SKEncodedImageFormat.Png,100);
        Assert.InRange(png.Size,1,8*1024*1024);using var input=new Segments(png.ToArray(),8191);
        var error=await Assert.ThrowsAsync<DomainException>(()=>new ImageCompressionService().CompressAsync(input,options:new("image/png")));
        Assert.Equal(413,error.Status);Assert.Equal("COMPRESSED_IMAGE_TOO_LARGE",error.Code);
    }

    private sealed class Segments(byte[] bytes,int segment=73):Stream
    {
        private int position;
        public override bool CanRead=>true;public override bool CanSeek=>false;public override bool CanWrite=>false;
        public override long Length=>throw new NotSupportedException();
        public override long Position{get=>throw new NotSupportedException();set=>throw new NotSupportedException();}
        public override ValueTask<int> ReadAsync(Memory<byte> buffer,CancellationToken cancellationToken=default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var count=Math.Min(Math.Min(segment,buffer.Length),bytes.Length-position);
            bytes.AsMemory(position,count).CopyTo(buffer);position+=count;return ValueTask.FromResult(count);
        }
        public override int Read(byte[] buffer,int offset,int count)=>throw new NotSupportedException();
        public override void Flush()=>throw new NotSupportedException();public override long Seek(long offset,SeekOrigin origin)=>throw new NotSupportedException();
        public override void SetLength(long value)=>throw new NotSupportedException();public override void Write(byte[] buffer,int offset,int count)=>throw new NotSupportedException();
    }
}
