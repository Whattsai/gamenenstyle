using DatingHigh.Application.Media;
using DatingHigh.Domain;
using SkiaSharp;
using System.Security.Cryptography;
namespace DatingHigh.Infrastructure.Media;
/// <summary>固定五欄姿態表：安全解碼、透明間隔及五個不同完整圖格；不取代本人身份／品質檢視。</summary>
public static class AvatarStaticPoseImage
{
    public static CompressedImage Prepare(byte[] encoded)
    {
        var prepared=AvatarChromaMask.Apply(encoded);
        using var image=SKBitmap.Decode(prepared);
        if(image is null||image.Width<1000||image.Height<600||image.Width>4096||image.Height>4096||(long)image.Width*image.Height>8388608)throw new DomainException("AVATAR_POSE_LAYOUT_INVALID",503);
        var hashes=new HashSet<string>(StringComparer.Ordinal);
        for(var index=0;index<5;index++)
        {
            var left=index*image.Width/5;var right=(index+1)*image.Width/5;var solid=0;var minX=right;var maxX=left;var minY=image.Height;var maxY=0;
            for(var y=0;y<image.Height;y++)for(var x=left;x<right;x++)if(image.GetPixel(x,y).Alpha>=128){solid++;minX=Math.Min(minX,x);maxX=Math.Max(maxX,x);minY=Math.Min(minY,y);maxY=Math.Max(maxY,y);}
            if(solid<(right-left)*image.Height/20||solid>(right-left)*image.Height*9/10||minX<=left+1||maxX>=right-2||minY<2||maxY>=image.Height-2||maxY-minY<image.Height*.45)throw new DomainException("AVATAR_POSE_LAYOUT_INVALID",503);
            var sample=new byte[128*256*4];var offset=0;
            for(var y=0;y<256;y++)for(var x=0;x<128;x++){var color=image.GetPixel(left+x*(right-left)/128,y*image.Height/256);sample[offset++]=color.Red;sample[offset++]=color.Green;sample[offset++]=color.Blue;sample[offset++]=color.Alpha;}
            if(!hashes.Add(Convert.ToHexStringLower(SHA256.HashData(sample))))throw new DomainException("AVATAR_POSE_LAYOUT_INVALID",503);
        }
        using var pngImage=SKImage.FromBitmap(image);using var png=pngImage.Encode(SKEncodedImageFormat.Png,100);var bytes=png.ToArray();
        if(bytes.Length>20000000)throw new DomainException("IMAGE_TOO_LARGE",413);
        return new(bytes,"image/png",image.Width,image.Height);
    }
}
