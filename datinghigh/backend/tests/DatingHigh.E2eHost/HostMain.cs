using System.Globalization;using System.Net;using System.Security.Cryptography;using System.Text.Json;using System.Text.Json.Nodes;
using DatingHigh.Application;using DatingHigh.Domain;using DatingHigh.Infrastructure;using DatingHigh.Integration.Tests;
using Microsoft.AspNetCore.Hosting.Server;using Microsoft.AspNetCore.Hosting.Server.Features;using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection.Extensions;using Microsoft.Extensions.Logging.Abstractions;
using System.Collections.Concurrent;
namespace DatingHigh.E2eHost;

// Test-only loopback host. Production API and D1/Worker code run unchanged; provider faults and clock are controlled here.
public static class HostMain
{
    public static async Task Main()
    {
        var framework=Environment.GetEnvironmentVariable("DATINGHIGH_E2E_SCENE_FRAMEWORK")=="1";await using var platform=new RealPlatform(framework,advanceFrameworkClock:false);platform.Clock.SetUtcNow(DateTimeOffset.UtcNow);var crypto=new SequenceCodes(platform.Options);var realGoogle=Environment.GetEnvironmentVariable("DATINGHIGH_E2E_REAL_GOOGLE")=="1";
        foreach(var pair in new Dictionary<string,string>{["APP_ENV"]="local",["WEB_ORIGIN"]=platform.Options.WebOrigin,["ACCESS_TOKEN_ISSUER"]=platform.Options.Issuer,["ACCESS_TOKEN_AUDIENCE"]=platform.Options.Audience,["ACCESS_TOKEN_SECRET"]=Convert.ToBase64String(platform.Options.AccessKey),["EMAIL_CODE_HMAC_KEY"]=Convert.ToBase64String(platform.Options.EmailKey),["RATE_LIMIT_HMAC_KEY"]=Convert.ToBase64String(platform.Options.RateKey),["EmailDeliveryMode"]="Log"})Environment.SetEnvironmentVariable(pair.Key,pair.Value);
        using var avatar=Environment.GetEnvironmentVariable("DATINGHIGH_E2E_AVATAR_PROFILE")=="1"?new AvatarFixtureState(platform):null;
        var racing=new CredentialRacePlatform(platform);await using var factory=new Factory(platform,crypto,racing,realGoogle,avatar);using var api=factory.CreateClient(new WebApplicationFactoryClientOptions{HandleCookies=false,AllowAutoRedirect=false});
        var builder=WebApplication.CreateBuilder();builder.Logging.ClearProviders();builder.WebHost.UseUrls("http://127.0.0.1:0");var host=builder.Build();var key=Convert.ToHexString(RandomNumberGenerator.GetBytes(32));var mailBase=0;string? storySocketOrigin=null;
        var denyNativeWrites=false;var matchingRoundsUnavailable=false;var delayNativeWritesMs=0;var roundCommandDelayMs=0;long clockAdvance=0,clockObserved=0;var nativeMetrics=new ConcurrentQueue<JsonElement>();var requests=new ConcurrentQueue<object>();var starts=new ConcurrentQueue<object>();var faults=new List<(string Path,string Mode,int Delay,int Skip)>();var faultLock=new object();
        var terminations=new ConcurrentQueue<object>();
        var selectedAvatars=new Dictionary<int,(string? Type,string? Ref)>();
        host.Use(async(context,next)=>{
            try{await next(context);}catch(DomainException error)when(context.Request.Path=="/_test/control"){
                context.Response.StatusCode=error.Status;await context.Response.WriteAsJsonAsync(new{code=error.Code});
            }catch(Exception error)when(context.Request.Path=="/_test/control"){
                context.Response.StatusCode=500;await context.Response.WriteAsJsonAsync(new{code="CONTROL_FIXTURE_FAILURE",failureType=error.GetType().Name});
            }
        });
        host.MapGet("/_test/native-mode",(HttpContext context)=>{context.Response.Headers.CacheControl="no-store";return Results.Json(new{denyWrites=denyNativeWrites,delayWritesMs=delayNativeWritesMs,clockAdvance=Interlocked.Read(ref clockAdvance)});});
        host.MapPost("/_test/native-clock",async(HttpContext context)=>{var item=await context.Request.ReadFromJsonAsync<JsonElement>();var observed=item.GetProperty("milliseconds").GetInt64();if(observed<0||observed>Interlocked.Read(ref clockAdvance))return Results.BadRequest();Interlocked.Exchange(ref clockObserved,observed);return Results.Json(new{recorded=true});});
        host.MapPost("/_test/native-metrics",async(HttpContext context)=>{
            var item=await context.Request.ReadFromJsonAsync<JsonElement>();if(item.EnumerateObject().Any(p=>p.Name is not("operation" or "key" or "fields" or "persisted"))||item.GetProperty("key").GetString() is not("datinghigh.refresh" or "datinghigh.email-flow" or "datinghigh.pending-revoke"))return Results.BadRequest();nativeMetrics.Enqueue(item.Clone());return Results.Json(new{recorded=true});
        });
        host.MapPost("/_test/control",async(HttpContext context)=>{
            if(context.Request.Headers["X-DatingHigh-Test-Control"]!=key)return Results.StatusCode(403);
            var body=await context.Request.ReadFromJsonAsync<JsonElement>();var op=body.GetProperty("op").GetString();
            if(op=="reset"){
                selectedAvatars.Clear();
                terminations.Clear();
                if(framework){await platform.Sql("DELETE FROM game_event_instances");await platform.Sql("DELETE FROM game_scene_visits");}
                foreach(var sql in new[]{"DELETE FROM game_interaction_instances","DELETE FROM game_round_events","DELETE FROM game_story_sessions","DELETE FROM game_active_round_claims","DELETE FROM game_rounds","DELETE FROM match_invitations","DELETE FROM match_conditions","DELETE FROM user_media_assets","DELETE FROM user_profiles","UPDATE auth_refresh_tokens SET replaced_by_token_id=NULL","DELETE FROM auth_refresh_tokens","DELETE FROM auth_email_challenges","DELETE FROM auth_sessions","DELETE FROM auth_external_identities","DELETE FROM auth_accounts","DELETE FROM common_rate_limit_buckets"})await platform.Sql(sql);
                avatar?.Reset();
                crypto.Reset();racing.Reset();await platform.Provider("success");mailBase=platform.MailCalls;requests.Clear();starts.Clear();nativeMetrics.Clear();lock(faultLock)faults.Clear();denyNativeWrites=false;matchingRoundsUnavailable=false;delayNativeWritesMs=0;roundCommandDelayMs=0;
                if(body.TryGetProperty("accountKind",out var kind)){if(kind.GetString() is not("local" or "google-only" or "none"))return Results.BadRequest();string? email=null;if(body.TryGetProperty("email",out var supplied)){if(!realGoogle)return Results.BadRequest();try{email=EmailAddress.Normalize(supplied.GetString()??"");}catch(DomainException){return Results.BadRequest();}}if(kind.GetString()!="none")await platform.Seed(kind.GetString()=="local",email);}
                else if(body.TryGetProperty("seed",out var seed)&&seed.GetBoolean())await platform.Seed(true);return Results.Json(new{ready=true});
            }
            if(op=="story-info")return storySocketOrigin is null?Results.NotFound():Results.Json(new{socketOrigin=storySocketOrigin});
            if(op=="story-avatar-readiness"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_PROFILE")!="1")return Results.NotFound();
                var player=body.GetProperty("player").GetInt32();if(player is <0 or >1)return Results.BadRequest();var ready=body.GetProperty("ready").GetBoolean();
                var row=(await platform.Sql("SELECT p.account_id,p.selected_avatar_type,p.selected_avatar_ref FROM user_profiles p JOIN auth_accounts a ON a.account_id=p.account_id WHERE a.email_normalized=?",$"matching-{player}@example.test")).Single()!;
                if(!ready){selectedAvatars.TryAdd(player,(row.Maybe("selected_avatar_type"),row.Maybe("selected_avatar_ref")));await platform.Sql("UPDATE user_profiles SET selected_avatar_type=NULL,selected_avatar_ref=NULL WHERE account_id=?",row.Text("account_id"));}
                else{if(!selectedAvatars.Remove(player,out var selected))return Results.BadRequest();await platform.Sql("UPDATE user_profiles SET selected_avatar_type=?,selected_avatar_ref=? WHERE account_id=?",selected.Type,selected.Ref,row.Text("account_id"));}
                return Results.Json(new{ready});
            }
            if(op=="story-command-delay"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_PROFILE")!="1")return Results.NotFound();var milliseconds=body.GetProperty("milliseconds").GetInt32();if(milliseconds is <0 or >15000)return Results.BadRequest();Volatile.Write(ref roundCommandDelayMs,milliseconds);return Results.Json(new{configured=true});
            }
            if(op=="scene-categories"){
                if(!framework)return Results.NotFound();var count=body.GetProperty("count").GetInt32();if(count is not(2 or 3))return Results.BadRequest();
                return Results.Json(await platform.ExecuteAsync("$test-framework-categories",new{count},context.RequestAborted));
            }
            if(op=="scene-events"){
                if(!framework)return Results.NotFound();var probability=body.GetProperty("probability").GetInt32();if(probability is not(0 or 1))return Results.BadRequest();return Results.Json(await platform.ExecuteAsync("$test-framework-events",new{probability},context.RequestAborted));
            }
            if(op=="scene-state"){
                if(!framework)return Results.NotFound();return Results.Json(new{sessions=await platform.Sql("SELECT story_session_id,episode_seq,chapter_status,progress_revision FROM game_story_sessions ORDER BY episode_seq"),visits=await platform.Sql("SELECT story_session_id,visit_seq,left_at FROM game_scene_visits"),events=await platform.Sql("SELECT binding_id,status,revision FROM game_event_instances"),rounds=await platform.Sql("SELECT status,last_event_seq FROM game_rounds")});
            }
            if(op=="story-avatar-pack")return avatar is null||Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_PROFILE")!="1"?Results.NotFound():Results.Json(await avatar.StoryPack(body.GetProperty("player").GetInt32(),context.RequestAborted));
            if(op=="avatar-current-pack")return avatar is null?Results.NotFound():Results.Json(await avatar.CurrentPack(context.RequestAborted));
            if(op=="provider"){await platform.Provider(body.GetProperty("mode").GetString()!,false);return Results.Json(new{configured=true});}
            if(op=="matching-seed"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                var ids=new List<object>();
                for(var n=0;n<3;n++){
                    var email=$"matching-{n}@example.test";await platform.Seed(true,email);
                    var login=RealPlatform.Json((await platform.App.Login(email,RealPlatform.Password,"android","127.0.0.1",default)).Body);
                    var user=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
                    var profiles=new DatingProfileService(platform,platform.Clock);await profiles.ReadAsync(user);
                    await profiles.SaveAsync(user,new(1,$"測試旅人{n}","喜歡散步與咖啡",null,"1990-01-01","TW-TPE",["warm"],["coffee"],[],[],"explore",null,null,null,null,null,null,[],50,"diverse",["male","female","diverse"],new()));
                    await platform.ExecuteAsync("profile.avatar.builtin",new{accountId=user.AccountId,sessionId=user.SessionId,cv=1,accessExpiresAt=user.AccessExpiresAt,expectedRevision=2,avatarId=$"male-0{n+1}"});
                    ids.Add(new{candidateId=(await platform.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",user.AccountId))[0]!.Text("profile_id")});
                }
                return Results.Json(new{players=ids});
            }
            if(op=="matching-state"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                return Results.Json(new{invitations=await platform.Sql("SELECT invitation_id,status,invalidated_reason FROM match_invitations"),rounds=await platform.Sql("SELECT round_id,status FROM game_rounds"),participants=await platform.Sql("SELECT round_id FROM game_active_round_claims")});
            }
            if(op=="matching-end"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                var roundId=body.GetProperty("roundId").GetString();if(!EntityId.IsValid(roundId))return Results.BadRequest();
                var actor=(await platform.Sql("SELECT s.account_id,s.session_id,s.credential_version FROM game_rounds r JOIN auth_sessions s ON s.account_id=r.account_low_id AND s.revoked_at IS NULL WHERE r.round_id=?",roundId!)).Single()!;
                await platform.ExecuteAsync("game.round.end",new{accountId=actor.Text("account_id"),sessionId=actor.Text("session_id"),cv=(int)actor.Number("credential_version"),accessExpiresAt=platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds(),roundId});
                return Results.Json(new{ended=true});
            }
            if(op=="matching-rounds-mode"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                matchingRoundsUnavailable=body.GetProperty("unavailable").GetBoolean();return Results.Json(new{configured=true});
            }
            if(op=="matching-profile"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                var player=body.GetProperty("player").GetInt32();var mode=body.GetProperty("mode").GetString();
                if(player is <0 or >2 || mode is not("ready" or "orientation-empty" or "male-only" or "hard-loss"))return Results.BadRequest();
                var row=(await platform.Sql("SELECT a.account_id,a.credential_version,s.session_id FROM auth_accounts a JOIN auth_sessions s ON s.account_id=a.account_id WHERE a.email_normalized=? AND s.revoked_at IS NULL",$"matching-{player}@example.test")).Single()!;
                var user=new CurrentUser(row.Text("account_id"),row.Text("session_id"),(int)row.Number("credential_version"),platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
                var profiles=new DatingProfileService(platform,platform.Clock);var own=await profiles.ReadAsync(user);
                var orientation=mode=="orientation-empty"?Array.Empty<string>():mode=="male-only"?new[]{"male"}:new[]{"male","female","diverse"};
                await profiles.SaveAsync(user,new(own.Number("revision"),$"測試旅人{player}","喜歡散步與咖啡",null,"1990-01-01","TW-TPE",["warm"],["coffee"],[],[],"explore",null,null,null,null,null,null,[],50,mode=="hard-loss"?"female":"diverse",orientation,new()));
                return Results.Json(new{changed=true});
            }
            if(op=="matching-more"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                var time=platform.Clock.GetUtcNow().ToUnixTimeMilliseconds();
                for(var n=0;n<21;n++){
                    var accountId=EntityId.New();var profileId=EntityId.New();
                    await platform.Sql("INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) VALUES(?,?,?,'active',1,?,?)",accountId,$"matching-page-{n}@example.test",time,time,time);
                    await platform.Sql("INSERT INTO user_profiles(profile_id,account_id,nickname,birth_date,gender,romantic_orientation_json,selected_avatar_type,selected_avatar_ref,created_at,updated_at) VALUES(?,?,?,'1990-01-01','diverse','[\"diverse\"]','builtin','male-01',?,?)",profileId,accountId,$"分頁旅人{n}",time,time);
                    await platform.Sql("INSERT INTO match_conditions SELECT profile_id,account_id,gender,romantic_orientation_json,birth_date,region_code,interests_json,preferences_json,created_at,updated_at FROM user_profiles WHERE profile_id=?",profileId);
                }
                return Results.Json(new{created=21});
            }
            if(op=="matching-expire"){
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_MATCHING_PROFILE")!="1")return Results.NotFound();
                platform.Clock.Advance(TimeSpan.FromMilliseconds(1));
                await platform.Sql("UPDATE match_invitations SET expires_at=? WHERE status='pending'",platform.Clock.GetUtcNow().ToUnixTimeMilliseconds());return Results.Json(new{expired=true});
            }
            if(op=="align-send-window"){var now=platform.Clock.GetUtcNow().ToUnixTimeMilliseconds();var advance=(now/3600000+1)*3600000-now;platform.Clock.Advance(TimeSpan.FromMilliseconds(advance));Interlocked.Add(ref clockAdvance,advance);return Results.Json(new{aligned=true});}
            if(op=="advance"){var milliseconds=body.GetProperty("milliseconds").GetInt32();if(milliseconds is <0 or >1800000)return Results.BadRequest();platform.Clock.Advance(TimeSpan.FromMilliseconds(milliseconds));Interlocked.Add(ref clockAdvance,milliseconds);return Results.Json(new{advanced=true,clockAdvance=Interlocked.Read(ref clockAdvance)});}
            if(op=="mail-progress")return Results.Json(new{calls=platform.MailCalls-mailBase});
            if(op=="challenge"){
                var id=body.GetProperty("id").GetString()!;if(!EntityId.IsValid(id))return Results.BadRequest();
                if(body.TryGetProperty("failures",out var failures)){var count=failures.GetInt32();if(count is <0 or >5)return Results.BadRequest();await platform.Sql("UPDATE auth_email_challenges SET failed_attempts=? WHERE challenge_id=?",count,id);}
                var rows=await platform.Sql("SELECT challenge_id,generation,failed_attempts,state,absolute_expires_at FROM auth_email_challenges WHERE challenge_id=?",id);return Results.Json(rows.FirstOrDefault());
            }
            if(op=="provider-stats")return Results.Json(await platform.ProviderStats());
            if(op=="avatar-mode")return avatar is not null&&avatar.Configure(body.GetProperty("mode").GetString()??"")?Results.Json(new{configured=true}):Results.BadRequest();
            if(op=="avatar-seed-photos"){var count=body.TryGetProperty("count",out var requested)?requested.GetInt32():2;if(count is <1 or >5)return Results.BadRequest();return avatar is null?Results.NotFound():Results.Json(await avatar.SeedPhotos(count,context.RequestAborted));}
            if(op=="avatar-state")return avatar is null?Results.NotFound():Results.Json(await avatar.Snapshot());
            if(op=="avatar-revision")return avatar is null?Results.NotFound():Results.Json(await avatar.AdvanceRevision());
            if(op=="avatar-retire-choice"){if(avatar is null)return Results.NotFound();avatar.RetireChoice();return Results.Json(new{configured=true});}
            if(op=="native-mode"){var delay=body.TryGetProperty("delayWritesMs",out var configuredDelay)?configuredDelay.GetInt32():0;if(delay is <0 or >30000)return Results.BadRequest();denyNativeWrites=body.GetProperty("denyWrites").GetBoolean();delayNativeWritesMs=delay;return Results.Json(new{configured=true});}
            if(op=="native-metrics")return Results.Json(nativeMetrics);
            if(op=="native-clock-observed")return Results.Json(new{milliseconds=Interlocked.Read(ref clockObserved)});
            if(op=="account-state")return Results.Json(new{accounts=await platform.Sql("SELECT account_id,credential_version,status,password_hash IS NOT NULL AS has_local_password FROM auth_accounts"),sessions=await platform.Sql("SELECT session_id,account_id,client_platform,credential_version,current_generation,revoked_at IS NOT NULL AS revoked FROM auth_sessions"),identities=await platform.Sql("SELECT account_id,provider FROM auth_external_identities")});
            if(op=="race-credential-version"){racing.Arm();return Results.Json(new{configured=true});}
            if(op=="clear-refreshes"){await platform.Sql("UPDATE auth_refresh_tokens SET replaced_by_token_id=NULL");await platform.Sql("DELETE FROM auth_refresh_tokens");return Results.Json(new{cleared=true});}
            if(op=="fault-response"){
                var path=body.GetProperty("path").GetString();var mode=body.GetProperty("mode").GetString();var delay=body.TryGetProperty("milliseconds",out var ms)?ms.GetInt32():0;var skip=body.TryGetProperty("skip",out var skipped)?skipped.GetInt32():0;
                if(!(AllowedPath(path)||path=="/api/v1/me/avatar/expressions/next")||mode is null||(!FaultResponses.ContainsKey(mode)&&mode is not("drop" or "delay" or "hang-before" or "hang-after"))||delay is <0 or >46000||skip is <0 or >12)return Results.BadRequest();lock(faultLock)faults.Add((path!,mode,delay,skip));return Results.Json(new{configured=true});
            }
            if(op=="request-stats")return Results.Json(requests);
            if(op=="request-starts")return Results.Json(starts);
            if(op=="request-terminations")return Results.Json(terminations);
            if(op=="shutdown"){context.Response.OnCompleted(()=>{host.Lifetime.StopApplication();return Task.CompletedTask;});return Results.Json(new{stopping=true});}
            return Results.NotFound();
        });
        host.MapPost("/_test/round-command",async(HttpContext context)=>{
            if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_PROFILE")!="1"||context.Request.Headers["X-DatingHigh-Test-Control"]!=key){context.Response.StatusCode=403;return;}
            var delay=Volatile.Read(ref roundCommandDelayMs);if(delay>0)await Task.Delay(delay,context.RequestAborted);
            platform.ObserveUtcNow(DateTimeOffset.UtcNow.AddMilliseconds(Interlocked.Read(ref clockAdvance)));
            using var command=new HttpRequestMessage(HttpMethod.Post,"/internal/round-command"){Content=new StreamContent(context.Request.Body)};
            command.Content.Headers.ContentType=new("application/json");command.Headers.Add("X-DatingHigh-Internal-Environment","local");command.Headers.Add("X-DatingHigh-Internal-Round-Transport","websocket");
            using var result=await api.SendAsync(command,context.RequestAborted);requests.Enqueue(new{path="/internal/round-command",method="POST",status=(int)result.StatusCode,stage="api"});context.Response.StatusCode=(int)result.StatusCode;context.Response.ContentType="application/json";await result.Content.CopyToAsync(context.Response.Body,context.RequestAborted);
        });
        host.Map("/{**path}",async context=>{
            var path=context.Request.Path.ToString();
            if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_PROFILE")=="1")platform.ObserveUtcNow(DateTimeOffset.UtcNow.AddMilliseconds(Interlocked.Read(ref clockAdvance)));
            if(path.StartsWith("/story-content/",StringComparison.Ordinal)&&storySocketOrigin is not null){using var client=new HttpClient();using var content=await client.GetAsync(storySocketOrigin+path,context.RequestAborted);context.Response.StatusCode=(int)content.StatusCode;foreach(var h in content.Content.Headers)context.Response.Headers[h.Key]=h.Value.ToArray();await content.Content.CopyToAsync(context.Response.Body,context.RequestAborted);return;}
            var started=System.Diagnostics.Stopwatch.GetTimestamp();starts.Enqueue(new{path,method=context.Request.Method,receivedAt=DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()});string? mode;int delay;
            if(matchingRoundsUnavailable&&path=="/api/v1/game-rounds"){
                context.Response.Headers.CacheControl="no-store";context.Response.StatusCode=503;await context.Response.WriteAsJsonAsync(new{code="DEPENDENCY_UNAVAILABLE"});return;
            }
            lock(faultLock){var fault=faults.FindIndex(f=>f.Path==path);mode=null;delay=0;if(fault>=0){var configured=faults[fault];if(configured.Skip>0)faults[fault]=(configured.Path,configured.Mode,configured.Delay,configured.Skip-1);else{mode=configured.Mode;delay=configured.Delay;faults.RemoveAt(fault);}}}
            if(mode is not null&&FaultResponses.TryGetValue(mode,out var rejection)){requests.Enqueue(new{path,method=context.Request.Method,status=rejection.Status,stage="proxy"});context.Response.StatusCode=rejection.Status;await context.Response.WriteAsJsonAsync(new{code=rejection.Code,traceId="controlled-proxy-trace"});return;}
            if(mode=="hang-before"){requests.Enqueue(new{path,method=context.Request.Method,status=0,stage="before-handler"});try{await Task.Delay(Timeout.Infinite,context.RequestAborted);}catch(OperationCanceledException){}terminations.Enqueue(new{path,method=context.Request.Method,elapsedMilliseconds=System.Diagnostics.Stopwatch.GetElapsedTime(started).TotalMilliseconds});return;}
            if(mode=="delay"){try{await Task.Delay(delay,context.RequestAborted);}catch(OperationCanceledException){requests.Enqueue(new{path,method=context.Request.Method,status=0,stage="before-handler"});return;}}
            using var request=new HttpRequestMessage(new HttpMethod(context.Request.Method),context.Request.Path+context.Request.QueryString);
            request.Content=new StreamContent(context.Request.Body);
            foreach(var header in context.Request.Headers){if(header.Key.Equals("Host",StringComparison.OrdinalIgnoreCase)||header.Key.StartsWith("X-DatingHigh-Internal-",StringComparison.OrdinalIgnoreCase))continue;if(!request.Headers.TryAddWithoutValidation(header.Key,header.Value.ToArray()))request.Content.Headers.TryAddWithoutValidation(header.Key,header.Value.ToArray());}
            request.Headers.Add("X-DatingHigh-Internal-Environment","local");request.Headers.Add("X-DatingHigh-Internal-Request-Id",Guid.NewGuid().ToString("D"));request.Headers.Add("X-DatingHigh-Internal-Client-Ip","127.0.0.1");
            using var response=await api.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,context.RequestAborted);requests.Enqueue(new{path,method=context.Request.Method,status=(int)response.StatusCode,stage="api"});
            if(mode=="hang-after"){try{await Task.Delay(Timeout.Infinite,context.RequestAborted);}catch(OperationCanceledException){}return;}
            if(mode=="drop"){context.Abort();return;}context.Response.StatusCode=(int)response.StatusCode;
            foreach(var header in response.Headers.Concat(response.Content.Headers)){if(!header.Key.Equals("Transfer-Encoding",StringComparison.OrdinalIgnoreCase))context.Response.Headers[header.Key]=header.Value.ToArray();}
            context.Response.Headers.Date=platform.Clock.GetUtcNow().ToString("R",CultureInfo.InvariantCulture);await response.Content.CopyToAsync(context.Response.Body,context.RequestAborted);
        });
        await host.StartAsync();var url=host.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_PROFILE")=="1")storySocketOrigin=(await platform.ExecuteAsync("$test-realtime-origin",new{origin=url,key})).Text("origin");Console.WriteLine(JsonSerializer.Serialize(new{url,key}));await host.WaitForShutdownAsync();await host.DisposeAsync();
    }
    private static bool AllowedPath(string? path)=>path is "/api/v1/session" or "/api/v1/session/refresh" or "/api/v1/sessions" or "/api/v1/accounts" or "/api/v1/email-registrations" or "/api/v1/password-reset-requests" or "/api/v1/password-resets" or "/api/v1/me" or "/api/v1/me/password" or "/api/v1/me/identities" or "/api/v1/me/identities/google" or "/api/v1/game-rounds" or "/api/v1/me/dating-profile" or "/api/v1/match-candidates/search" or "/api/v1/match-invitations"||(path?.StartsWith("/api/v1/email-challenges/",StringComparison.Ordinal)==true&&path.EndsWith("/resend",StringComparison.Ordinal)&&EntityId.IsValid(path[25..^7]));
    private static readonly IReadOnlyDictionary<string,(int Status,string Code)> FaultResponses=new Dictionary<string,(int,string)>{["refresh-conflict"]=(409,"REFRESH_RETRY"),["access-expired"]=(401,"ACCESS_TOKEN_EXPIRED"),["access-missing"]=(401,"ACCESS_TOKEN_MISSING"),["access-invalid"]=(401,"ACCESS_TOKEN_INVALID"),["session-revoked"]=(401,"SESSION_REVOKED"),["refresh-reuse"]=(401,"REFRESH_TOKEN_REUSE"),["refresh-revoked"]=(401,"REFRESH_REVOKED"),["refresh-expired"]=(401,"REFRESH_EXPIRED"),["server-error"]=(500,"INTERNAL_ERROR"),["unavailable"]=(503,"DEPENDENCY_UNAVAILABLE"),["image-provider-unavailable"]=(503,"IMAGE_PROVIDER_UNAVAILABLE"),["gateway-timeout"]=(504,"DEPENDENCY_UNAVAILABLE")};
    private sealed class CredentialRacePlatform(RealPlatform platform):IPlatformClient
    {
        private int armed;public void Arm()=>Interlocked.Exchange(ref armed,1);public void Reset()=>Interlocked.Exchange(ref armed,0);
        public async Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default)
        {
            if(command=="account.change-password"&&Interlocked.Exchange(ref armed,0)==1){var account=JsonSerializer.SerializeToNode(payload)!["accountId"]!.GetValue<string>();if(!EntityId.IsValid(account))throw new InvalidOperationException("Invalid controlled account");await platform.Sql("UPDATE auth_accounts SET credential_version=credential_version+1 WHERE account_id=?",account);}
            return await platform.ExecuteAsync(command,payload,cancellationToken);
        }
    }
    private sealed class Factory(RealPlatform platform,SequenceCodes crypto,CredentialRacePlatform racing,bool realGoogle,AvatarFixtureState? avatar):WebApplicationFactory<global::Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder){builder.UseContentRoot(Path.GetFullPath("backend/src/DatingHigh.Api"));builder.ConfigureLogging(log=>log.ClearProviders());builder.ConfigureServices(services=>{
            services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(racing);services.RemoveAll<TimeProvider>();services.AddSingleton<TimeProvider>(platform.Clock);services.RemoveAll<IAuthCryptography>();services.AddSingleton<IAuthCryptography>(crypto);
            services.RemoveAll<IEmailCodeSender>();services.AddSingleton<IEmailCodeSender>(new EmailCodeSender(platform.Options with{Environment="staging",EmailDeliveryMode="Cloudflare"},platform,NullLoggerFactory.Instance));
            if(avatar is not null){services.RemoveAll<DatingHigh.Application.Media.IPrivateMediaStore>();services.AddSingleton<DatingHigh.Application.Media.IPrivateMediaStore>(avatar.Media);services.RemoveAll<IAvatarCandidateStore>();services.AddSingleton<IAvatarCandidateStore>(avatar.Candidates);
                if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_REAL_GEMINI")=="1"){
                    if(string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GEMINI_API_KEY")))throw new InvalidOperationException("Real Gemini requires configured credentials");
                    // 明選真模型時保留正式DI；只有隔離D1/R2 bridge被替換。
                    var output=Environment.GetEnvironmentVariable("DATINGHIGH_E2E_GEMINI_EVIDENCE");
                    if(output is not null){var directory=Path.GetFullPath(output);var allowed=Path.GetFullPath(".local/evidence/avatar-full-body-gemini")+Path.DirectorySeparatorChar;if(!directory.StartsWith(allowed,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Invalid generated evidence directory");Directory.CreateDirectory(directory);
                        services.AddHttpClient<DatingHigh.Application.Media.IAvatarImageGenerator,DatingHigh.Infrastructure.Media.GeminiAvatarImageGenerator>(h=>h.Timeout=TimeSpan.FromSeconds(100)).ConfigurePrimaryHttpMessageHandler(()=>new GeminiImageEvidence(directory){InnerHandler=new SocketsHttpHandler{AllowAutoRedirect=false}});
                        services.AddHttpClient<DatingHigh.Application.Media.IAvatarExpressionGenerator,DatingHigh.Infrastructure.Media.GeminiAvatarImageGenerator>(h=>h.Timeout=TimeSpan.FromSeconds(100)).ConfigurePrimaryHttpMessageHandler(()=>new GeminiImageEvidence(directory){InnerHandler=new SocketsHttpHandler{AllowAutoRedirect=false}});
                    }
                    // 分段人工確認後沿用同一張真生成master，不重新產人臉；測試報告須明示此候選為重播。
                    if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_APPROVED_MASTER") is string approved){services.RemoveAll<DatingHigh.Application.Media.IAvatarImageGenerator>();services.AddSingleton(ReadApprovedMaster(approved));}
                }else{services.RemoveAll<DatingHigh.Application.Media.IAvatarImageGenerator>();services.AddSingleton<DatingHigh.Application.Media.IAvatarImageGenerator>(avatar);services.RemoveAll<DatingHigh.Application.Media.IAvatarExpressionGenerator>();services.AddSingleton<DatingHigh.Application.Media.IAvatarExpressionGenerator>(avatar);}
                services.RemoveAll<DatingHigh.Application.Media.IAvatarExpressionStore>();services.AddSingleton<DatingHigh.Application.Media.IAvatarExpressionStore>(avatar.Expressions);services.RemoveAll<IAvatarReadStore>();services.AddSingleton<IAvatarReadStore>(avatar.Reads);}
            services.RemoveAll<IExternalCredentialValidator>();if(realGoogle){var clients=(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_GOOGLE_CLIENTS")??"").Split(',',StringSplitOptions.RemoveEmptyEntries|StringSplitOptions.TrimEntries);if(clients.Length==0||clients.Any(id=>!id.EndsWith(".apps.googleusercontent.com",StringComparison.Ordinal)))throw new InvalidOperationException("Missing real Google test client IDs");services.AddSingleton<IExternalCredentialValidator>(new GoogleExternalCredentialValidator(new Dictionary<string,string[]>{["android"]=clients}));}else services.AddSingleton<IExternalCredentialValidator>(new ControlledGoogle());
        });}
    }
    private static DatingHigh.Application.Media.IAvatarImageGenerator ReadApprovedMaster(string file)
    {
        var absolute=Path.GetFullPath(file);var allowed=Path.GetFullPath(".local/evidence/avatar-full-body-gemini")+Path.DirectorySeparatorChar;
        if(!absolute.StartsWith(allowed,StringComparison.OrdinalIgnoreCase)||Path.GetFileName(absolute)!="candidate.jpg")throw new InvalidOperationException("Invalid approved generated master");
        using var result=JsonDocument.Parse(File.ReadAllBytes(Path.Combine(Path.GetDirectoryName(absolute)!,"result.json")));
        var bytes=File.ReadAllBytes(absolute);var sha=Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(bytes));
        if(result.RootElement.GetProperty("visualApproval").GetString()!="approved-by-user"||result.RootElement.GetProperty("candidateSha256").GetString()!=sha)throw new InvalidOperationException("Generated master needs matching user approval");
        using var bitmap=SkiaSharp.SKBitmap.Decode(bytes);if(bitmap is null||bytes.Length>2000000)throw new InvalidOperationException("Invalid generated master bytes");
        return new ApprovedMaster(bytes,bitmap.Width,bitmap.Height);
    }
    private sealed class ApprovedMaster(byte[] bytes,int width,int height):DatingHigh.Application.Media.IAvatarImageGenerator
    {
        public Task<DatingHigh.Application.Media.CompressedImage> GenerateAsync(IReadOnlyList<DatingHigh.Application.Media.PrivateMediaContent> photos,string styleId,CancellationToken ct=default)=>Task.FromResult(new DatingHigh.Application.Media.CompressedImage(bytes,"image/jpeg",width,height));
    }
    // 只限明選真供應商的測試host：只保存供應商生成圖，不保存request、原始照片、header或token。
    private sealed class GeminiImageEvidence(string directory):DelegatingHandler
    {
        private static int sequence=Environment.GetEnvironmentVariable("DATINGHIGH_E2E_APPROVED_MASTER") is null?0:1;
        private int providerCalls;
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)
        {
            HttpResponseMessage response;
            if(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_GEMINI_REPLAY") is string replay){
                if(int.TryParse(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_GEMINI_FAIL_EXPRESSION_AT"),out var failAt)&&failAt>0&&Interlocked.Increment(ref providerCalls)==failAt)
                    return new(HttpStatusCode.ServiceUnavailable){Content=new StringContent("{\"error\":{\"code\":503,\"status\":\"UNAVAILABLE\"}}")};
                var source=Path.GetFullPath(replay);var allowed=Path.GetFullPath(".local/evidence/avatar-full-body-gemini")+Path.DirectorySeparatorChar;
                if(!source.StartsWith(allowed,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Invalid recorded generated image directory");
                using var approval=JsonDocument.Parse(File.ReadAllBytes(Path.Combine(source,"result.json")));
                if(approval.RootElement.GetProperty("visualApproval").GetString()!="expressions-and-identity-approved-by-user")throw new InvalidOperationException("Recorded expression identity approval required");
                var index=Volatile.Read(ref sequence)+1;var file=Path.Combine(source,$"provider-{index:00}.jpg");var recorded=await File.ReadAllBytesAsync(file,ct);
                if(recorded.Length is <1 or >2000000)throw new InvalidOperationException("Invalid recorded generated image size");
                // 明示重播已取得的真供應商圖片，只驗新去背／無損編碼與D1/R2接線；不發新供應商請求。
                response=new(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{modelVersion="recorded-response-no-provider-call",candidates=new[]{new{content=new{parts=new[]{new{inlineData=new{mimeType="image/jpeg",data=Convert.ToBase64String(recorded)}}}}}}}))};
            }else response=await base.SendAsync(request,ct);
            if(!response.IsSuccessStatusCode)return response;
            var bytes=await response.Content.ReadAsByteArrayAsync(ct);if(bytes.Length>12*1024*1024)throw new InvalidOperationException("Provider evidence too large");
            using var json=JsonDocument.Parse(bytes,new JsonDocumentOptions{MaxDepth=16});
            if(json.RootElement.TryGetProperty("candidates",out var candidates))foreach(var candidate in candidates.EnumerateArray())
                if(candidate.TryGetProperty("content",out var content)&&content.TryGetProperty("parts",out var parts))foreach(var part in parts.EnumerateArray())
                    if(part.TryGetProperty("inlineData",out var image)&&image.TryGetProperty("mimeType",out var mime)&&image.TryGetProperty("data",out var data)){
                        var extension=mime.GetString() switch{"image/png"=>"png","image/jpeg"=>"jpg","image/webp"=>"webp",_=>null};if(extension is not null){
                            var index=Interlocked.Increment(ref sequence);await File.WriteAllBytesAsync(Path.Combine(directory,$"provider-{index:00}.{extension}"),Convert.FromBase64String(data.GetString()!),ct);
                            if(json.RootElement.TryGetProperty("modelVersion",out var model)&&model.ValueKind==JsonValueKind.String&&model.GetString() is string value&&System.Text.RegularExpressions.Regex.IsMatch(value,"^[a-zA-Z0-9._-]{1,128}$"))await File.WriteAllTextAsync(Path.Combine(directory,$"provider-{index:00}-metadata.json"),JsonSerializer.Serialize(new{reportedModelVersion=value}),ct);
                        }
                    }
            return response;
        }
    }
    private sealed class SequenceCodes(AuthOptions options):IAuthCryptography
    {
        private readonly AuthCryptography real=new(options);private int next;public void Reset()=>next=0;
        public string Code()=>Interlocked.Increment(ref next).ToString("D6",CultureInfo.InvariantCulture);public string RandomToken()=>real.RandomToken();public string Sha(string value)=>real.Sha(value);
        public string CodeMac(string id,string purpose,string email,int generation,string code)=>real.CodeMac(id,purpose,email,generation,code);public bool EqualsHash(string? left,string? right)=>real.EqualsHash(left,right);
    }
    // 僅供 UI／Cookie 故障測試；不代表真 Google proof、JWKS 或 OAuth 驗收。
    private sealed class ControlledGoogle:IExternalCredentialValidator
    {
        public Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken cancellationToken=default)
        {
            if(provider!="google"||credential!="controlled-memory-proof")throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);
            return Task.FromResult(new VerifiedExternalIdentity("google","controlled-google-only-subject",RealPlatform.Email));
        }
    }
}
