using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Domain;
using Xunit;

namespace DatingHigh.Api.Tests;

public class MatchingEndpointTests
{
    private static readonly string Candidate=EntityId.New(), Invitation=EntityId.New(), Round=EntityId.New();
    public static IEnumerable<object[]> Routes()=>new[]{
        new object[]{"POST","match-candidates/search","{\"offset\":0,\"limit\":20}"},
        new object[]{"GET",$"match-candidates/{Candidate}",""},
        new object[]{"POST","match-invitations",$"{{\"candidateId\":\"{Candidate}\",\"clientRequestId\":\"{EntityId.New()}\"}}"},
        new object[]{"GET","match-invitations",""},
        new object[]{"POST",$"match-invitations/{Invitation}/accept","{}"},
        new object[]{"POST",$"match-invitations/{Invitation}/decline","{}"},
        new object[]{"POST",$"match-invitations/{Invitation}/cancel","{}"},
        new object[]{"GET","game-rounds",""},
        new object[]{"GET",$"game-rounds/{Round}",""}
    };
    private static HttpRequestMessage Request(string method,string route,string body)=>new(new HttpMethod(method),"/api/v1/"+route){Content=body.Length>0?new StringContent(body,Encoding.UTF8,"application/json"):null};
    [Theory][MemberData(nameof(Routes))]
    public async Task MS_API_024_AllNineRoutes_RequireSessionAndNoStore(string method,string route,string body)
    {
        using var f=new ApiFixture();using var c=f.Native();
        using var response=await c.SendAsync(Request(method,route,body));
        Assert.Equal(HttpStatusCode.Unauthorized,response.StatusCode);Assert.True(response.Headers.CacheControl?.NoStore);
    }
    [Theory]
    [InlineData("{\"offset\":0,\"limit\":21}")][InlineData("{\"offset\":-1,\"limit\":1}")]
    [InlineData("{\"offset\":5001,\"limit\":1}")][InlineData("{\"offset\":0,\"offset\":1,\"limit\":20}")]
    [InlineData("{\"offset\":\"0\",\"limit\":20}")][InlineData("{\"offset\":0,\"limit\":20,\"score\":100}")]
    public async Task MS_API_016_StrictSearch_RejectsBadNumbersAndUnknownOrDuplicateKeys(string body)
    {
        using var f=new ApiFixture();using var c=f.Native(true);
        using var response=await c.SendAsync(Request("POST","match-candidates/search",body));
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        Assert.Equal("INVALID_MATCH_REQUEST",JsonNode.Parse(await response.Content.ReadAsStringAsync())!["code"]!.GetValue<string>());
    }
    [Theory][InlineData("match-candidates/not-an-id")][InlineData("game-rounds/not-an-id")]
    public async Task MS_API_015_MalformedReadIdentity_UsesTheSameMatchingErrorContract(string route)
    {
        using var f=new ApiFixture();using var c=f.Native(true);using var response=await c.GetAsync("/api/v1/"+route);
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);Assert.True(response.Headers.CacheControl?.NoStore);
        Assert.Equal("INVALID_MATCH_REQUEST",JsonNode.Parse(await response.Content.ReadAsStringAsync())!["code"]!.GetValue<string>());
    }
    [Theory][InlineData("web")][InlineData("android")]
    public async Task MS_API_016_029_SearchRanksBeforePagingAndPersonaIsSafe(string platform)
    {
        using var f=new ApiFixture();
        var own=Condition(EntityId.New());own["own_profile_id"]=EntityId.New();
        f.Store.CommandOverride=(cmd,p)=>cmd switch{
            "match.candidate.search"=>Result(Condition(Candidate),own),
            "match.candidate.persona.read"=>Result(new JsonObject{["nickname"]="測試旅人",["bio"]="喜歡咖啡",["selected_avatar_type"]="builtin",["selected_avatar_ref"]="male-01",["traits_json"]="[]",["interests_json"]="{\"interestTagIds\":[\"coffee\"]}",
                ["birth_date"]="private",["occupation"]="private",["object_key"]="private",["romantic_orientation_json"]="private"}),
            _=>null
        };
        using var c=f.Native(true,platform);
        using var response=await c.PostAsJsonAsync("/api/v1/match-candidates/search",new{offset=0,limit=20});
        Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        var body=JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
        var item=Assert.Single(body["items"]!.AsArray())!;Assert.Equal(Candidate,item["candidateId"]!.GetValue<string>());Assert.Equal(30,item["score"]!.GetValue<int>());
        using var persona=await c.GetAsync("/api/v1/match-candidates/"+Candidate);
        Assert.Equal(HttpStatusCode.OK,persona.StatusCode);var text=await persona.Content.ReadAsStringAsync();
        Assert.DoesNotContain("private",text);Assert.Contains("測試旅人",System.Text.RegularExpressions.Regex.Unescape(text));
    }
    private static JsonNode Result(params JsonNode[] rows)=>new JsonObject{["rows"]=new JsonArray(rows.Select(r=>r.DeepClone()).ToArray()),["changes"]=new JsonArray(0)};
    [Fact]
    public async Task GameList_SessionRevokedBetweenAuthenticationAndQuery_DoesNotReturnFalseEmptySuccess()
    {
        using var f=new ApiFixture();f.Store.CommandOverride=(command,_)=>{if(command!="game.round.list")return null;f.Store.Revoked=true;return Result();};
        using var c=f.Native(true);using var response=await c.GetAsync("/api/v1/game-rounds");Assert.Equal(HttpStatusCode.Unauthorized,response.StatusCode);
    }
    private static JsonObject Condition(string profile)=>new(){["profile_id"]=profile,["account_id"]=EntityId.New(),["birth_date"]="1990-01-01",["gender"]="diverse",["romantic_orientation_json"]="[\"diverse\"]",["region_code"]="TW-TPE",["interests_json"]="{\"interestTagIds\":[\"coffee\"],\"topicTagIds\":[],\"valueTagIds\":[]}",["preferences_json"]="{\"sharedInterestWeight\":50}"};
}
