using SkiaSharp;

namespace DatingHigh.Infrastructure.Media;

/// <summary>以去背後的像素分布拒絕明顯裁切、缺腿或缺鞋的站姿套組；不取代人工身份與美術檢視。</summary>
public static class AvatarFullBodyQuality
{
    public static bool HasCompleteStandingFigure(SKBitmap image)
        => GetStandingFigureFailure(image) is null;

    /// <summary>供測試分辨像素結構拒絕原因；不回傳圖片內容。</summary>
    public static string? GetStandingFigureFailure(SKBitmap image)
    {
        if(image.Width<600||image.Height<800||Math.Abs((double)image.Width/image.Height-0.75)>0.015)return "dimensions";
        var width=image.Width;var height=image.Height;var minX=width;var maxX=-1;var top=height;var bottom=-1;
        for(var y=0;y<height;y++)for(var x=0;x<width;x++)if(image.GetPixel(x,y).Alpha>=128){
            minX=Math.Min(minX,x);maxX=Math.Max(maxX,x);top=Math.Min(top,y);bottom=Math.Max(bottom,y);
        }
        if(bottom<0)return "empty";
        var figureWidth=maxX-minX+1;
        // 頭髮要在上方安全區內，鞋底需完整出現在畫布內且不可貼齊／被裁到邊界。
        if(top>height*0.16||bottom<height*0.92||bottom>=height-1)return "head-or-sole-clipped";
        var center=minX+figureWidth/2;
        var sideThreshold=Math.Max(12,(int)Math.Ceiling(figureWidth*0.012));
        var legWidths=MeasureMaximumRowWidths(image,minX,center,maxX+1,(int)(height*0.66),(int)(height*0.84));
        if(legWidths.Left<sideThreshold||legWidths.Right<sideThreshold)return "missing-leg";

        var footTop=(int)(height*0.90);var footBottom=(int)(height*0.985);
        var minimumFootArea=Math.Max(120,(int)Math.Ceiling(figureWidth*height*0.008));
        var leftArea=CountPixels(image,minX,center,footTop,footBottom);
        var rightArea=CountPixels(image,center,maxX+1,footTop,footBottom);
        return leftArea>=minimumFootArea&&rightArea>=minimumFootArea?null:"missing-foot";
    }

    private static (int Left,int Right) MeasureMaximumRowWidths(SKBitmap image,int minX,int center,int maxX,int startY,int endY)
    {
        var left=0;var right=0;
        for(var y=Math.Max(0,startY);y<Math.Min(image.Height,endY);y++){
            var leftRow=0;for(var x=Math.Max(0,minX);x<Math.Min(center,image.Width);x++)if(image.GetPixel(x,y).Alpha>=128)leftRow++;
            var rightRow=0;for(var x=Math.Max(center,0);x<Math.Min(maxX,image.Width);x++)if(image.GetPixel(x,y).Alpha>=128)rightRow++;
            left=Math.Max(left,leftRow);right=Math.Max(right,rightRow);
        }
        return (left,right);
    }

    private static int CountPixels(SKBitmap image,int minX,int maxX,int startY,int endY)
    {
        var count=0;
        for(var y=Math.Max(0,startY);y<Math.Min(image.Height,endY);y++)for(var x=Math.Max(0,minX);x<Math.Min(maxX,image.Width);x++)if(image.GetPixel(x,y).Alpha>=128)count++;
        return count;
    }
}
