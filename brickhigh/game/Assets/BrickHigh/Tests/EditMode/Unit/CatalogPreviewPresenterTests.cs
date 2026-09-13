using System;
using BrickHigh.Application;
using BrickHigh.Domain;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class CatalogPreviewPresenterTests
    {
        private sealed class Lease : IDisposable
        {
            public int Releases;
            public void Dispose() { Releases++; }
        }
        private readonly Guid snapshot = Guid.NewGuid();
        private VariantDetails Row(string name = "測試磚", Guid? sourceSnapshot = null)
        {
            var variant = Guid.NewGuid();
            return new VariantDetails(variant, name, "System", "Unknown", BrickTier.Basic,
                new ModelReference(sourceSnapshot ?? snapshot, variant, Guid.NewGuid()), "{}",
                "{\"bounds\":[0.032,0.0096,0.016]}", Guid.NewGuid().ToString());
        }
        private CatalogPreviewPresenter<Lease> Presenter(params VariantDetails[] rows)
        {
            var p = new CatalogPreviewPresenter<Lease>(snapshot, PackageKind.Preview);
            p.CompleteSearch(p.BeginSearch(new VariantQuery()), CatalogResult<VariantPage>.Success(new VariantPage(rows, null)));
            return p;
        }

        [Test, Property("TDD", "UT-097")]
        public void CatalogPreviewPresenter_OfflineStartup_ShowsPreview()
        {
            var row = Row();
            using (var p = Presenter(row))
            {
                Assert.That(p.Title, Is.EqualTo("模型預覽"));
                Assert.That(p.Banner, Is.EqualTo("技術預覽・非完整模型庫"));
                Assert.That(p.CanSearch, Is.True);
                Assert.That(p.Rows, Is.EqualTo(new[] { row }));
                Assert.That(p.Model, Is.Null);
            }
        }

        [Test, Property("TDD", "UT-098")]
        public void CatalogPreviewPresenter_PendingLoad_ShowsLoading()
        {
            var row = Row();
            using (var p = Presenter(row))
            {
                var request = p.BeginSelect(row.VariantId);
                Assert.That(p.Message, Is.EqualTo("正在載入本機模型…"));
                Assert.That(p.Model, Is.Null);
                Assert.That(p.IsLoading, Is.True);
                p.CompleteModel(request, CatalogResult<Lease>.Success(new Lease()));
                Assert.That(p.IsLoading, Is.False);
                Assert.That(p.Model, Is.Not.Null);
            }
        }

        [Test, Property("TDD", "UT-100")]
        public void CatalogPreviewPresenter_CombinedFilters_ForwardsStableBrowseQuery()
        {
            using (var p = Presenter())
            {
                var input = new VariantQuery { QueryText = "3001", Family = "System", Tier = BrickTier.Basic,
                    Slot = CharacterSlot.Head, Purpose = CatalogPurpose.CharacterCreation, Cursor = "stale", Limit = 20 };
                var request = p.BeginSearch(input);
                input.QueryText = "changed";
                Assert.That(request.Query.QueryText, Is.EqualTo("3001"));
                Assert.That(request.Query.Family, Is.EqualTo("System"));
                Assert.That(request.Query.Tier, Is.EqualTo(BrickTier.Basic));
                Assert.That(request.Query.Slot, Is.EqualTo(CharacterSlot.Head));
                Assert.That(request.Query.Purpose, Is.EqualTo(CatalogPurpose.Browse));
                Assert.That(request.Query.Cursor, Is.Null);
                request.Query.QueryText = "also changed";
                Assert.That(request.Query.QueryText, Is.EqualTo("3001"));
            }
        }

        [Test, Property("TDD", "UT-101")]
        public void CatalogPreviewPresenter_SelectedItem_ShowsFrozenDetails()
        {
            var row = Row();
            using (var p = Presenter(row))
            {
                var request = p.BeginSelect(row.VariantId);
                Assert.That(request.Model, Is.SameAs(row.Model));
                Assert.That(p.SelectedDetails, Is.SameAs(row));
                Assert.That(p.ProductionStatusText, Is.EqualTo("生產狀態待查"));
                Assert.That(p.SelectedDetails.MetadataJson, Does.Contain("0.032"));
            }
            using (var p = Presenter(Row(sourceSnapshot: Guid.NewGuid())))
            {
                Assert.That(p.Rows, Is.Empty);
                Assert.That(p.ErrorCode, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            }
        }

        [Test, Property("TDD", "UT-102")]
        public void CatalogPreviewPresenter_AppearanceSelection_ChangesModel()
        {
            var a = Row("紅" ); var b = Row("藍"); var old = new Lease(); var current = new Lease();
            using (var p = Presenter(a, b))
            {
                p.CompleteModel(p.BeginSelect(a.VariantId), CatalogResult<Lease>.Success(old));
                var request = p.BeginSelect(b.VariantId);
                Assert.That(old.Releases, Is.EqualTo(1));
                Assert.That(p.Model, Is.Null);
                Assert.That(request.Model.VariantId, Is.EqualTo(b.VariantId));
                p.CompleteModel(request, CatalogResult<Lease>.Success(current));
                Assert.That(p.Model, Is.SameAs(current));
            }
            Assert.That(current.Releases, Is.EqualTo(1));
        }

        [Test, Property("TDD", "UT-109")]
        public void CatalogPreviewPresenter_NoMatches_ShowsEmptyMessage()
        {
            using (var p = Presenter())
            {
                Assert.That(p.Rows, Is.Empty);
                Assert.That(p.Model, Is.Null);
                Assert.That(p.Message, Is.EqualTo("找不到符合條件的模型。"));
            }
        }

        [Test, Property("TDD", "UT-110")]
        public void CatalogPreviewPresenter_EmptyState_KeepsClearAction()
        {
            using (var p = Presenter())
            {
                Assert.That(p.CanClear, Is.True);
                Assert.That(p.ClearText, Is.EqualTo("清除條件"));
                Assert.That(p.ClearFilters(), Is.Not.Null);
                Assert.That(p.IsLoading, Is.True);
            }
        }

        [Test, Property("TDD", "UT-111")]
        public void CatalogPreviewPresenter_ClearFilters_RestoresResults()
        {
            using (var p = Presenter())
            {
                Assert.That(p.Message, Is.EqualTo("找不到符合條件的模型。"));
                Assert.That(p.CanClear, Is.True);
                Assert.That(p.ClearText, Is.EqualTo("清除條件"));
                var request = p.ClearFilters();
                Assert.That(request.Query.QueryText, Is.Null);
                Assert.That(request.Query.Family, Is.Null);
                Assert.That(request.Query.Tier, Is.Null);
                Assert.That(request.Query.Slot, Is.Null);
                Assert.That(request.Query.Cursor, Is.Null);
                p.CompleteSearch(request, CatalogResult<VariantPage>.Success(new VariantPage(new[] { Row() }, null)));
                Assert.That(p.Rows.Count, Is.EqualTo(1));
                Assert.That(p.Message, Is.Empty);
            }
        }

        [Test, Property("TDD", "UT-112")]
        public void CatalogPreviewPresenter_CorruptModel_ShowsRepairGuidance()
        {
            var row = Row();
            using (var p = Presenter(row))
            {
                var failure = CatalogResult<Lease>.Failure(CatalogErrorCode.AssetCorrupt);
                p.CompleteModel(p.BeginSelect(row.VariantId), failure);
                Assert.That(p.Message, Is.EqualTo("此模型檔案不完整，請使用完整安裝包修復。"));
                Assert.That(p.DiagnosticId, Is.EqualTo(failure.Error.DiagnosticId));
                Assert.That(p.CanRetry, Is.False);
            }
        }

        [Test, Property("TDD", "UT-113")]
        public void CatalogPreviewPresenter_FailureView_DoesNotFakeSuccess()
        {
            var row = Row();
            using (var p = Presenter(row))
            {
                p.CompleteModel(p.BeginSelect(row.VariantId), CatalogResult<Lease>.Failure(CatalogErrorCode.AssetCorrupt, "secret stack"));
                Assert.That(p.Model, Is.Null);
                Assert.That(p.Message, Does.Not.Contain("secret"));
                p.CompleteModel(p.BeginSelect(row.VariantId), CatalogResult<Lease>.Success(null));
                Assert.That(p.ErrorCode, Is.EqualTo(CatalogErrorCode.AssetCorrupt));
                Assert.That(p.Model, Is.Null);
            }
        }

        [Test, Property("TDD", "UT-114")]
        public void CatalogPreviewPresenter_CorruptModel_ShowsRepairAndAllowsOtherSelection()
        {
            var a = Row(); var b = Row();
            using (var p = Presenter(a, b))
            {
                var failure = CatalogResult<Lease>.Failure(CatalogErrorCode.AssetCorrupt, "secret stack path token");
                p.CompleteModel(p.BeginSelect(a.VariantId), failure);
                Assert.That(p.Message, Is.EqualTo("此模型檔案不完整，請使用完整安裝包修復。"));
                Assert.That(p.DiagnosticId, Is.EqualTo(failure.Error.DiagnosticId));
                Assert.That(p.Model, Is.Null);
                Assert.That(p.CanRetry, Is.False);
                Assert.That(p.Rows.Count, Is.EqualTo(2));
                p.CompleteModel(p.BeginSelect(b.VariantId), CatalogResult<Lease>.Success(new Lease()));
                Assert.That(p.Model, Is.Not.Null);
                Assert.That(p.SelectedDetails, Is.SameAs(b));
                Assert.That(p.DiagnosticId, Is.Null);
            }
        }

        [Test, Property("TDD", "UT-119"), Property("TDD", "UT-115")]
        public void CatalogPreviewPresenter_LateRetry_DoesNotOverrideNewSelection()
        {
            var a = Row(); var b = Row(); var late = new Lease();
            using (var p = Presenter(a, b))
            {
                p.CompleteModel(p.BeginSelect(a.VariantId), CatalogResult<Lease>.Failure(CatalogErrorCode.StorageUnavailable));
                Assert.That(p.Message, Is.EqualTo("載入失敗，請重試。"));
                var retry = p.BeginRetry();
                Assert.That(retry, Is.Not.Null);
                Assert.That(p.RetryText, Is.EqualTo("重試中…"));
                Assert.That(p.BeginRetry(), Is.Null);
                var selected = p.BeginSelect(b.VariantId);
                Assert.That(retry.CancellationToken.IsCancellationRequested, Is.True);
                Assert.That(p.CompleteModel(retry, CatalogResult<Lease>.Success(late)), Is.False);
                Assert.That(late.Releases, Is.EqualTo(1));
                Assert.That(p.IsLoading, Is.True);
                p.CompleteModel(selected, CatalogResult<Lease>.Success(new Lease()));
                Assert.That(p.SelectedDetails, Is.SameAs(b));
            }
        }

        [Test, Property("TDD", "UT-122")]
        public void CatalogPreviewPresenter_Exit_IgnoresLateSearchAndReleasesLateModel()
        {
            var row = Row(); var lease = new Lease();
            var p = Presenter(row);
            var model = p.BeginSelect(row.VariantId);
            var search = p.BeginSearch(new VariantQuery());
            p.Dispose(); p.Dispose();
            Assert.That(p.CompleteModel(model, CatalogResult<Lease>.Success(lease)), Is.False);
            Assert.That(lease.Releases, Is.EqualTo(1));
            Assert.That(p.CompleteSearch(search, CatalogResult<VariantPage>.Success(new VariantPage(new[] { row }, null))), Is.False);
            Assert.That(p.Rows, Is.Empty);
            Assert.That(p.CanSearch, Is.False);
            Assert.That(p.IsLoading, Is.False);
        }

        [Test, Property("TDD", "UT-117")]
        public void CatalogPreviewPresenter_LateSearch_DoesNotReplaceCurrentPage()
        {
            using (var p = Presenter())
            {
                var first = p.BeginSearch(new VariantQuery { QueryText = "old" });
                var next = p.BeginSearch(new VariantQuery { QueryText = "new" });
                var row = Row("new");
                Assert.That(first.CancellationToken.IsCancellationRequested, Is.True);
                p.CompleteSearch(next, CatalogResult<VariantPage>.Success(new VariantPage(new[] { row }, "next")));
                Assert.That(p.CompleteSearch(first, CatalogResult<VariantPage>.Success(new VariantPage(new[] { Row("old") }, null))), Is.False);
                Assert.That(p.Rows[0], Is.SameAs(row));
                var page = p.BeginNextPage();
                Assert.That(page.Query.QueryText, Is.EqualTo("new"));
                Assert.That(page.Query.Cursor, Is.EqualTo("next"));
                Assert.That(p.BeginNextPage(), Is.Null);
            }
        }

        [Test, Property("TDD", "UT-121")]
        public void CatalogPreviewPresenter_ModelRelease_RemovesInstanceBeforeLease()
        {
            var row = Row(); var lease = new Lease();
            using (var p = Presenter(row))
            {
                p.CompleteModel(p.BeginSelect(row.VariantId), CatalogResult<Lease>.Success(lease));
                bool detached = false;
                p.ReleasingModel += () =>
                {
                    if (p.Model == lease)
                    {
                        Assert.That(lease.Releases, Is.Zero);
                        detached = true;
                    }
                };
                p.BeginSearch(new VariantQuery());
                Assert.That(detached, Is.True);
                Assert.That(lease.Releases, Is.EqualTo(1));
            }
        }
    }
}
