using NUnit.Framework;
using BrickHigh.Domain;

namespace BrickHigh.Tests
{
    public class CatalogResultPolicyTests
    {
        [TestCase(CatalogErrorCode.CatalogNotInstalled, "本機模型庫尚未安裝，請使用完整安裝包修復。", false)]
        [TestCase(CatalogErrorCode.CatalogNotPublished, "此模型庫尚未發布，無法使用。", false)]
        [TestCase(CatalogErrorCode.InvalidQuery, "查詢條件無效，請調整後重試。", false)]
        [TestCase(CatalogErrorCode.InvalidCursor, "清單位置已失效，請重新搜尋。", false)]
        [TestCase(CatalogErrorCode.VariantNotFound, "找不到指定的模型。", false)]
        [TestCase(CatalogErrorCode.AssetMissing, "此模型檔案不完整，請使用完整安裝包修復。", false)]
        [TestCase(CatalogErrorCode.AssetCorrupt, "此模型檔案不完整，請使用完整安裝包修復。", false)]
        [TestCase(CatalogErrorCode.UnsupportedSchema, "此存檔版本較新，已保留目前進度。請使用相容版本開啟。", false)]
        [TestCase(CatalogErrorCode.IncompatibleContent, "此存檔與目前版本不相容，原存檔已保留。", false)]
        [TestCase(CatalogErrorCode.StorageUnavailable, "無法寫入本機資料，請檢查權限與可用空間。", true)]
        [TestCase(CatalogErrorCode.Cancelled, "", false)]
        [Property("TDD", "CT-009")]
        public void Failure_ContractMatrix_UsesFixedMessageRetryabilityAndExclusiveValue(
            CatalogErrorCode code, string expectedMessage, bool retryable)
        {
            var result = CatalogResult<string>.Failure(code, "untrusted SQL stack and token");
            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Value, Is.Null);
            Assert.That(result.Error.Code, Is.EqualTo(code));
            Assert.That(result.Error.Message, Is.EqualTo(expectedMessage));
            Assert.That(result.Error.Retryable, Is.EqualTo(retryable));
            Assert.That(result.Error.DiagnosticId, Does.Match("^[0-9a-f]{32}$"));
        }

        [Test, Property("TDD", "CT-009")]
        public void Success_ContractMatrix_ExcludesError()
        {
            var result = CatalogResult<string>.Success("model");
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Value, Is.EqualTo("model"));
            Assert.That(result.Error, Is.Null);
        }

        [Test, Property("TDD", "UT-060")]
        public void Failure_ArbitraryDiagnosticText_NeverBecomesPlayerMessage()
        {
            var error = CatalogResult<bool>.Failure(CatalogErrorCode.AssetCorrupt,
                "SQL SELECT secret_token FROM profile; at C:\\private\\stack.cs");
            Assert.That(error.IsSuccess, Is.False);
            Assert.That(error.Value, Is.False);
            Assert.That(error.Error.Message, Is.EqualTo(CatalogError.Describe(CatalogErrorCode.AssetCorrupt)));
            Assert.That(error.Error.Message, Does.Not.Contain("secret_token"));
            Assert.That(error.Error.Message, Does.Not.Contain("stack.cs"));
            Assert.That(error.Error.DiagnosticId, Is.Not.Empty);
        }

        [Test, Property("TDD", "UT-060")]
        public void Failure_ApprovedNativeAndPreviewMessages_RemainAvailable()
        {
            Assert.That(CatalogResult<bool>.Failure(CatalogErrorCode.AssetMissing,
                "必要執行檔不完整，請使用完整安裝包修復。").Error.Message,
                Is.EqualTo("必要執行檔不完整，請使用完整安裝包修復。"));
            Assert.That(CatalogResult<bool>.Failure(CatalogErrorCode.IncompatibleContent,
                "此資產包僅供技術預覽，不能作為正式遊戲資料。").Error.Message,
                Is.EqualTo("此資產包僅供技術預覽，不能作為正式遊戲資料。"));
        }
    }
}
