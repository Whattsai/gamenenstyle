FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:9c7b6b263d9d4c2e4718e16dae6d75cd8f4b5ccf206f1e7d48a98eb429981b03 AS build
WORKDIR /src
COPY . .
RUN dotnet publish src/DatingHigh.Api/DatingHigh.Api.csproj -c Release -o /app --no-self-contained
RUN dotnet publish tools/DatingHigh.PlatformProbe/DatingHigh.PlatformProbe.csproj -c Release -o /tools --no-self-contained
FROM mcr.microsoft.com/dotnet/aspnet:10.0.6@sha256:902cb7375e347f20c93d959bf1feba884e0a9232e0087991ace8eb4f82d2986d
WORKDIR /app
COPY --from=build /app .
COPY --from=build /tools ./tools
ENV ASPNETCORE_URLS=http://+:8080
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet","DatingHigh.Api.dll"]
