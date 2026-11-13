using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class AvatarExpressionServiceTests
{
    private static readonly CurrentUser User=new(EntityId.New(),EntityId.New(),1,long.MaxValue);
    private static JsonObject Next()=>new(){["workflowId"]=EntityId.New(),["expression"]="smile",["clientRequestId"]=EntityId.New()};
    [Fact]
    public async Task CompletedExpression_IsOnlyReadBackWithoutQuotaSourceReadsOrProvider()
    {
        var f=new Fixture{Completed=true};await f.Service.ExecuteAsync(User,"next",Next());
        Assert.Equal(0,f.Calls);Assert.Equal(0,f.SourceReads);Assert.Equal(0,f.Quota);
    }
    [Fact]
    public async Task ExplicitNext_UsesSelectedCandidateOnceAndDoesNotScheduleOtherExpressions()
    {
        var f=new Fixture();var result=await f.Service.ExecuteAsync(User,"next",Next());
        Assert.Equal(1,f.Calls);Assert.Equal(1,f.SourceReads);Assert.Equal(1,f.Quota);Assert.Equal(1,f.Published);
        Assert.Null(result["lease"]);Assert.Null(result["sourceImageSha256"]);
        Assert.DoesNotContain("avatar.attempt.select",f.Commands);
    }
    [Theory]
    [InlineData(false)][InlineData(true)]
    public async Task FailedOrUnknownExpression_DoesNotPublishOrRetryAndReportsServerLease(bool unknown)
    {
        var f=new Fixture{Failure=true,Unknown=unknown};
        await Assert.ThrowsAsync<DomainException>(()=>f.Service.ExecuteAsync(User,"next",Next()));
        Assert.Equal(1,f.Calls);Assert.Equal(0,f.Published);
        Assert.Equal(unknown,f.Failed!["uncertain"]!.GetValue<bool>());Assert.Equal("server-only-lease",f.Failed["lease"]!.GetValue<string>());
        Assert.Equal(1,f.Commands.Count(c=>c=="avatar.attempt.expression.fail"));
    }
    [Theory]
    [InlineData(0L)][InlineData(2147483648L)]
    public async Task Begin_InvalidProfileRevision_RejectsBeforeAnyStorageOrProvider(long revision)
    {
        var f=new Fixture();var input=new JsonObject{["attemptId"]=EntityId.New(),["clientRequestId"]=EntityId.New(),["index"]=1L,["expectedRevision"]=revision};
        await Assert.ThrowsAsync<DomainException>(()=>f.Service.ExecuteAsync(User,"begin",input));Assert.Empty(f.Commands);Assert.Equal(0,f.Calls);
    }
    [Theory]
    [InlineData("angry")][InlineData("../neutral")]
    public async Task Next_UnknownExpression_RejectsBeforeStorage(string expression)
    {
        var f=new Fixture();var input=Next();input["expression"]=expression;
        await Assert.ThrowsAsync<DomainException>(()=>f.Service.ExecuteAsync(User,"next",input));Assert.Empty(f.Commands);
    }
    private sealed class Fixture:IPlatformClient,IAvatarCandidateStore,IAvatarExpressionStore,IAvatarExpressionGenerator,IRateLimiter
    {
        public bool Completed,Failure,Unknown;public int Calls,SourceReads,Quota,Published;public JsonNode? Failed;public List<string> Commands=[];
        public string Model=>"controlled-generator";public string ExpressionPromptVersion=>"controlled.v1";
        public AvatarExpressionService Service=>new(this,this,this,this,this);
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken ct=default){
            Commands.Add(command);if(command.EndsWith(".fail"))Failed=JsonSerializer.SerializeToNode(payload);
            return Task.FromResult<JsonNode>(command.EndsWith(".next")?new JsonObject{["completed"]=Completed,["progress"]=new JsonObject{["status"]="building"},["attemptId"]=EntityId.New(),["index"]=1L,["lease"]="server-only-lease"}:new JsonObject());
        }
        public Task<PrivateMediaContent> ReadAsync(CurrentUser user,string attemptId,int index,CancellationToken ct=default){SourceReads++;return Task.FromResult(new PrivateMediaContent(new byte[]{1},"image/jpeg"));}
        public Task<JsonNode> PublishAsync(CurrentUser user,string attemptId,string requestId,string lease,CompressedImage image,CancellationToken ct=default)=>throw new NotSupportedException();
        public Task<JsonNode> PublishAsync(CurrentUser user,string workflow,string expression,string requestId,string lease,CompressedImage image,CancellationToken ct=default){Published++;return Task.FromResult<JsonNode>(new JsonObject{["status"]="building"});}
        public Task<CompressedImage> GenerateExpressionAsync(PrivateMediaContent master,string expression,CancellationToken ct=default){Calls++;if(Failure)throw new DomainException(Unknown?"IMAGE_PROVIDER_UNCERTAIN":"IMAGE_PROVIDER_NO_IMAGE",503);return Task.FromResult(new CompressedImage(new byte[]{1},"image/webp",768,1024));}
        public Task<RateLimitDecision> TryConsumeAsync(IEnumerable<RateLimitDescriptor> descriptors,CancellationToken ct=default){Assert.Equal("avatar_expression.v1",descriptors.Single().PolicyKey);Quota++;return Task.FromResult(new RateLimitDecision(true,0));}
    }
}
