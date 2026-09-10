using NUnit.Framework;
using BrickHigh.Domain;

namespace BrickHigh.Tests
{
    public class CatalogInputPolicyTests
    {
        [Test, Property("TDD", "UT-082")]
        public void VariantPagingPolicy_LimitBounds_EnforcesOneToHundred()
        {
            Assert.That(new VariantQuery().Limit, Is.EqualTo(50));
            foreach (var limit in new[] { 1, 100 })
                Assert.That(CatalogInputPolicy.Validate(new VariantQuery { Limit = limit }), Is.Null);
            foreach (var limit in new[] { 0, -1, 101 })
                Assert.That(CatalogInputPolicy.Validate(new VariantQuery { Limit = limit }), Is.EqualTo(CatalogErrorCode.InvalidQuery));
        }

        [Test, Property("TDD", "UT-155")]
        public void ValidateText_ScalarAndCursorBounds_ReturnsSpecifiedError()
        {
            foreach (var text in new[] { null, "", new string('磚', 256), string.Concat(System.Linq.Enumerable.Repeat("\U0001F9F1", 256)) })
                Assert.That(CatalogInputPolicy.Validate(new VariantQuery { QueryText = text }), Is.Null);
            foreach (var text in new[] { new string('磚', 257), "\ud800", "\udc00" })
                Assert.That(CatalogInputPolicy.Validate(new VariantQuery { QueryText = text }), Is.EqualTo(CatalogErrorCode.InvalidQuery));
            Assert.That(CatalogInputPolicy.Validate(new VariantQuery { Cursor = new string('a', 4096) }), Is.Null);
            foreach (var cursor in new[] { new string('a', 4097), "磚" })
                Assert.That(CatalogInputPolicy.Validate(new VariantQuery { Cursor = cursor }), Is.EqualTo(CatalogErrorCode.InvalidCursor));
            Assert.That(CatalogInputPolicy.EscapeLike("磚'%_\\"), Is.EqualTo("磚'\\%\\_\\\\"));
        }

        [Test, Property("TDD", "UT-060")]
        public void VariantQueryValidator_FailureEnvelope_ExcludesSuccess()
        {
            var error = CatalogResult<string>.Failure(CatalogErrorCode.InvalidQuery);
            Assert.That(error.IsSuccess, Is.False);
            Assert.That(error.Value, Is.Null);
            Assert.That(error.Error.Message, Is.EqualTo("查詢條件無效，請調整後重試。"));
            var success = CatalogResult<string>.Success("ok");
            Assert.That(success.Error, Is.Null);
            Assert.That(success.Value, Is.EqualTo("ok"));
        }
    }
}
