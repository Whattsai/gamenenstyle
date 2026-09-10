using System;
using System.Collections.Generic;
using NUnit.Framework;
using BrickHigh.Domain;
using BrickHigh.Application;

namespace BrickHigh.Tests
{
    public class SaveCompatibilityCheckerTests
    {
        private static SaveHeader Header(int schema, IReadOnlyList<ModelReference> models) => new SaveHeader(
            schema, "0.1.0", Guid.NewGuid(), 1, "real-metres-v1", ModelReferenceDigest.Compute(models));

        [Test, Property("TDD", "UT-148")]
        public void Check_CompatibleAndKnownMigration_DistinguishesWriteEligibility()
        {
            var models = Array.Empty<ModelReference>();
            var checker = new SaveCompatibilityChecker(2, new[] { 1 }, 1, "real-metres-v1", _ => CatalogResult<bool>.Success(true));
            var compatible = checker.Check(Header(2, models), models);
            var migration = checker.Check(Header(1, models), models);
            Assert.That(compatible.Value.Status, Is.EqualTo(CompatibilityStatus.Compatible));
            Assert.That(compatible.Value.CanOpenWritable, Is.True);
            Assert.That(migration.Value.Status, Is.EqualTo(CompatibilityStatus.MigrationRequired));
            Assert.That(migration.Value.CanOpenWritable, Is.False);
        }

        [Test, Property("TDD", "UT-073"), Property("TDD", "UT-148")]
        public void Check_NewerOrUnknownSchema_DoesNotResolveOrWrite()
        {
            var calls = 0;
            var checker = new SaveCompatibilityChecker(2, new[] { 1 }, 1, "real-metres-v1", _ => { calls++; return CatalogResult<bool>.Success(true); });
            var models = Array.Empty<ModelReference>();
            var result = checker.Check(Header(3, models), models);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.UnsupportedSchema));
            Assert.That(result.Error.Message, Is.EqualTo("此存檔版本較新，已保留目前進度。請使用相容版本開啟。"));
            Assert.That(calls, Is.Zero);
        }

        [Test, Property("TDD", "CT-013")]
        public void Check_InvalidHeaderOrReferences_RejectsBeforeAnyLookup()
        {
            var calls = 0;
            var checker = new SaveCompatibilityChecker(1, Array.Empty<int>(), 1, "real-metres-v1", _ => { calls++; return CatalogResult<bool>.Success(true); });
            var empty = Array.Empty<ModelReference>();
            Assert.That(checker.Check(null, empty).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            Assert.That(checker.Check(Header(1, empty), null).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            Assert.That(checker.Check(Header(1, empty), new ModelReference[] { null }).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            Assert.That(checker.Check(Header(1, empty), new[] { new ModelReference(Guid.Empty, Guid.NewGuid(), Guid.NewGuid()) }).Error.Code,
                Is.EqualTo(CatalogErrorCode.InvalidQuery));
            Assert.That(calls, Is.Zero);
        }

        [Test, Property("TDD", "UT-074")]
        public void Check_ExactReferenceMissing_ReturnsIncompatibleWithoutSubstitution()
        {
            var model = new ModelReference(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
            var models = new[] { model, model };
            var calls = new List<ModelReference>();
            var checker = new SaveCompatibilityChecker(1, Array.Empty<int>(), 1, "real-metres-v1", m =>
            { calls.Add(m); return CatalogResult<bool>.Success(false); });
            Assert.That(checker.Check(Header(1, models), models).Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            Assert.That(calls.Count, Is.EqualTo(1));
            Assert.That(calls[0].RevisionId, Is.EqualTo(model.RevisionId));
        }

        [Test, Property("TDD", "CT-013")]
        public void Check_EmptyListStillChecksHeaderAndDigest()
        {
            var checker = new SaveCompatibilityChecker(1, Array.Empty<int>(), 1, "real-metres-v1", _ => CatalogResult<bool>.Success(true));
            var empty = Array.Empty<ModelReference>();
            var wrongScale = new SaveHeader(1, "0.1.0", Guid.NewGuid(), 1, "wrong-scale", ModelReferenceDigest.Compute(empty));
            var wrongDigest = new SaveHeader(1, "0.1.0", Guid.NewGuid(), 1, "real-metres-v1", new string('a', 64));
            Assert.That(checker.Check(wrongScale, empty).Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            Assert.That(checker.Check(wrongDigest, empty).Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
        }
    }
}
