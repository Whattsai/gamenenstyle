using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;
using SkiaSharp;

namespace DatingHigh.Unit.Tests.Infrastructure;

public sealed class AvatarChromaMaskTests
{
    private static byte[] Encode(SKBitmap bitmap){using var image=SKImage.FromBitmap(bitmap);using var png=image.Encode(SKEncodedImageFormat.Png,100);return png.ToArray();}
    [Fact]
    public void ControlledMagenta_RemovesBackgroundAndClosedArmGap_WithoutErasingWhiteClothesOrSkin()
    {
        using var source=new SKBitmap(600,800);using(var canvas=new SKCanvas(source)){
            canvas.Clear(new SKColor(255,0,255));using var ink=new SKPaint{Color=SKColors.Black};canvas.DrawRect(180,40,240,720,ink);
            using var white=new SKPaint{Color=SKColors.White};canvas.DrawRect(185,150,230,400,white);
            using var skin=new SKPaint{Color=new SKColor(229,171,143)};canvas.DrawRect(210,60,180,80,skin);
            using var gap=new SKPaint{Color=new SKColor(255,0,255)};canvas.DrawRect(200,260,20,50,gap);
        }
        using var result=SKBitmap.Decode(AvatarChromaMask.Apply(Encode(source)));
        Assert.Equal(source.Width,result.Width);Assert.Equal(source.Height,result.Height);
        Assert.Equal(0,result.GetPixel(0,0).Alpha);Assert.Equal(0,result.GetPixel(205,280).Alpha);
        Assert.Equal(SKColors.White,result.GetPixel(300,200));Assert.Equal(new SKColor(229,171,143),result.GetPixel(300,80));Assert.Equal(SKColors.Black,result.GetPixel(181,400));
    }
    [Fact]
    public void UnknownBackgroundOrEmptySilhouette_IsRejectedRatherThanPretendingToBeTransparent()
    {
        foreach(var color in new[]{SKColors.White,new SKColor(255,0,255)}){
            using var source=new SKBitmap(600,800);source.Erase(color);
            Assert.Equal("AVATAR_TRANSPARENCY_REQUIRED",Assert.Throws<DomainException>(()=>AvatarChromaMask.Apply(Encode(source))).Code);
        }
    }
    [Fact]
    public void ExistingRealAlpha_PreservesSubjectBytesAndDoesNotChromaKeyColoredClothing()
    {
        using var source=new SKBitmap(600,800);source.Erase(SKColors.Transparent);using(var canvas=new SKCanvas(source)){using var paint=new SKPaint{Color=new SKColor(255,0,255)};canvas.DrawRect(180,40,240,720,paint);}
        var bytes=Encode(source);Assert.Equal(bytes,AvatarChromaMask.Apply(bytes));
    }
    [Fact]
    public void ObservedJpegMagentaVariance_IsRemovedWithoutTreatingPalePinkClothingAsBackground()
    {
        using var source=new SKBitmap(600,800);source.Erase(new SKColor(248,49,236));using(var canvas=new SKCanvas(source)){using var paint=new SKPaint{Color=new SKColor(230,140,200)};canvas.DrawRect(180,40,240,720,paint);}
        using var result=SKBitmap.Decode(AvatarChromaMask.Apply(Encode(source)));Assert.Equal(0,result.GetPixel(0,799).Alpha);Assert.Equal(new SKColor(230,140,200),result.GetPixel(300,400));
    }
    [Fact]
    public void JpegChromaBleedAcrossSeveralEdgePixels_DoesNotLeaveAnOpaqueMagentaHalo()
    {
        using var source=new SKBitmap(600,800);source.Erase(new SKColor(255,0,255));using(var canvas=new SKCanvas(source)){
            using var bleed=new SKPaint{Color=new SKColor(170,20,160)};canvas.DrawRect(178,40,244,720,bleed);
            using var ink=new SKPaint{Color=SKColors.Black};canvas.DrawRect(180,42,240,716,ink);
        }
        using var result=SKBitmap.Decode(AvatarChromaMask.Apply(Encode(source)));Assert.True(result.GetPixel(179,400).Alpha<128);Assert.Equal(SKColors.Black,result.GetPixel(181,400));
        var edge=result.GetPixel(179,400);Assert.True(Math.Max(edge.Red,Math.Max(edge.Green,edge.Blue))<24,"Neutral ink edges must not acquire green or magenta spill");
    }
    [Fact]
    public void DarkOutlineBesideWhiteClothes_UsesColorMixtureRatherThanErasingInkWithTheNearestWhiteInterior()
    {
        using var source=new SKBitmap(600,800);source.Erase(new SKColor(255,0,255));using(var canvas=new SKCanvas(source)){
            using var bleed=new SKPaint{Color=new SKColor(150,8,142)};canvas.DrawRect(178,40,244,720,bleed);
            using var ink=new SKPaint{Color=SKColors.Black};canvas.DrawRect(180,42,240,716,ink);
            using var white=new SKPaint{Color=SKColors.White};canvas.DrawRect(181,43,238,714,white);
        }
        using var result=SKBitmap.Decode(AvatarChromaMask.Apply(Encode(source)));var edge=result.GetPixel(179,400);
        Assert.InRange(edge.Alpha,(byte)60,(byte)160);Assert.True(edge.Red<24&&edge.Green<24&&edge.Blue<24);
        Assert.Equal(SKColors.Black,result.GetPixel(180,400));Assert.Equal(SKColors.White,result.GetPixel(184,400));
    }
    [Fact]
    public void DarkMagentaJpegFringe_IsNeverUsedAsAnInteriorForegroundReference()
    {
        using var source=new SKBitmap(600,800);source.Erase(new SKColor(255,0,255));using(var canvas=new SKCanvas(source)){
            using var fringe=new SKPaint{Color=new SKColor(165,8,150)};canvas.DrawRect(176,40,248,720,fringe);
            using var ink=new SKPaint{Color=SKColors.Black};canvas.DrawRect(196,60,208,680,ink);
        }
        using var result=SKBitmap.Decode(AvatarChromaMask.Apply(Encode(source)));var edge=result.GetPixel(188,400);
        Assert.True(edge.Red<24&&edge.Green<24&&edge.Blue<24,"Magenta-contaminated pixels are not a usable foreground color");
    }
}
