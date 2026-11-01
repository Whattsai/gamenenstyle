using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authentication;
using DatingHigh.Api;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;

var builder=WebApplication.CreateBuilder(args);
var cfg=builder.Configuration;
var options=AuthOptions.Load(key=>cfg[key]);
bool Configured()=>Readiness.OptionsValid(options);
builder.Services.AddSingleton(options);builder.Services.AddSingleton(TimeProvider.System);builder.Services.AddSingleton<PasswordHashService>();builder.Services.AddSingleton<AccessTokens>();
builder.Services.AddSingleton<IPasswordHashService>(sp=>sp.GetRequiredService<PasswordHashService>());builder.Services.AddSingleton<IAccessTokenIssuer>(sp=>sp.GetRequiredService<AccessTokens>());builder.Services.AddSingleton<IAuthCryptography,AuthCryptography>();
builder.Services.AddHttpClient<IPlatformClient,CloudflarePlatformClient>(http=>{http.BaseAddress=new Uri("http://platform.internal/");http.Timeout=TimeSpan.FromSeconds(15);});
builder.Services.AddScoped<RateLimiter>();builder.Services.AddScoped<IEmailCodeSender,EmailCodeSender>();builder.Services.AddScoped<AuthApplication>();
builder.Services.AddScoped<DatingHigh.Application.RateLimiting.IRateLimiter>(sp=>sp.GetRequiredService<RateLimiter>());builder.Services.AddScoped<Readiness>();builder.Services.AddScoped<IPrivateObjectStore,PrivateObjectStore>();
builder.Services.AddSingleton<IExternalCredentialValidator>(sp=>new GoogleExternalCredentialValidator(new Dictionary<string,string[]>{["web"]=(cfg["GOOGLE_WEB_CLIENT_ID"]??"").Split(',',StringSplitOptions.RemoveEmptyEntries),["ios"]=(cfg["GOOGLE_IOS_ALLOWED_CLIENTS"]??"").Split(',',StringSplitOptions.RemoveEmptyEntries),["android"]=(cfg["GOOGLE_ANDROID_ALLOWED_CLIENTS"]??"").Split(',',StringSplitOptions.RemoveEmptyEntries)},keySource:sp.GetRequiredService<IPlatformClient>()));
builder.Services.AddAuthentication("Platform").AddScheme<AuthenticationSchemeOptions,PlatformAuthentication>("Platform",_=>{});
builder.Services.AddAuthorization(o=>o.AddPolicy("PlatformAccess",p=>p.AddAuthenticationSchemes("Platform").RequireAuthenticatedUser()));
builder.Services.AddCors(o=>o.AddDefaultPolicy(p=>p.WithOrigins(options.WebOrigin).WithMethods("GET","POST","PUT","DELETE","OPTIONS").WithHeaders("Content-Type","X-DatingHigh-Client","Authorization").WithExposedHeaders("X-DatingHigh-Session","Retry-After","Date").AllowCredentials()));
builder.Logging.AddFilter("Microsoft.AspNetCore.Hosting.Diagnostics",LogLevel.Warning); // 一般存取日誌不含 body 或 query。
builder.Logging.AddFilter("System.Net.Http.HttpClient",LogLevel.Warning);
var app=builder.Build();
app.UseCors();
app.Use(async(context,next)=>
{
    context.Response.Headers.CacheControl="no-store";
    try
    {
        if(context.Request.Path!="/health/live" && context.Request.Headers["X-DatingHigh-Internal-Environment"]!=options.Environment)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var requestId=context.Request.Headers["X-DatingHigh-Internal-Request-Id"].ToString();if(Guid.TryParseExact(requestId,"D",out _))context.TraceIdentifier=requestId;
        if(context.Request.Path.StartsWithSegments("/api"))
        {
            if(!Configured()) throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
            var payload=await RequestPayload.Read(context.Request,context.RequestAborted);context.Items["payload"]=payload;
            var requested=payload.Optional("clientPlatform")??context.Request.Headers["X-DatingHigh-Client"].FirstOrDefault()??(context.Request.Headers.ContainsKey("Origin")?"web":context.Request.Headers.Authorization.Count>0?"ios":"web");
            if(requested is not("web" or "ios" or "android")) throw new DomainException("INVALID_PLATFORM");
            if(context.Request.Headers.ContainsKey("Origin") && requested!="web") throw new DomainException("INVALID_PLATFORM");
            context.Items["platform"]=requested;
            if(requested=="web" && context.Request.Method is not("GET" or "HEAD" or "OPTIONS"))
            {
                if(context.Request.Headers.Origin.ToString()!=options.WebOrigin || context.Request.Headers["X-DatingHigh-Client"]!="web" || !context.Request.HasJsonContentType()) throw new DomainException("ORIGIN_FORBIDDEN",403);
            }
            if(context.Request.QueryString.HasValue) throw new DomainException("INVALID_REQUEST");
        }
        await next(context);
    }
    catch(DomainException e){await HttpContract.Problem(context,e);}
    catch(OperationCanceledException) when(context.RequestAborted.IsCancellationRequested){}
    catch(Exception e)
    {
        context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("ApiFailure").LogError("Request failed Type={Type} Trace={Trace}",e.GetType().Name,context.TraceIdentifier);
        await HttpContract.Problem(context,new DomainException("INTERNAL_ERROR",500));
    }
});
app.UseAuthentication();app.UseAuthorization();
var api=app.MapGroup("/api/v1");
api.MapPost("/email-registrations",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("email","clientPlatform");return Results.Json(await a.RequestCode(p.Required("email"),p.Required("clientPlatform"),"register_email",c.Ip(),ct),statusCode:202);}).AllowAnonymous();
api.MapPost("/password-reset-requests",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("email","clientPlatform");return Results.Json(await a.RequestCode(p.Required("email"),p.Required("clientPlatform"),"reset_password",c.Ip(),ct),statusCode:202);}).AllowAnonymous();
api.MapPost("/accounts",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("challengeId","flowToken","code","password","clientPlatform");return c.Login(options,await a.Register(p.Required("challengeId"),p.Required("flowToken"),p.Required("code"),p.Required("password"),p.Required("clientPlatform"),ct));}).AllowAnonymous();
api.MapPost("/email-challenges/{id}/resend",async(string id,HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("flowToken");return Results.Json(await a.Resend(id,p.Required("flowToken"),c.Ip(),ct),statusCode:202);}).AllowAnonymous();
api.MapPost("/sessions",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("email","password","clientPlatform");return c.Login(options,await a.Login(p.Required("email"),p.Required("password"),p.Required("clientPlatform"),c.Ip(),ct));}).AllowAnonymous();
api.MapPost("/sessions/external/{provider}",async(string provider,HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("credential","clientPlatform");return c.Login(options,await a.ExternalLogin(provider,p.Required("credential"),p.Required("clientPlatform"),c.Ip(),ct));}).AllowAnonymous();
api.MapPost("/session/refresh",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("clientPlatform","refreshToken");p.Required("clientPlatform");return c.Login(options,await a.Refresh(c.RefreshCredential(options)??"",c.ClientPlatform(),c.Ip(),ct));}).AllowAnonymous();
api.MapDelete("/session",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("refreshToken","sessionId");await a.Logout(c.AccessCredential(options),c.RefreshCredential(options),ct,p.Optional("sessionId"));c.ClearCookies(options);return Results.NoContent();}).AllowAnonymous();
api.MapPost("/password-resets",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("challengeId","flowToken","code","newPassword");await a.Reset(p.Required("challengeId"),p.Required("flowToken"),p.Required("code"),p.Required("newPassword"),ct);return Results.NoContent();}).AllowAnonymous();
api.MapGet("/session",async(HttpContext c,AuthApplication a,CancellationToken ct)=>
{
    c.Payload().Only();var r=(JsonNode)c.Items["currentRow"]!;
    return Results.Ok(new{account=await a.AccountDto(r,a.Auth(c.User),ct),session=new{sessionId=r.Text("session_id"),absoluteExpiresAt=DateTimeOffset.FromUnixTimeMilliseconds(r.Number("absolute_expires_at")),idleExpiresAt=DateTimeOffset.FromUnixTimeMilliseconds(r.Number("idle_expires_at"))},tokenMetadata=new{accessExpiresAt=DateTimeOffset.FromUnixTimeSeconds(long.Parse(c.User.FindFirst("exp")!.Value,System.Globalization.CultureInfo.InvariantCulture)),refreshExpiresAt=DateTimeOffset.FromUnixTimeMilliseconds(r.Number("idle_expires_at"))}});
}).RequireAuthorization("PlatformAccess");
api.MapGet("/me",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{c.Payload().Only();return Results.Ok(await a.AccountDto((JsonNode)c.Items["currentRow"]!,a.Auth(c.User),ct));}).RequireAuthorization("PlatformAccess");
api.MapPut("/me/password",async(HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("currentPassword","newPassword");await a.ChangePassword(c.User,p.Required("currentPassword"),p.Required("newPassword"),ct);c.ClearCookies(options);return Results.NoContent();}).RequireAuthorization("PlatformAccess");
api.MapPost("/me/identities/{provider}",async(string provider,HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("credential","clientPlatform");await a.Link(c.User,provider,p.Required("credential"),p.Required("clientPlatform"),c.Ip(),ct);return Results.Ok(new{provider,linked=true});}).RequireAuthorization("PlatformAccess");
api.MapGet("/me/identities",async(HttpContext c,AuthApplication a,IPlatformClient platform,CancellationToken ct)=>{c.Payload().Only();var r=(JsonNode)c.Items["currentRow"]!;var identities=await platform.ExecuteAsync("identity.list",a.Auth(c.User),ct);return Results.Ok(new{hasLocalPassword=r["password_hash"] is not null,identities=identities["rows"]!.AsArray().Select(i=>new{provider=i!.Text("provider"),linkedAt=DateTimeOffset.FromUnixTimeMilliseconds(i!.Number("created_at"))})});}).RequireAuthorization("PlatformAccess");
api.MapDelete("/me/identities/{provider}",async(string provider,HttpContext c,AuthApplication a,CancellationToken ct)=>{var p=c.Payload();p.Only("currentPassword");await a.Unlink(c.User,provider,p.Required("currentPassword"),ct);c.ClearCookies(options);return Results.NoContent();}).RequireAuthorization("PlatformAccess");
app.MapGet("/health/live",()=>Results.Ok(new{status="alive"})).AllowAnonymous();
app.MapGet("/health/ready",async(Readiness readiness,CancellationToken ct)=>
{
    if(!Configured()) throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    await readiness.CheckAsync(ct);return Results.Ok(new{status="ready"});
}).AllowAnonymous();
app.MapFallback(async c=>await HttpContract.Problem(c,new DomainException("NOT_FOUND",404))).AllowAnonymous();
app.Run();
public partial class Program;

