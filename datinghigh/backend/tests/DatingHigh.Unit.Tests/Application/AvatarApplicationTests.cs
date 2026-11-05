using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class AvatarApplicationTests
{
    private static readonly CurrentUser User=new(EntityId.New(),EntityId.New(),1,long.MaxValue);
    private static JsonObject Input()=>new(){["styleId"]="warm",["clientRequestId"]=EntityId.New(),["expectedProducedCount"]=0L};
    [Theory]
    [InlineData(0L)][InlineData(2147483648L)][InlineData(long.MaxValue)]
    public void AvatarSelection_RejectsRevisionOutsideTheSameProfileContract(long revision)
    {
        var json=new JsonObject{["type"]="builtin",["builtinAvatarId"]="male-01",["expectedRevision"]=revision};
        Assert.Equal("INVALID_AVATAR_SELECTION",Assert.Throws<DomainException>(()=>AvatarInput.Parse(System.Text.Encoding.UTF8.GetBytes(json.ToJsonString()),true)).Code);
    }
    [Fact]
    public void AvatarSelection_CannotChooseThePrivateProposedMediaIdentity()
    {
        var json=new JsonObject{["type"]="generated",["attemptId"]=EntityId.New(),["index"]=1L,["expectedRevision"]=1L,["proposedAssetId"]=EntityId.New()};
        Assert.Equal("INVALID_AVATAR_SELECTION",Assert.Throws<DomainException>(()=>AvatarInput.Parse(System.Text.Encoding.UTF8.GetBytes(json.ToJsonString()),true)).Code);
    }
    [Fact]
    public async Task CompletedReplay_DoesNotConsumeQuotaReadPhotosOrCallProvider()
    {
        var f=new Fixture{Replay=true};var output=await f.Service.GenerateAsync(User,Input());
        Assert.Equal(1,output.Number("index"));Assert.Equal(0,f.ProviderCalls);Assert.Equal(0,f.QuotaCalls);Assert.Equal(0,f.PhotoReads);
        Assert.Null(output["lease"]);Assert.Null(output["sourceAssetIds"]);
    }
    [Fact,Trait("Case","AP-UT-119")]
    public async Task FullClosedOrCompetingLease_RejectsBeforeProviderOrQuota()
    {
        var f=new Fixture{BeginFailure=true};
        Assert.Equal(409,(await Assert.ThrowsAsync<DomainException>(()=>f.Service.GenerateAsync(User,Input()))).Status);
        Assert.Equal(0,f.ProviderCalls);Assert.Equal(0,f.QuotaCalls);
    }
    [Fact,Trait("Case","AP-UT-114")]
    public async Task ExplicitGeneration_OneCallPublishesOneCandidate_WithoutSchedulingRemainingThree()
    {
        var f=new Fixture();var result=await f.Service.GenerateAsync(User,Input());
        Assert.Equal(1,f.ProviderCalls);Assert.Equal(2,f.PhotoReads);Assert.Equal(1,f.PublishCalls);Assert.Equal(1,result.Number("producedCount"));
        await f.Service.SelectAsync(User,new JsonObject{["type"]="generated",["attemptId"]=f.Attempt,["index"]=1L,["expectedRevision"]=1L});
        Assert.Equal(1,f.ProviderCalls);Assert.Equal(1,f.Selections);
        var selection=Assert.IsType<JsonObject>(f.Selection);Assert.True(EntityId.IsValid(selection.Text("proposedAssetId")));Assert.NotEqual(f.Attempt,selection.Text("proposedAssetId"));
    }
    [Fact,Trait("Case","AP-UT-121")]
    public async Task UnknownCost_ReportsUncertainLeaseOnce_NeverRetriesProviderOrPublishes()
    {
        var f=new Fixture{Unknown=true};await Assert.ThrowsAsync<DomainException>(()=>f.Service.GenerateAsync(User,Input()));
        Assert.Equal(1,f.ProviderCalls);Assert.Equal(0,f.PublishCalls);Assert.True(f.Failure!["uncertain"]!.GetValue<bool>());
    }
    [Fact]
    public async Task ProviderSucceededButPublishingFailed_ProtectsCostAndEarlierCandidatesWithoutRetry()
    {
        var f=new Fixture{PublishFailure=true};await Assert.ThrowsAsync<DomainException>(()=>f.Service.GenerateAsync(User,Input()));
        Assert.Equal(1,f.ProviderCalls);Assert.Equal(1,f.PublishCalls);Assert.True(f.Failure!["uncertain"]!.GetValue<bool>());
    }
    [Fact]
    public async Task RateLimitFailure_ReleasesKnownUnusedLeaseWithoutCallingProvider()
    {
        var f=new Fixture{RateLimited=true};Assert.Equal(429,(await Assert.ThrowsAsync<DomainException>(()=>f.Service.GenerateAsync(User,Input()))).Status);
        Assert.Equal(0,f.ProviderCalls);Assert.False(f.Failure!["uncertain"]!.GetValue<bool>());
    }
    [Fact]
    public async Task ReselectOwnSavedAvatar_OnlyUpdatesSelectionWithoutProviderOrNewImage()
    {
        var f=new Fixture{OwnSavedAvatar=true};var result=await f.Service.SelectAsync(User,new JsonObject{["type"]="generated",["assetId"]=f.Saved,["expectedRevision"]=1L});
        Assert.Equal(2,result.Number("revision"));Assert.Equal(0,f.ProviderCalls);Assert.Equal(0,f.PublishCalls);Assert.Equal(0,f.PhotoReads);
    }
    [Theory]
    [InlineData(false,400,"INVALID_AVATAR_SELECTION")][InlineData(true,409,"PROFILE_VERSION_CONFLICT")]
    public async Task ReselectSavedAvatar_DistinguishesUnavailableAssetFromStaleRevision(bool owned,int status,string code)
    {
        var f=new Fixture{OwnSavedAvatar=owned,DenySavedSelection=true};
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.SelectAsync(User,new JsonObject{["type"]="generated",["assetId"]=f.Saved,["expectedRevision"]=1L}));
        Assert.Equal(status,error.Status);Assert.Equal(code,error.Code);Assert.Equal(0,f.ProviderCalls);
    }
    [Fact]
    public async Task ReselectSavedAvatar_RevokedSessionCannotProbeOwnership()
    {
        var f=new Fixture{DenySavedSelection=true,Revoked=true};
        Assert.Equal(401,(await Assert.ThrowsAsync<DomainException>(()=>f.Service.SelectAsync(User,new JsonObject{["type"]="generated",["assetId"]=f.Saved,["expectedRevision"]=1L}))).Status);
        Assert.Equal(0,f.SavedListReads);
    }
    [Fact,Trait("Case","AP-UT-068")]
    public async Task ThirdCandidateWithoutImage_PreservesTwoReadableAdoptableCandidatesAndDoesNotRetry()
    {
        var f=new Fixture{NoImage=true,CandidateCount=2};var input=Input();input["attemptId"]=f.Attempt;input["expectedProducedCount"]=2L;
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.GenerateAsync(User,input));
        Assert.Equal(503,error.Status);Assert.Equal("IMAGE_PROVIDER_NO_IMAGE",error.Code);
        Assert.Equal(1,f.ProviderCalls);Assert.Equal(0,f.PublishCalls);Assert.Equal(2,f.CandidateCount);
        Assert.False(f.Failure!["uncertain"]!.GetValue<bool>());
        foreach(var index in new[]{1,2})Assert.Equal(index,(await f.Service.ReadCandidateAsync(User,f.Attempt,index)).Bytes.Span[0]);
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>f.Service.ReadCandidateAsync(User,f.Attempt,3))).Status);
        await f.Service.SelectAsync(User,new JsonObject{["type"]="generated",["attemptId"]=f.Attempt,["index"]=2L,["expectedRevision"]=1L});
        Assert.Equal(1,f.Selections);Assert.Equal(1,f.ProviderCalls);Assert.Equal(2,f.CandidateCount);
    }
    [Theory]
    [InlineData(null,"male-01")]
    [InlineData("male","female-01")]
    [InlineData("female","male-08")]
    public async Task BuiltinSelection_RequiresCompatibleSavedGenderBeforeAttemptingWrite(string? gender,string avatar)
    {
        var f=new Fixture{Gender=gender};
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.SelectAsync(User,new JsonObject{["type"]="builtin",["builtinAvatarId"]=avatar,["expectedRevision"]=1L}));
        Assert.Equal("INVALID_AVATAR_SELECTION",error.Code);Assert.Equal(400,error.Status);Assert.Equal(0,f.BuiltinWrites);Assert.Equal(0,f.ProviderCalls);
    }
    [Fact]
    public async Task BuiltinSelection_RevokedFamilyCannotReachGenderOrAvatarWrite()
    {
        var f=new Fixture{Revoked=true};
        Assert.Equal(401,(await Assert.ThrowsAsync<DomainException>(()=>f.Service.SelectAsync(User,new JsonObject{["type"]="builtin",["builtinAvatarId"]="male-01",["expectedRevision"]=1L}))).Status);
        Assert.Equal(0,f.BuiltinWrites);
    }
    private sealed class Fixture:IPlatformClient,IPrivateMediaStore,IAvatarCandidateStore,IAvatarImageGenerator,IRateLimiter
    {
        public bool Replay,BeginFailure,Unknown,RateLimited,PublishFailure,OwnSavedAvatar,DenySavedSelection,Revoked,NoImage;
        public int CandidateCount,BuiltinWrites;public string? Gender="diverse";
        public int QuotaCalls,PhotoReads,ProviderCalls,PublishCalls,Selections;
        public JsonNode? Failure,Selection;
        public string Attempt=EntityId.New();
        public string Saved=EntityId.New();public int SavedListReads;
        public AvatarService Service=>new(this,this,this,this,this);
        private JsonObject Result()=>new(){["attemptId"]=Attempt,["index"]=1L,["producedCount"]=1L,["expiresAt"]=long.MaxValue};
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken ct=default){
            if(command=="profile.read")return Task.FromResult<JsonNode>(new JsonObject{["rows"]=Revoked?new JsonArray():new JsonArray(new JsonObject{["gender"]=Gender,["revision"]=1L})});
            if(command=="profile.avatar.builtin"){BuiltinWrites++;return Task.FromResult<JsonNode>(new JsonObject{["rows"]=new JsonArray(new JsonObject{["revision"]=2L})});}
            if(command=="profile.avatar.generated")return Task.FromResult<JsonNode>(new JsonObject{["rows"]=DenySavedSelection?new JsonArray():new JsonArray(new JsonObject{["revision"]=2L})});
            if(command=="session.validate")return Task.FromResult<JsonNode>(new JsonObject{["rows"]=Revoked?new JsonArray():new JsonArray(new JsonObject{["account_id"]=User.AccountId})});
            if(command=="profile.avatar.list"){SavedListReads++;return Task.FromResult<JsonNode>(new JsonObject{["rows"]=OwnSavedAvatar?new JsonArray(new JsonObject{["asset_id"]=Saved}):new JsonArray()});}
            if(command=="avatar.attempt.fail"){Failure=JsonSerializer.SerializeToNode(payload);return Task.FromResult<JsonNode>(new JsonObject());}
            if(command=="avatar.attempt.select"){Selection=JsonSerializer.SerializeToNode(payload);Selections++;return Task.FromResult<JsonNode>(new JsonObject{["revision"]=2});}
            Assert.Equal("avatar.attempt.begin",command);if(BeginFailure)throw new DomainException("AVATAR_LIMIT_REACHED",409);
            var result=Result();result["completed"]=Replay;result["lease"]="private-lease";result["sourceAssetIds"]=new JsonArray(EntityId.New(),EntityId.New());
            return Task.FromResult<JsonNode>(result);
        }
        public Task<RateLimitDecision> TryConsumeAsync(IEnumerable<RateLimitDescriptor> descriptors,CancellationToken cancellationToken=default){QuotaCalls++;Assert.Equal(User.AccountId,descriptors.Single().CanonicalSubject);return Task.FromResult(new RateLimitDecision(!RateLimited,30));}
        public Task<PrivateMediaContent> ReadPhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default){PhotoReads++;return Task.FromResult(new PrivateMediaContent(new byte[]{1},"image/jpeg"));}
        public Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default){ProviderCalls++;Assert.Equal(2,photos.Count);if(Unknown)throw new DomainException("IMAGE_PROVIDER_UNCERTAIN",503);if(NoImage)throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);return Task.FromResult(new CompressedImage(new byte[]{2},"image/jpeg",480,640));}
        public Task<JsonNode> PublishAsync(CurrentUser user,string attemptId,string requestId,string lease,CompressedImage image,CancellationToken ct=default){PublishCalls++;if(PublishFailure)throw new DomainException("STORAGE_UNAVAILABLE",503);return Task.FromResult<JsonNode>(Result());}
        public Task<PrivateMediaContent> ReadAsync(CurrentUser user,string attemptId,int index,CancellationToken ct=default)=>index<=CandidateCount?Task.FromResult(new PrivateMediaContent(new byte[]{(byte)index},"image/jpeg")):throw new DomainException("AVATAR_CANDIDATE_NOT_FOUND",404);
        public Task SavePhotoAsync(CurrentUser user,string assetId,CompressedImage image,CancellationToken ct=default)=>throw new NotSupportedException();
        public Task DeletePhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default)=>throw new NotSupportedException();
    }
}
