import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parseAvatarChecklist} from './avatar-traceability-parser.mjs';

const acceptanceScope={decisions:['D-051','D-052'],platforms:['web','android'],excluded:['accessibility-specialist-implementation-and-acceptance'],deferred:['ios'],note:'無障礙不在目前整個遊戲MVP範圍；iOS暫緩。原始275項比例不是調整範圍後的完成率。'};
// 原SPEC只交付內部資料契約；以下案例的既存正向配對／雙方同意／終止前置由後續SPEC提供。
// 未同意時的拒絕、本人媒體保護及白名單契約仍在本份驗收範圍，不能一起略過。
const futureIntegrationIds=new Set([
 'AP-UT-007','AP-UT-008','AP-UT-019','AP-UT-020','AP-UT-021','AP-UT-022','AP-UT-023','AP-UT-024','AP-UT-025','AP-UT-026','AP-UT-051','AP-UT-052','AP-UT-087','AP-UT-088','AP-UT-109','AP-UT-110',
 'AP-IT-004','AP-IT-010','AP-IT-011','AP-IT-012','AP-IT-013','AP-IT-026','AP-IT-044','AP-IT-055','AP-IT-060','AP-IT-065'
]);

// 人工覆核的完整ID與證據，不因測試名稱含ID自動判定通過。
const approved={
 'backend/tests/DatingHigh.Api.Tests/PhotoHttpContractTests.cs':['AP-API-013','AP-API-014','AP-API-015','AP-API-020','AP-API-021','AP-API-022','AP-API-026','AP-API-040'],
 'backend/tests/DatingHigh.Api.Tests/AvatarHttpContractTests.cs':['AP-API-028','AP-API-029','AP-API-030','AP-API-031','AP-API-032','AP-API-034','AP-API-035','AP-API-036','AP-API-042','AP-API-043','AP-API-044'],
 'backend/tests/DatingHigh.Integration.Tests/ProfileCatalogIntegrationTests.cs':['AP-IT-009'],
 'tests/e2e/android/avatar-gemini-live.mjs':['AP-E2E-014','AP-E2E-020','AP-E2E-040'],
 'tests/e2e/android/avatar-preferences.mjs':['AP-E2E-002','AP-E2E-005'],
 'backend/tests/DatingHigh.Unit.Tests/Application/PersonalPhotosApplicationTests.cs':['AP-UT-003','AP-UT-004','AP-UT-056','AP-UT-058','AP-UT-060','AP-UT-061','AP-UT-062','AP-UT-077','AP-UT-078'],
 'backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs':['AP-UT-013','AP-UT-014','AP-UT-015','AP-UT-016','AP-UT-017','AP-UT-018','AP-UT-027','AP-UT-028','AP-UT-048','AP-UT-083'],
 'backend/tests/DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs':['AP-UT-039','AP-UT-041','AP-UT-047','AP-UT-073','AP-UT-113'],
 'backend/tests/DatingHigh.Unit.Tests/Infrastructure/ImageCompressionTests.cs':['AP-UT-035','AP-UT-036','AP-UT-055','AP-UT-057','AP-UT-059','AP-UT-103'],
 'backend/tests/DatingHigh.Unit.Tests/Infrastructure/AvatarGeneratorTests.cs':['AP-UT-067'],
 'backend/tests/DatingHigh.Unit.Tests/Application/AvatarApplicationTests.cs':['AP-UT-068','AP-UT-119','AP-UT-121'],
 'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs':['AP-IT-002','AP-IT-003','AP-IT-006','AP-IT-007','AP-IT-008','AP-IT-014','AP-IT-020','AP-IT-022','AP-IT-024','AP-IT-027','AP-IT-038','AP-IT-058'],
 'cloudflare/tests/avatar-preferences-d1.integration.test.ts':['AP-IT-049','AP-IT-059'],
 'cloudflare/tests/photo-media-d1-r2.integration.test.ts':['AP-IT-039'],
 'cloudflare/tests/avatar-attempt-r2.integration.test.ts':['AP-IT-035','AP-IT-037','AP-IT-040','AP-IT-053','AP-IT-054','AP-IT-063','AP-IT-064','AP-IT-066','AP-IT-067','AP-IT-069'],
 'cloudflare/tests/avatar-worker-cas.integration.test.ts':['AP-IT-068'],
 'backend/tests/DatingHigh.Api.Tests/DatingProfileEndpointTests.cs':['AP-API-010','AP-API-011','AP-API-012','AP-API-041'],
 'backend/tests/DatingHigh.Api.Tests/ProfileReadContractTests.cs':['AP-API-001','AP-API-002','AP-API-003','AP-API-004','AP-API-005','AP-API-006','AP-API-007','AP-API-008','AP-API-009','AP-API-017','AP-API-018','AP-API-033','AP-API-038','AP-API-039'],
 'backend/tests/DatingHigh.Api.Tests/PersonalPhotoEndpointTests.cs':['AP-API-016','AP-API-019','AP-API-023','AP-API-024'],
 'backend/tests/DatingHigh.Api.Tests/PersonalMediaEndpointTests.cs':['AP-API-025','AP-API-027'],
 'backend/tests/DatingHigh.Api.Tests/CardPreviewEndpointTests.cs':['AP-API-037'],
 'tests/e2e/web/avatar-expiry-ui.spec.ts':['AP-E2E-022'],
 'tests/e2e/web/avatar-gemini-live.spec.ts':['AP-E2E-013','AP-E2E-016','AP-E2E-019','AP-E2E-039'],
 'tests/e2e/web/avatar-preferences.spec.ts':['AP-E2E-001','AP-E2E-004','AP-E2E-007','AP-E2E-010','AP-E2E-028'],
};
const file='docs/tdd/SPEC-001-AvatarAndPreferences-TDD.md';
const parsed=parseAvatarChecklist(fs.readFileSync(file,'utf8'));
let source=parsed.source;const entries=parsed.entries;
assert.equal(entries.length,275);
const anchors={
 'AP-E2E-022':'AP Web controlled error UI:',
 'AP-E2E-002':'Native picker cancelled without a false success',
 'AP-E2E-005':'Native all sixteen portraits and cross-group selection verified',
 'AP-UT-015':'Read_AdultMinimumWithOptionalOccupation',
 'AP-UT-016':'Read_AdultMinimumWithOptionalOccupation',
 'AP-UT-027':'OwnPreview_AlwaysReadsCurrentFieldsAndPhotos',
 'AP-UT-028':'OwnPreview_AlwaysReadsCurrentFieldsAndPhotos',
 'AP-UT-048':'Read_AdultMinimumWithOptionalOccupation',
 'AP-IT-022':'IndependentClients_ConcurrentFifthAndSixth',
 'AP-IT-049':'every media command rejects caller-supplied identity',
 'AP-IT-059':'every media command rejects caller-supplied identity',
 'AP-IT-053':'only completed owner indices one and two read',
 'AP-API-013':'BinaryPhotoPost_UsesItsOwnLimit',
 'AP-API-014':'PhotoPost_InvalidHugeFullAndRevoked',
 'AP-API-015':'PhotoWrites_EnforceOriginalTransportOriginContentTypeAndJsonLimits',
 'AP-API-020':'Reorder_InvalidForeignDuplicateAndStale',
 'AP-API-021':'PhotoWrites_EnforceOriginalTransportOriginContentTypeAndJsonLimits',
 'AP-API-022':'Delete_204RemovesCurrentMetadataAndBytes',
 'AP-API-026':'MediaRead_MissingRevokedAndOwnerQuery',
 'AP-API-040':'BinaryPhotoPost_UsesItsOwnLimit',
 'AP-API-041':'ProfilePutGet_RetainsAllPreferenceKeysAndRetiredCode',
 'AP-API-028':'Generation_ReturnsExactlyOneSafeCamelCaseResult',
 'AP-API-029':'GenerationFailures_Project503Or429',
 'AP-API-030':'AvatarWrites_KeepStrictJsonGlobalLimitAndOriginRules',
 'AP-API-031':'CandidateRead_ReturnsPrivateBinary',
 'AP-API-032':'CandidateRead_ReturnsPrivateBinary',
 'AP-API-033':'OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative',
 'AP-API-034':'Selection_ReturnsOnlyCommittedReceipt',
 'AP-API-035':'Selection_RejectedInputsStaleRevisionAndUnavailableSavedAsset',
 'AP-API-036':'AvatarWrites_KeepStrictJsonGlobalLimitAndOriginRules',
 'AP-API-042':'Generation_ReturnsExactlyOneSafeCamelCaseResult',
 'AP-API-043':'Continuation_ForwardsAttemptStyleCountAndRequest',
 'AP-API-044':'Generation_ProjectsReplayAndRejectedLease',
 'AP-UT-017':'VersionedCatalog_AllFiveInterestCategories',
 'AP-UT-018':'RetiredCatalogCode_RemainsReadable',
 'AP-IT-009':'RetiringKnownCode_RealApplicationD1',
 'AP-IT-006':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-IT-007':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-IT-008':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-IT-014':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-IT-020':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-IT-024':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-IT-027':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
 'AP-E2E-014':'Native third-party disclosure verified before generation',
 'AP-E2E-020':'native-return-to-second-candidate',
 'AP-E2E-040':'Native adoption confirmation reached',
 'AP-UT-003':'Upload_SendsOnlyReencodedBytes',
 'AP-UT-004':'Upload_SendsOnlyReencodedBytes',
 'AP-UT-056':'InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo',
 'AP-UT-058':'InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo',
 'AP-UT-059':'Compress_DecodableHighEntropyPanorama',
 'AP-UT-060':'InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo',
 'AP-UT-061':'DeniedReservation_DistinguishesQuotaAndRevokedFamily',
 'AP-UT-062':'DeniedReservation_DistinguishesQuotaAndRevokedFamily',
 'AP-UT-077':'StorageFailure_CancelsPendingBeforeDeletingCopy',
 'AP-UT-078':'StorageFailure_CancelsPendingBeforeDeletingCopy',
 'AP-UT-103':'Compress_Exactly200000ByteSegmentedInput',
 'AP-IT-035':'byte-identical output adds no index',
 'AP-IT-037':'59:59 readable, exactly 60:00 and 60:01',
 'AP-IT-040':'an overlapping adoption cannot commit a formal image removed',
 'AP-IT-054':'simultaneous different choices at one revision',
 'AP-IT-063':'an overlapping adoption cannot commit a formal image removed',
 'AP-IT-064':'59:59 readable, exactly 60:00 and 60:01',
 'AP-API-038':'OwnGetRoutes_RejectRevocationAndOwnerQueryWithoutWritesOrPrivateDto',
 'AP-API-039':'OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative',
 'AP-UT-083':'InvalidBusinessFields_RejectsBeforePersistence',
 'AP-UT-068':'ThirdCandidateWithoutImage_PreservesTwoReadableAdoptableCandidatesAndDoesNotRetry',
 'AP-IT-003':'UploadReadOrderDelete_RealD1R2',
 'AP-IT-038':'ForeignCandidateAndFormalSelection_RealApplicationD1R2',
 'AP-IT-039':'R2 put failure tombstones pending',
 'AP-IT-066':'refreshed session still gets 410',
 'AP-IT-067':'adoption closes the round and saves only one',
 'AP-IT-068':'two actual Worker instances share account lock',
 'AP-API-001':'Catalogs_WebCookieAndNativeBearer_ReturnCompleteVersionedSafeDto',
 'AP-API-002':'OwnGetRoutes_RejectRevocationAndOwnerQueryWithoutWritesOrPrivateDto',
 'AP-API-003':'OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative',
 'AP-API-004':'Catalogs_WebCookieAndNativeBearer_ReturnCompleteVersionedSafeDto',
 'AP-API-005':'OwnGetRoutes_RejectRevocationAndOwnerQueryWithoutWritesOrPrivateDto',
 'AP-API-006':'OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative',
 'AP-API-007':'OwnProfileAndPhotoReads_ReturnExactSafeFieldsAndOrderedCurrentMetadata',
 'AP-API-008':'OwnGetRoutes_RejectRevocationAndOwnerQueryWithoutWritesOrPrivateDto',
 'AP-API-009':'OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative',
 'AP-API-017':'OwnGetRoutes_RejectRevocationAndOwnerQueryWithoutWritesOrPrivateDto',
 'AP-API-018':'OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative',
 'AP-E2E-001':'empty photo picker cancellation keeps notice and never uploads',
 'AP-E2E-004':"name:'選用 female-05'",
 'AP-E2E-007':'oversize.jpg',
 'AP-E2E-010':'three photos reorder, stale revision and delete confirmation',
 'AP-E2E-028':"name:'名片照片 1'",
 'AP-E2E-013':'產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理',
 'AP-E2E-016':'four Gemini candidates, two-tab race, replay',
 'AP-E2E-019':'const digests:string[]',
 'AP-E2E-039':"name:'取消'",
};
const additionalReviews=[
 [
  [
   "AP-UT-001"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "UploadReadOrderDelete_RealD1R2"
 ],
 [
  [
   "AP-UT-002"
  ],
  "frontend/client/tests/unit/dating-profile-screen.test.tsx",
  "AP-BDD-057 selecting and cancelling"
 ],
 [
  [
   "AP-UT-005",
   "AP-UT-006"
  ],
  "cloudflare/tests/avatar-preferences-d1.integration.test.ts",
  "exact own ready set receives dense order"
 ],
 [
  [
   "AP-UT-009",
   "AP-UT-010"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs",
  "BuiltinCatalog_IsSixteenDistinctStableIds"
 ],
 [
  [
   "AP-UT-011",
   "AP-UT-012",
   "AP-UT-040",
   "AP-UT-053",
   "AP-UT-054"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement"
 ],
 [
  [
   "AP-UT-029",
   "AP-UT-030",
   "AP-UT-031",
   "AP-UT-032",
   "AP-UT-033",
   "AP-UT-034",
   "AP-UT-114",
   "AP-UT-115",
   "AP-UT-116",
   "AP-UT-117",
   "AP-IT-015",
   "AP-IT-016",
   "AP-IT-017"
  ],
  "tests/integration/avatar-controlled-host.test.mjs",
  "Controlled adoption creates only the selected real image"
 ],
 [
  [
   "AP-UT-042"
  ],
  "frontend/client/tests/unit/dating-profile-screen.test.tsx",
  "entering AI page never sends photos"
 ],
 [
  [
   "AP-UT-043",
   "AP-UT-044",
   "AP-UT-093",
   "AP-UT-094",
   "AP-IT-031",
   "AP-IT-047",
   "AP-IT-057"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "IndependentClients_ConcurrentFifthAndSixth"
 ],
 [
  [
   "AP-UT-049",
   "AP-UT-050",
   "AP-IT-021",
   "AP-IT-025"
  ],
  "tests/integration/avatar-controlled-host.test.mjs",
  "Controlled host rejects insufficient photos"
 ],
 [
  [
   "AP-UT-069",
   "AP-UT-070"
  ],
  "cloudflare/tests/avatar-attempt-r2.integration.test.ts",
  "byte-identical output adds no index"
 ],
 [
  [
   "AP-UT-071",
   "AP-UT-072",
   "AP-UT-120",
   "AP-IT-034",
   "AP-IT-036"
  ],
  "tests/integration/avatar-controlled-host.test.mjs",
  "Controlled native avatar host keeps earlier real R2 candidates"
 ],
 [
  [
   "AP-UT-074"
  ],
  "cloudflare/tests/avatar-attempt-r2.integration.test.ts",
  "59:59 readable, exactly 60:00 and 60:01"
 ],
 [
  [
   "AP-UT-075",
   "AP-UT-076"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "ForeignCandidateAndFormalSelection_RealApplicationD1R2"
 ],
 [
  [
   "AP-UT-079",
   "AP-UT-080"
  ],
  "cloudflare/tests/avatar-attempt-r2.integration.test.ts",
  "an overlapping adoption cannot commit a formal image removed"
 ],
 [
  [
   "AP-UT-081"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs",
  "InvalidBusinessFields_RejectsBeforePersistence"
 ],
 [
  [
   "AP-UT-082",
   "AP-IT-041",
   "AP-IT-042",
   "AP-IT-050",
   "AP-IT-051"
  ],
  "backend/tests/DatingHigh.Integration.Tests/ProfileCatalogIntegrationTests.cs",
  "ProfileBounds_RealD1_MaximumReachableSetsTaiwanBirthdayAndInvalidWritesPreserveAllRows"
 ],
 [
  [
   "AP-UT-084"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs",
  "Read_TrustedTaiwanAgeBoundary_CannotTreatMissingOrUnderageBirthdayAsReady"
 ],
 [
  [
   "AP-UT-085",
   "AP-UT-086"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Application/ProfileProjectionTests.cs",
  "FutureConsentIntegration_DefaultDeny_CannotBeEnabledByClientBoolean"
 ],
 [
  [
   "AP-UT-089",
   "AP-UT-090"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs",
  "Save_UsesVerifiedOwnerSessionAndReturnsRevision_CasConflictRejected"
 ],
 [
  [
   "AP-UT-091",
   "AP-UT-092",
   "AP-IT-046"
  ],
  "cloudflare/tests/avatar-preferences-d1.integration.test.ts",
  "missing, duplicate, pending, foreign and revoked are rejected without partial writes"
 ],
 [
  [
   "AP-UT-095",
   "AP-UT-096",
   "AP-IT-048"
  ],
  "cloudflare/tests/photo-media-d1-r2.integration.test.ts",
  "four ready plus one pending already exhaust quota"
 ],
 [
  [
   "AP-UT-097",
   "AP-UT-098"
  ],
  "cloudflare/tests/avatar-preferences-d1.integration.test.ts",
  "every media command rejects caller-supplied identity"
 ],
 [
  [
   "AP-UT-099",
   "AP-UT-100"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs",
  "TaiwanCalendar_AgeBoundaryAndLeapDay_UsesDateOnly"
 ],
 [
  [
   "AP-UT-101",
   "AP-UT-102"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs",
  "MaximumReachableCatalogSets_PersistCanonicalCodesWithoutDroppingSelections"
 ],
 [
  [
   "AP-UT-105",
   "AP-UT-106"
  ],
  "cloudflare/tests/avatar-attempt-r2.integration.test.ts",
  "only completed owner indices one and two read"
 ],
 [
  [
   "AP-UT-107",
   "AP-UT-108"
  ],
  "cloudflare/tests/avatar-attempt-r2.integration.test.ts",
  "simultaneous different choices at one revision"
 ],
 [
  [
   "AP-UT-118"
  ],
  "cloudflare/tests/avatar-worker-cas.integration.test.ts",
  "two actual Worker instances share account lock"
 ],
 [
  [
   "AP-E2E-008",
   "AP-E2E-011"
  ],
  "tests/e2e/android/avatar-managed.mjs",
  "if(mode==='photos')"
 ],
 [
  [
   "AP-E2E-017",
   "AP-E2E-023"
  ],
  "tests/e2e/android/avatar-controlled.mjs",
  "'busy'"
 ],
 [
  [
   "AP-E2E-025"
  ],
  "tests/e2e/web/avatar-preferences.spec.ts",
  "specific birthday and paired-age feedback"
 ],
 [
  [
   "AP-E2E-031"
  ],
  "tests/e2e/web/avatar-preferences.spec.ts",
  "no consent exposes no other-player photo entry"
 ],
 [
  [
   "AP-E2E-034"
  ],
  "tests/e2e/web/avatar-preferences.spec.ts",
  "const reread="
 ],
 [
  [
   "AP-UT-037",
   "AP-UT-038",
   "AP-IT-019",
   "AP-IT-061"
  ],
  "docs/verification/SPEC-001-AvatarAndPreferences-Verification.md",
  "2026-11-04另以相同兩張授權來源執行一次單張匿名量測"
 ],
 [
  [
   "AP-UT-045",
   "AP-UT-046",
   "AP-IT-023"
  ],
  "frontend/client/tests/unit/dating-profile-screen.test.tsx",
  "leaving and reopening an unadopted round restores safe references"
 ],
 [
  [
   "AP-UT-063",
   "AP-UT-064",
   "AP-IT-032"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "ForeignCandidateAndFormalSelection_RealApplicationD1R2"
 ],
 [
  [
   "AP-UT-065",
   "AP-UT-066",
   "AP-IT-033"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "immutableBefore"
 ],
 [
  [
   "AP-UT-104",
   "AP-IT-018",
   "AP-IT-052"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "SharedCompression_IndependentSegmentedCallerWithExact200000Bytes"
 ],
 [
  [
   "AP-UT-111",
   "AP-UT-112",
   "AP-IT-056"
  ],
  "docs/verification/SPEC-001-AvatarAndPreferences-Verification.md",
  "秘密／文件檢查"
 ],
 [
  [
   "AP-IT-001"
  ],
  "tests/e2e/web/avatar-preferences.spec.ts",
  "empty photo picker cancellation keeps notice"
 ],
 [
  [
   "AP-IT-005",
   "AP-E2E-038"
  ],
  "tests/e2e/web/avatar-preferences.spec.ts",
  "for(const group"
 ],
 [
  [
   "AP-IT-028",
   "AP-IT-029",
   "AP-IT-030"
  ],
  "backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs",
  "RealCompressionFailures_RejectOversizeForgedAndUncompressibleSources"
 ],
 [
  [
   "AP-IT-043"
  ],
  "backend/tests/DatingHigh.Unit.Tests/Application/ProfileProjectionTests.cs",
  "FutureConsentIntegration_DefaultDeny_CannotBeEnabledByClientBoolean"
 ],
 [
  [
   "AP-IT-045"
  ],
  "cloudflare/tests/avatar-preferences-d1.integration.test.ts",
  "const committed="
 ],
 [
  [
   "AP-IT-062"
  ],
  "docs/verification/SPEC-001-AvatarAndPreferences-Verification.md",
  "第三版：分開真人identity與prototype STYLE ONLY參考"
 ],
 [
  [
   "AP-E2E-032"
  ],
  "tests/e2e/android/avatar-privacy.mjs",
  "Native privacy actual Bearer denied"
 ],
 [
  [
   "AP-E2E-037"
  ],
  "tests/e2e/android/avatar-gemini-live.mjs",
  "Native third-party disclosure verified before generation"
 ],
 [
  [
   "AP-E2E-026",
   "AP-E2E-029",
   "AP-E2E-035"
  ],
  "tests/e2e/android/avatar-managed.mjs",
  "'actual-native-relogin-persistence'"
 ]
];
for(const [ids,path,anchor] of additionalReviews)for(const id of ids){(approved[path]??=[]).push(id);anchors[id]=anchor;}
const reviewed=new Map();for(const [path,ids] of Object.entries(approved)){
 const contents=fs.readFileSync(path,'utf8');
 for(const id of ids){assert.ok(!reviewed.has(id));let offset=contents.indexOf(anchors[id]??id);assert.ok(offset>=0,`Missing evidence anchor: ${id}`);reviewed.set(id,{path,line:contents.slice(0,offset).split('\n').length});}
}
const impl={profile:'backend/src/DatingHigh.Application/DatingProfileService.cs',photo:'backend/src/DatingHigh.Application/PersonalPhotosService.cs',avatar:'backend/src/DatingHigh.Application/AvatarService.cs',projection:'backend/src/DatingHigh.Application/ProfileProjections.cs',compression:'backend/src/DatingHigh.Infrastructure/Media/ImageCompressionService.cs',provider:'backend/src/DatingHigh.Infrastructure/Media/GeminiAvatarImageGenerator.cs',ui:'frontend/client/src/DatingProfileScreen.tsx',sql:'cloudflare/src/commands.ts'};
const tests={profile:'backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs',photo:'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs',avatar:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',projection:'backend/tests/DatingHigh.Unit.Tests/Application/ProfileProjectionTests.cs',compression:'backend/tests/DatingHigh.Unit.Tests/Infrastructure/ImageCompressionTests.cs',provider:'backend/tests/DatingHigh.Unit.Tests/Infrastructure/AvatarGeneratorTests.cs',ui:'tests/e2e/web/avatar-preferences.spec.ts',sql:'cloudflare/tests/avatar-preferences-d1.integration.test.ts'};
const classify=title=>/Card|Projection|Persona|Consent|Terminat/.test(title)?'projection':/Compress|ForgedImage|Oversize/.test(title)?'compression':/Gemini|MissingSingleImage|Provider/.test(title)?'provider':/Photo|Media/.test(title)?'photo':/Avatar|Candidate/.test(title)?'avatar':'profile';
const supporting={
 'AP-E2E-002':[{path:'frontend/client/tests/unit/dating-profile-screen.test.tsx',anchor:'selecting and cancelling a photo shows purpose notice without uploading'}],
 'AP-E2E-022':[{path:'frontend/client/tests/unit/dating-profile-screen.test.tsx',anchor:'an open adoption expires without a selection request'},{path:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',anchor:'59:59 readable, exactly 60:00 and 60:01'},{path:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',anchor:'uncertain provider call never unlocks automatic retry'}],
 'AP-IT-049':[{path:'cloudflare/tests/avatar-preferences-d1.integration.test.ts',anchor:'ready cannot return to pending, deleted cannot revive'}],
 'AP-IT-059':[{path:'cloudflare/tests/avatar-preferences-d1.integration.test.ts',anchor:'ready cannot return to pending, deleted cannot revive'}],
 'AP-API-013':[{path:'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs',anchor:'UploadReadOrderDelete_RealD1R2'}],
 'AP-API-014':[{path:'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs',anchor:'IndependentClients_ConcurrentFifthAndSixth'}],
 'AP-API-020':[{path:'cloudflare/tests/avatar-preferences-d1.integration.test.ts',anchor:'missing, duplicate, pending, foreign and revoked are rejected without partial writes'}],
 'AP-API-022':[{path:'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs',anchor:'UploadReadOrderDelete_RealD1R2'}],
 'AP-API-026':[{path:'cloudflare/tests/photo-media-d1-r2.integration.test.ts',anchor:'guessed photo ID, other account, revoked session and direct public host never read R2'}],
 'AP-API-040':[{path:'tests/integration/avatar-http-live.test.mjs',anchor:'Avatar photo transport: true local Bearer/Cookie'}],
 'AP-API-041':[{path:'backend/tests/DatingHigh.Integration.Tests/ProfileCatalogIntegrationTests.cs',anchor:'RetiringKnownCode_RealApplicationD1'}],
 'AP-API-028':[{path:'tests/e2e/web/avatar-gemini-live.spec.ts',anchor:'one candidate, cancel and explicit adoption'},{path:'tests/e2e/android/avatar-gemini-live.mjs',anchor:'Native real Gemini candidate completed'}],
 'AP-API-031':[{path:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',anchor:'successful candidates accumulate one by one'}],
 'AP-API-032':[{path:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',anchor:'59:59 readable, exactly 60:00 and 60:01'},{path:'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs',anchor:'ForeignCandidateAndFormalSelection'}],
 'AP-API-034':[{path:'tests/e2e/web/avatar-gemini-live.spec.ts',anchor:'one candidate, cancel and explicit adoption'}],
 'AP-API-035':[{path:'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs',anchor:'ForeignCandidateAndFormalSelection'}],
 'AP-API-043':[{path:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',anchor:'continuation rejects a forged attempt'}],
 'AP-API-044':[{path:'tests/e2e/web/avatar-gemini-live.spec.ts',anchor:'four Gemini candidates, two-tab race'},{path:'cloudflare/tests/avatar-worker-cas.integration.test.ts',anchor:'two actual Worker instances share account lock'}],
 'AP-UT-018':[{path:'frontend/client/tests/unit/dating-profile-screen.test.tsx',anchor:'a saved inactive catalog choice keeps its meaning'}],
 'AP-IT-009':[{path:'backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs',anchor:'VersionedCatalog_AllFiveInterestCategories'}],
 'AP-UT-060':[{path:'backend/tests/DatingHigh.Unit.Tests/Infrastructure/ImageCompressionTests.cs',anchor:'Compress_DecodableHighEntropyPanorama'}],
 'AP-IT-063':[{path:'cloudflare/tests/avatar-attempt-r2.integration.test.ts',anchor:'simultaneous different choices at one revision'}],
};
const complementaryReviews={"AP-UT-002": [["tests/e2e/web/avatar-preferences.spec.ts", "empty photo picker cancellation"]], "AP-UT-009": [["tests/e2e/web/avatar-preferences.spec.ts", "for(const group"]], "AP-UT-010": [["tests/e2e/android/avatar-preferences.mjs", "Native all sixteen portraits"]], "AP-UT-029": [["backend/tests/DatingHigh.Unit.Tests/Infrastructure/AvatarGeneratorTests.cs", "Generate_InvalidPhotoCount_NeverCallsProvider"]], "AP-UT-030": [["backend/tests/DatingHigh.Unit.Tests/Application/AvatarApplicationTests.cs", "ExplicitGeneration_OneCallPublishesOneCandidate"]], "AP-UT-031": [["frontend/client/tests/unit/dating-profile-screen.test.tsx", "adopt cancellation preserves a completed candidate"]], "AP-UT-032": [["frontend/client/tests/unit/dating-profile-screen.test.tsx", "adopt cancellation preserves a completed candidate"]], "AP-UT-050": [["frontend/client/tests/unit/dating-profile-screen.test.tsx", "an expired round can be cleared without automatically"]], "AP-UT-063": [["cloudflare/tests/photo-media-d1-r2.integration.test.ts", "guessed photo ID, other account"]], "AP-UT-064": [["cloudflare/tests/photo-media-d1-r2.integration.test.ts", "guessed photo ID, other account"], ["tests/e2e/web/avatar-preferences.spec.ts", "no consent exposes no other-player photo entry"]], "AP-UT-085": [["backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs", "ForeignCandidateAndFormalSelection_RealApplicationD1R2"]], "AP-UT-086": [["backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs", "ForeignCandidateAndFormalSelection_RealApplicationD1R2"]], "AP-UT-089": [["cloudflare/tests/avatar-preferences-d1.integration.test.ts", "const committed="]], "AP-UT-090": [["tests/e2e/web/avatar-preferences.spec.ts", "stale revision and delete confirmation"], ["frontend/client/tests/unit/dating-profile-screen.test.tsx", "refreshing photo metadata cannot give an old unsaved form"]], "AP-UT-095": [["cloudflare/tests/photo-media-d1-r2.integration.test.ts", "bounded housekeeping tombstones stale pending"]], "AP-UT-096": [["cloudflare/tests/photo-media-d1-r2.integration.test.ts", "bounded housekeeping tombstones stale pending"]], "AP-UT-098": [["cloudflare/tests/avatar-preferences-d1.integration.test.ts", "ready cannot return to pending, deleted cannot revive"]], "AP-UT-099": [["backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs", "Read_TrustedTaiwanAgeBoundary"]], "AP-UT-100": [["backend/tests/DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs", "NormalizeNickname_IsolatedSurrogate"]], "AP-UT-101": [["backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs", "TagCollections_RejectWrongTypeUnknownDuplicateAndOversizedInput"]], "AP-UT-102": [["backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs", "PreferredAgePair_UsesInclusiveLimits"]], "AP-UT-104": [["backend/tests/DatingHigh.Unit.Tests/Infrastructure/ImageCompressionTests.cs", "Compress_AllEightExifOrigins"], ["docs/verification/SPEC-001-AvatarAndPreferences-Verification.md", "第三版：分開真人identity"]], "AP-IT-001": [["frontend/client/tests/unit/dating-profile-screen.test.tsx", "照片會在你主動使用 AI 時提供第三方生成服務"]], "AP-IT-005": [["tests/e2e/android/avatar-preferences.mjs", "Native all sixteen portraits"], ["frontend/client/assets/avatars/provenance.json", "provenance"]], "AP-IT-023": [["tests/integration/avatar-controlled-host.test.mjs", "Controlled host rejects insufficient photos"], ["cloudflare/tests/avatar-attempt-r2.integration.test.ts", "59:59 readable, exactly 60:00 and 60:01"]], "AP-IT-032": [["cloudflare/tests/photo-media-d1-r2.integration.test.ts", "guessed photo ID, other account"], ["tests/e2e/web/avatar-preferences.spec.ts", "no consent exposes no other-player photo entry"]], "AP-IT-043": [["backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs", "ForeignCandidateAndFormalSelection_RealApplicationD1R2"], ["tests/e2e/web/avatar-preferences.spec.ts", "no consent exposes no other-player photo entry"]], "AP-IT-047": [["cloudflare/tests/avatar-preferences-d1.integration.test.ts", "schema adds exactly two tables, 24 columns, no SQL trigger"]], "AP-IT-048": [["cloudflare/tests/photo-media-d1-r2.integration.test.ts", "bounded housekeeping tombstones stale pending"]], "AP-IT-050": [["backend/tests/DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs", "NormalizeNickname_IsolatedSurrogate"]], "AP-IT-061": [["tests/integration/avatar-controlled-host.test.mjs", "Controlled native avatar host keeps earlier real R2 candidates"], ["tests/e2e/web/avatar-gemini-live.spec.ts", "fourthResponses"], ["backend/tools/DatingHigh.MediaProbe/Program.cs", "reportedModelVersion=telemetry.Model"]], "AP-IT-062": [["backend/tools/DatingHigh.MediaProbe/Program.cs", "sourceExifRemoved=photos.All"], ["backend/tests/DatingHigh.Unit.Tests/Infrastructure/ImageCompressionTests.cs", "Compress_AllEightExifOrigins"]], "AP-E2E-037": [["tests/e2e/web/avatar-preferences.spec.ts", "AI entry is read-only until explicit generation"], ["tests/e2e/web/avatar-gemini-live.spec.ts", "expect(generated).toBe(0)"], ["frontend/client/tests/unit/dating-profile-screen.test.tsx", "entering AI page never sends photos"]], "AP-E2E-038": [["tests/e2e/android/avatar-preferences.mjs", "Native all sixteen portraits"], ["frontend/client/assets/avatars/provenance.json", "provenance"]]};
for(const [id,items] of Object.entries(complementaryReviews))supporting[id]=[...(supporting[id]??[]),...items.map(([path,anchor])=>({path,anchor}))];
supporting['AP-E2E-035']=[{path:'tests/e2e/android/avatar-preferences.mjs',anchor:'Native all sixteen portraits and cross-group selection verified'}];
const implementationOverrides=Object.fromEntries(['AP-IT-035','AP-IT-037','AP-IT-040','AP-IT-054','AP-IT-063','AP-IT-064'].map(id=>[id,'cloudflare/src/avatar-attempts.ts']));
Object.assign(implementationOverrides,{'AP-IT-049':impl.sql,'AP-IT-059':impl.sql,'AP-IT-053':'cloudflare/src/avatar-attempts.ts'});
const implementationAnchor={
 [impl.profile]:'public sealed class DatingProfileService',
 [impl.photo]:'public sealed class PersonalPhotosService',
 [impl.avatar]:'public sealed class AvatarService',
 [impl.projection]:'public static class ProfileProjections',
 [impl.compression]:'public sealed class ImageCompressionService',
 [impl.provider]:'public sealed class GeminiAvatarImageGenerator',
 [impl.ui]:'export function DatingProfileScreen',
 [impl.sql]:'export function planCommand',
 'cloudflare/src/avatar-attempts.ts':'export async function avatarCommand'
};
const implementationAt=path=>{const body=fs.readFileSync(path,'utf8'),offset=body.indexOf(implementationAnchor[path]);assert.ok(offset>=0,`Missing implementation anchor: ${path}`);return {path,line:body.slice(0,offset).split('\n').length};};
const cases=entries.map(entry=>{
 const [block,id,layer]=entry;const title=block.split('\n')[0].split('**')[1]?.replaceAll('`','')??id;
 const category=layer==='E2E'?'ui':classify(title);
 let gap='現有實作與測試為局部證據，尚未完成本ID全部前置／結果／故障斷言，維持未勾選；不可只因Trait含ID視為完整通過。';
 if(/Ios_/.test(title))gap='iOS依D-052暫緩，不阻擋目前Web／Android範圍，也不記為通過；無障礙專項依D-051不在目前MVP。';
 else if(/Android_/.test(title))gap='Android已有局部實證，尚缺本ID其餘完整原生功能斷言；無障礙專項不列工作。';
 else if(/AuthorizedCard|CurrentCard|LiveCard|Termin|Unconsent|CardPhoto|MatchingInput|CandidatePersona/.test(title))gap='白名單投影及預設拒絕已建立；缺後續SPEC有效service／participant／interaction context及同意／終止的正向整合，不建立假授權。';
 else if(/Legacy|InterestCatalog/.test(title))gap='已補隔離停用既有代碼的Application／真D1／R2及UI標示保存證據；本ID其餘HTTP／平台或故障斷言仍待逐項覆核。';
 else if(/GeminiLive|BoundedCost/.test(title))gap='兩張授權來源的真生成／人工風格相似度已通過；費用帳單與全故障矩陣尚未完整核對。';
 const supportingEvidence=(supporting[id]??[]).map(({path,anchor})=>{const body=fs.readFileSync(path,'utf8'),offset=body.indexOf(anchor);assert.ok(offset>=0);return {path,line:body.slice(0,offset).split('\n').length};});

 if(futureIntegrationIds.has(id))gap='原SPEC責任切分：需後續配對／有效雙方同意／終止流程的整合前置；不列本份結案條件、不假造授權。本份白名單／本人媒體及未同意拒絕另有在範圍案例。';
 const proof=reviewed.get(id);assert.ok(!(proof&&futureIntegrationIds.has(id)),'Future integration cannot be counted as completed');return {id,layer,title,requirement:block.split('\n').filter(l=>l.includes('前置')||l.includes('預期斷言')).join('\n').trim(),status:proof?'verified':'partial',scopeStatus:/Ios_/.test(title)?'deferred':futureIntegrationIds.has(id)?'future-integration':'in-scope',implementation:implementationAt(implementationOverrides[id]??impl[category]),evidence:proof??{path:tests[category],line:1},supportingEvidence,gap:proof?null:gap,verificationScope:['AP-E2E-037','AP-E2E-038'].includes(id)?'依D-052僅驗Web／Android；iOS子斷言暫緩，未宣稱通過':null,requirementLine:source.slice(0,entry.index).split('\n').length};
});
assert.equal(new Set(cases.map(c=>c.id)).size,275);for(const id of reviewed.keys())assert.ok(cases.some(c=>c.id===id));
assert.ok(cases.every(c=>c.requirement.length>0),'Every case must retain its full preconditions and expected assertions');
const layers=Object.fromEntries(['UT','IT','API','E2E'].map(layer=>[layer,{total:cases.filter(c=>c.layer===layer).length,verified:cases.filter(c=>c.layer===layer&&c.status==='verified').length}]));
const done=cases.filter(c=>c.status==='verified').length,percent=Math.round(done/275*1000)/10;
const currentCases=cases.filter(c=>c.scopeStatus==='in-scope');
const currentScope={total:currentCases.length,verified:currentCases.filter(c=>c.status==='verified').length,deferredIos:cases.filter(c=>c.scopeStatus==='deferred').length,futureIntegration:futureIntegrationIds.size};
currentScope.percent=Math.round(currentScope.verified/currentScope.total*1000)/10;
// BDD業務斷言與13項UX分開核對；iOS暫緩、無障礙不在目前MVP，不將範圍排除記為測試通過。
const bddProof={
 'backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs':{
  'AP-BDD-002':'UploadReadOrderDelete_RealD1R2',
  'AP-BDD-007':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
  'AP-BDD-008':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
  'AP-BDD-014':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
  'AP-BDD-020':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
  'AP-BDD-022':'IndependentClients_ConcurrentFifthAndSixth',
  'AP-BDD-024':'ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement',
  'AP-BDD-038':'ForeignCandidateAndFormalSelection'
 },
 'backend/tests/DatingHigh.Integration.Tests/ProfileCatalogIntegrationTests.cs':{'AP-BDD-009':'RetiringKnownCode_RealApplicationD1'},
 'backend/tests/DatingHigh.Unit.Tests/Infrastructure/ImageCompressionTests.cs':{
  'AP-BDD-018':'Compress_SegmentedNonSeekableStream',
  'AP-BDD-030':'Compress_DecodableHighEntropyPanorama'
 },
 'backend/tests/DatingHigh.Api.Tests/PhotoHttpContractTests.cs':{
  'AP-BDD-028':'PhotoPost_InvalidHugeFullAndRevoked',
  'AP-BDD-029':'PhotoPost_InvalidHugeFullAndRevoked'
 },
 'cloudflare/tests/avatar-preferences-d1.integration.test.ts':{'AP-BDD-049':'every media command rejects caller-supplied identity'},
 'cloudflare/tests/avatar-attempt-r2.integration.test.ts':{
  'AP-BDD-037':'59:59 readable, exactly 60:00 and 60:01',
  'AP-BDD-053':'only completed owner indices one and two read',
  'AP-BDD-054':'simultaneous different choices at one revision'
 }
};
const bddSupporting={
 'AP-BDD-002':[['backend/tests/DatingHigh.Unit.Tests/Application/PersonalPhotosApplicationTests.cs','Upload_SendsOnlyReencodedBytes']],
 'AP-BDD-008':[['backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs','Read_AdultMinimumWithOptionalOccupation']],
 'AP-BDD-009':[['backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs','VersionedCatalog_AllFiveInterestCategories']],
 'AP-BDD-014':[['backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs','OwnPreview_AlwaysReadsCurrentFieldsAndPhotos'],['tests/e2e/web/avatar-preferences.spec.ts',"name:'名片照片 1'"]],
 'AP-BDD-028':[['tests/integration/avatar-http-live.test.mjs','Avatar photo transport: true local Bearer/Cookie'],['backend/tests/DatingHigh.Unit.Tests/Application/PersonalPhotosApplicationTests.cs','InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo']],
 'AP-BDD-029':[['backend/tests/DatingHigh.Unit.Tests/Application/PersonalPhotosApplicationTests.cs','InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo']],
 'AP-BDD-030':[['backend/tests/DatingHigh.Unit.Tests/Application/PersonalPhotosApplicationTests.cs','InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo']],
 'AP-BDD-049':[['cloudflare/tests/avatar-preferences-d1.integration.test.ts','ready cannot return to pending, deleted cannot revive']]
};
const proofAt=(path,anchor)=>{const body=fs.readFileSync(path,'utf8'),offset=body.indexOf(anchor);assert.ok(offset>=0,`Missing BDD evidence ${path}: ${anchor}`);return {path,line:body.slice(0,offset).split('\n').length};};
const bddVerified=new Map();for(const [path,items] of Object.entries(bddProof))for(const [id,anchor] of Object.entries(items)){
 assert.ok(!bddVerified.has(id));bddVerified.set(id,[proofAt(path,anchor),...(bddSupporting[id]??[]).map(([p,a])=>proofAt(p,a))]);
}
// 逐場景覆核後明列的證據組合；不是依編號或Trait自動推導BDD已通過。
const bddCaseReviews={"AP-BDD-001": ["AP-IT-001"], "AP-BDD-003": ["AP-UT-005", "AP-UT-006"], "AP-BDD-005": ["AP-E2E-038"], "AP-BDD-006": ["AP-UT-011", "AP-UT-012"], "AP-BDD-015": ["AP-IT-015", "AP-E2E-014"], "AP-BDD-016": ["AP-IT-016", "AP-E2E-040"], "AP-BDD-017": ["AP-IT-017"], "AP-BDD-019": ["AP-IT-019"], "AP-BDD-021": ["AP-IT-021", "AP-UT-042"], "AP-BDD-023": ["AP-IT-023"], "AP-BDD-025": ["AP-IT-025", "AP-UT-050"], "AP-BDD-027": ["AP-IT-027"], "AP-BDD-031": ["AP-IT-031"], "AP-BDD-032": ["AP-IT-032"], "AP-BDD-033": ["AP-IT-033"], "AP-BDD-034": ["AP-IT-034"], "AP-BDD-035": ["AP-IT-035"], "AP-BDD-036": ["AP-IT-036"], "AP-BDD-039": ["AP-IT-039", "AP-UT-077", "AP-UT-078"], "AP-BDD-040": ["AP-IT-040"], "AP-BDD-041": ["AP-IT-041"], "AP-BDD-042": ["AP-IT-042", "AP-UT-084"], "AP-BDD-043": ["AP-IT-043"], "AP-BDD-045": ["AP-IT-045", "AP-UT-090"], "AP-BDD-046": ["AP-IT-046"], "AP-BDD-047": ["AP-IT-047"], "AP-BDD-048": ["AP-IT-048"], "AP-BDD-050": ["AP-IT-050", "AP-UT-100"], "AP-BDD-051": ["AP-IT-051", "AP-UT-101", "AP-UT-102"], "AP-BDD-052": ["AP-IT-052", "AP-UT-104"], "AP-BDD-056": ["AP-IT-056"], "AP-BDD-057": ["AP-E2E-001", "AP-E2E-002"], "AP-BDD-058": ["AP-E2E-004", "AP-E2E-005", "AP-E2E-038"], "AP-BDD-059": ["AP-E2E-007", "AP-E2E-008"], "AP-BDD-060": ["AP-E2E-010", "AP-E2E-011"], "AP-BDD-061": ["AP-E2E-013", "AP-E2E-014", "AP-E2E-037"], "AP-BDD-062": ["AP-E2E-016", "AP-E2E-017"], "AP-BDD-063": ["AP-E2E-019", "AP-E2E-020"], "AP-BDD-064": ["AP-E2E-022", "AP-E2E-023"], "AP-BDD-065": ["AP-E2E-025", "AP-E2E-026"], "AP-BDD-066": ["AP-E2E-028", "AP-E2E-029"], "AP-BDD-067": ["AP-E2E-031", "AP-E2E-032"], "AP-BDD-068": ["AP-E2E-034", "AP-E2E-035"], "AP-BDD-069": ["AP-UT-114", "AP-E2E-039", "AP-E2E-040"], "AP-BDD-070": ["AP-UT-117"], "AP-BDD-071": ["AP-UT-118", "AP-E2E-016"], "AP-BDD-072": ["AP-UT-120", "AP-E2E-023"], "AP-BDD-073": ["AP-E2E-039", "AP-E2E-040"]};
for(const [id,ids] of Object.entries(bddCaseReviews)){
 const selected=ids.map(value=>cases.find(c=>c.id===value));assert.ok(selected.every(Boolean));
 if(selected.every(c=>c.status==='verified')){assert.ok(!bddVerified.has(id));const evidence=selected.flatMap(c=>[c.evidence,...c.supportingEvidence]);bddVerified.set(id,[...new Map(evidence.map(e=>[`${e.path}:${e.line}`,e])).values()]);}
}
const bddFile='docs/bdd/SPEC-001-AvatarAndPreferences-BDD.md';let bdd=fs.readFileSync(bddFile,'utf8').replaceAll('\r\n','\n');
const scenarios=Array.from(bdd.matchAll(/```gherkin\n(Scenario: (AP-BDD-\d+)[\s\S]*?)\n```/g),match=>{
 const id=match[2],n=Number(id.slice(-3)),frontend=n>=57&&n<=68||n===73,evidence=bddVerified.get(id)??[];
 const future=[4,10,11,12,13,26,44,55].includes(n);
 return {id,requirement:match[1],status:evidence.length?'verified':'partial',scopeStatus:future?'future-integration':'in-scope',scope:frontend?'Web／Android介面功能；iOS暫緩、無障礙不在範圍':'本SPEC業務斷言；平台UI另依E2E驗收',evidence,
  gap:evidence.length?null:frontend?'Web／Android局部證據已記錄，本場景其餘功能斷言待覆核；iOS依D-052暫緩、無障礙依D-051不列工作。':future?'有效輪次／同意／終止及Matching服務的正向整合由後續SPEC完成；本份資料契約／白名單及拒絕界線另驗，不要求先實作其他SPEC。':'現有局部證據尚未完成本場景全部Given／When／Then／And覆核；保留功能斷言，不以測試名稱或單一平台放行。'};
});
assert.equal(scenarios.length,73);assert.equal(new Set(scenarios.map(s=>s.id)).size,73);for(const id of bddVerified.keys())assert.ok(scenarios.some(s=>s.id===id));
const bddDone=scenarios.filter(s=>s.status==='verified').length;
const bddCurrent={total:scenarios.filter(s=>s.scopeStatus==='in-scope').length,verified:scenarios.filter(s=>s.scopeStatus==='in-scope'&&s.status==='verified').length,futureIntegration:scenarios.filter(s=>s.scopeStatus==='future-integration').length};
const frontendCurrent={total:13,verified:scenarios.filter(s=>((Number(s.id.slice(-3))>=57&&Number(s.id.slice(-3))<=68)||s.id==='AP-BDD-073')&&s.status==='verified').length};

for(const scenario of scenarios)bdd=bdd.replace(new RegExp(`^- \\[[ x]\\](?= .*\\x60${scenario.id}\\x60)`,'m'),`- [${scenario.status==='verified'?'x':' '}]`);
bdd=bdd.replace(/完整\d+\/73、前端0\/13保持/,`完整業務場景${bddDone}/73、前端完整三平台0/13`)
 .replace(/；\d+ 項完整驗收。/,`；${bddDone} 項業務場景完整覆核，前端完整三平台0/13。`);
const bddScopeLine=`**本輪Web／Android BDD**：${bddCurrent.verified}/${bddCurrent.total}個範圍內場景完整覆核；UX ${frontendCurrent.verified}/13；後續SPEC正向整合${bddCurrent.futureIntegration}項另列，iOS暫緩、無障礙不在範圍。`;
bdd=bdd.includes('**本輪Web／Android BDD**')?bdd.replace(/^\*\*本輪Web／Android BDD\*\*：.*$/m,bddScopeLine):bdd.replace('## 📝 Feature 描述',bddScopeLine+'\n\n## 📝 Feature 描述');
fs.writeFileSync(bddFile,bdd);
fs.writeFileSync('docs/verification/avatar-preferences-traceability.json',JSON.stringify({updatedAt:'2026-11-04',status:currentScope.verified===currentScope.total&&bddCurrent.verified===bddCurrent.total?'complete-current-scope':'in-progress',method:'人工覆核完整ID及BDD業務斷言；D-051移出無障礙專項，D-052暫緩iOS，原SPEC後續整合另列，排除不改記通過',acceptanceScope:{...acceptanceScope,deferredCaseIds:cases.filter(c=>c.scopeStatus==='deferred').map(c=>c.id),futureIntegrationCaseIds:[...futureIntegrationIds]},currentScope,total:275,verified:done,percent,layers,bdd:{total:73,verified:bddDone,frontendVerified:0,frontendTotal:13,frontendCounterBasis:'historical-three-platforms',currentScope:bddCurrent,frontendCurrentScope:frontendCurrent,scenarios},cases},null,2)+'\n');
for(const item of cases)source=source.replace(new RegExp(`^- \\[[ x]\\] \\x60${item.id}\\x60`,'m'),`- [${item.status==='verified'?'x':' '}] \x60${item.id}\x60`);
source=source.replace(/完整ID \*\*\d+\/275（[\d.]+%）\*\*/,`完整ID **${done}/275（${percent}%）**`);
source=source.replace(/BDD完整場景 \*\*\d+\/73\*\*/,`BDD完整場景 **${bddDone}/73**`);
const scopeLine=`**本輪Web／Android責任範圍**：${currentScope.verified}/${currentScope.total}（${currentScope.percent}%）完整TDD ID已覆核；另列iOS暫緩${currentScope.deferredIos}項、後續SPEC整合${currentScope.futureIntegration}項，均未改記通過。`;
source=source.includes('**本輪Web／Android責任範圍**')?source.replace(/^\*\*本輪Web／Android責任範圍\*\*：.*$/m,scopeLine):source.replace('## 🎯 開發進度總覽',scopeLine+'\n\n## 🎯 開發進度總覽');
for(const [layer,counts] of Object.entries(layers))source=source.replace(new RegExp(`(\\| ${layer} \\| ${counts.total} \\| )\\d+( \\|)`),`$1${counts.verified}$2`);
source=source.replace(/\| \*\*合計\*\* \| \*\*275\*\* \| \*\*\d+\*\* \| \*\*[\d.]+%\*\* \|/,`| **合計** | **275** | **${done}** | **${percent}%** |`);
fs.writeFileSync(file,source);
const verification='docs/verification/SPEC-001-AvatarAndPreferences-Verification.md';
let verificationSource=fs.readFileSync(verification,'utf8').replace(/完整ID已覆核 \*\*\d+\/275（[\d.]+%）\*\*/,`完整ID已覆核 **${done}/275（${percent}%）**`);
verificationSource=verificationSource.includes('**本輪Web／Android責任範圍**')?verificationSource.replace(/^\*\*本輪Web／Android責任範圍\*\*：.*$/m,scopeLine):verificationSource.replace('## 已落地的流程',scopeLine+'\n\n## 已落地的流程');fs.writeFileSync(verification,verificationSource);
let report='# AvatarAndPreferences 完整ID追溯與未完成項\n\n更新：2026-11-04。'+done+'/275（'+percent+'%）為原始規劃ID覆核，不能視為調整範圍後的完成率。D-051：無障礙專項排除目前整個遊戲MVP；D-052：iOS暫緩，當前Web／Android功能繼續驗收。BDD業務斷言'+bddDone+'/73；原始三平台UX 0/13僅保留歷史欄位，目前Web／Android UX '+frontendCurrent.verified+'/13。排除／暫緩不改記通過。重建：`node tools/audit-avatar-traceability.mjs`。\n\n| ID | 狀態 | 實作 | 證據 | 缺項 |\n|---|---|---|---|---|\n';
report=report.replace('| ID | 狀態 | 實作 | 證據 | 缺項 |',scopeLine+'\n\n| ID | 狀態 | 實作 | 證據 | 缺項 |');
for(const c of cases)report+=`| ${c.id} | ${c.status==='verified'?'已覆核':c.scopeStatus==='deferred'?'本輪暫緩':c.scopeStatus==='future-integration'?'後續SPEC整合':'局部／待補'} | [實作](../../${c.implementation.path}#L${c.implementation.line}) | [測試](../../${c.evidence.path}#L${c.evidence.line})${c.supportingEvidence.map(e=>`、[補充](../../${e.path}#L${e.line})`).join('')} | ${c.gap??'完整斷言證據如左；範圍限本ID'}${c.verificationScope?'；'+c.verificationScope:''} |\n`;
report+='\n## BDD業務斷言與目前UX範圍\n\n業務場景按Given／When／Then／And核對，無障礙專項依D-051移出；iOS暫緩。完整功能斷言及範圍保存在同目錄追溯JSON的bdd.scenarios。\n\n| ID | 狀態 | 範圍 | 證據／缺項 |\n|---|---|---|---|\n';
for(const s of scenarios)report+=`| ${s.id} | ${s.status==='verified'?'已覆核':s.scopeStatus==='future-integration'?'後續SPEC整合':'局部／待補'} | ${s.scope} | ${s.evidence.map(e=>`[證據](../../${e.path}#L${e.line})`).join('、')||s.gap} |\n`;
fs.writeFileSync('docs/verification/SPEC-001-AvatarAndPreferences-Traceability.md',report);
console.log(JSON.stringify({total:275,verified:done,percent,currentScope,layers,bdd:{total:73,verified:bddDone,currentScope:bddCurrent,frontendCurrentScope:frontendCurrent,frontendVerified:0,frontendTotal:13}}));
