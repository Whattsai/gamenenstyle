using System.Globalization;
using System.Net.Http.Headers;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Infrastructure.Media;

/// <summary>專用 binary bridge；不擴充 Foundation 的 8 KiB 測試物件命令。</summary>
public sealed class PrivateMediaStore(HttpClient http):IPrivateMediaStore
{
    private static HttpRequestMessage Request(CurrentUser user,string assetId,HttpMethod method)
    {
        if(!EntityId.IsValid(assetId)||!EntityId.IsValid(user.AccountId)||!EntityId.IsValid(user.SessionId))
            throw new DomainException("INVALID_REQUEST");
        var request=new HttpRequestMessage(method,$"v1/media/personal-photos/{assetId}");
        request.Headers.Add("X-DatingHigh-Media-Account-Id",user.AccountId);
        request.Headers.Add("X-DatingHigh-Media-Session-Id",user.SessionId);
        request.Headers.Add("X-DatingHigh-Media-Cv",user.CredentialVersion.ToString(CultureInfo.InvariantCulture));
        request.Headers.Add("X-DatingHigh-Media-Expires-At",user.AccessExpiresAt.ToString(CultureInfo.InvariantCulture));
        return request;
    }
    private async Task<HttpResponseMessage> Send(HttpRequestMessage request,CancellationToken ct)
    {
        try
        {
            var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,ct);
            if(response.IsSuccessStatusCode)return response;
            var status=(int)response.StatusCode;response.Dispose();
            throw new DomainException(status switch{401=>"SESSION_REVOKED",404=>"PHOTO_NOT_FOUND",409=>"PHOTO_UPLOAD_CONFLICT",_=>"STORAGE_UNAVAILABLE"},status is 401 or 404 or 409?status:503);
        }
        catch(Exception error)when(error is HttpRequestException||error is OperationCanceledException&&!ct.IsCancellationRequested)
        {throw new DomainException("STORAGE_UNAVAILABLE",503);}
    }
    /// <summary>只傳送已解碼壓縮內容；Worker 負責條件寫入與 ready 提交。</summary>
    public async Task SavePhotoAsync(CurrentUser user,string assetId,CompressedImage image,CancellationToken ct=default)
    {
        if(image.Bytes.Length is <1 or >200000)throw new DomainException("COMPRESSED_IMAGE_TOO_LARGE",413);
        using var request=Request(user,assetId,HttpMethod.Put);
        request.Content=new ReadOnlyMemoryContent(image.Bytes);request.Content.Headers.ContentType=new MediaTypeHeaderValue(image.MimeType);
        using var response=await Send(request,ct);
    }
    /// <summary>逐段接收且核驗長度；小型儲存版本僅存於本次 response 記憶體。</summary>
    public async Task<PrivateMediaContent> ReadPhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default)
    {
        using var request=Request(user,assetId,HttpMethod.Get);
        request.RequestUri=new Uri($"v1/media/assets/{assetId}",UriKind.Relative);
        using var response=await Send(request,ct);
        var mime=response.Content.Headers.ContentType?.MediaType;
        if(mime is not("image/jpeg" or "image/png" or "image/webp")||response.Content.Headers.ContentLength>2000000)
            throw new DomainException("STORAGE_UNAVAILABLE",503);
        using var input=await response.Content.ReadAsStreamAsync(ct);
        using var buffer=new MemoryStream();var chunk=new byte[16384];int count;
        while((count=await input.ReadAsync(chunk,ct))>0)
        {
            if(buffer.Length+count>2000000)throw new DomainException("STORAGE_UNAVAILABLE",503);
            await buffer.WriteAsync(chunk.AsMemory(0,count),ct);
        }
        if(buffer.Length==0||response.Content.Headers.ContentLength is long expected&&buffer.Length!=expected)
            throw new DomainException("STORAGE_UNAVAILABLE",503);
        return new(buffer.ToArray(),mime);
    }
    /// <summary>Worker 再驗 owner 與 D1 tombstone，已刪實體物件可安全重試。</summary>
    public async Task DeletePhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default)
    {
        using var request=Request(user,assetId,HttpMethod.Delete);
        using var response=await Send(request,ct);
    }
}
