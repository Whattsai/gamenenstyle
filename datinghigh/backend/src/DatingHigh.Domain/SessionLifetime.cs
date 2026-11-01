namespace DatingHigh.Domain;
/// <summary>所有期限均以可信伺服器時鐘計算。</summary>
public static class SessionLifetime
{
    public static (DateTimeOffset Absolute,DateTimeOffset Idle) Create(DateTimeOffset now)=>(now.AddDays(30),now.AddDays(7));
    public static DateTimeOffset Refresh(DateTimeOffset now,DateTimeOffset absolute)=>Min(now.AddDays(7),absolute);
    public static DateTimeOffset Access(DateTimeOffset now,DateTimeOffset idle,DateTimeOffset absolute)=>Min(now.AddMinutes(10),Min(idle,absolute));
    private static DateTimeOffset Min(DateTimeOffset a,DateTimeOffset b)=>a<b?a:b;
}
