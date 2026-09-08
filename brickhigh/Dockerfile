# ============================
# 階段 1: 前端建構
# ============================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# 複製 package 檔案以利用 Docker 快取
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --production=false

# 複製前端原始碼並建構
COPY frontend/ ./

# VITE_API_URL 留空（同源）
# LIFF ID 透過 build arg 注入
ARG VITE_LIFF_ID
ENV VITE_LIFF_ID=${VITE_LIFF_ID}
ENV VITE_API_URL=""

# 刪除測試文件以避免 vue-tsc 檢查錯誤
RUN rm -rf src/services/__tests__

RUN npm run build

# ============================
# 階段 2: 後端建構
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /src

# 複製 sln 和 csproj 以利用 NuGet 還原快取
COPY backend/OrickLineBot.sln ./
COPY backend/OrickLineBot.API/OrickLineBot.API.csproj OrickLineBot.API/
COPY backend/OrickLineBot.Application/OrickLineBot.Application.csproj OrickLineBot.Application/
COPY backend/OrickLineBot.Domain/OrickLineBot.Domain.csproj OrickLineBot.Domain/
COPY backend/OrickLineBot.Infrastructure/OrickLineBot.Infrastructure.csproj OrickLineBot.Infrastructure/
# sln 引用了測試專案，必須一併複製 csproj 才能 restore
COPY backend/tests/OrickLineBot.Unit.Tests/OrickLineBot.Unit.Tests.csproj tests/OrickLineBot.Unit.Tests/
COPY backend/tests/OrickLineBot.Integration.Tests/OrickLineBot.Integration.Tests.csproj tests/OrickLineBot.Integration.Tests/

RUN dotnet restore

# 複製所有後端原始碼
COPY backend/ ./

# 發布
RUN dotnet publish OrickLineBot.API/OrickLineBot.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ============================
# 階段 3: 最終執行映像
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# 複製後端發布成果
COPY --from=backend-build /app/publish .

# 複製前端 build 產物到 wwwroot
COPY --from=frontend-build /frontend/dist ./wwwroot

# 建立資料目錄
RUN mkdir -p /app/App_Data/images

# Cloud Run 在執行時注入 PORT 環境變數
ARG PORT=8080
ENV ASPNETCORE_ENVIRONMENT=Staging
ENV ASPNETCORE_URLS=http://+:${PORT}

EXPOSE 8080

ENTRYPOINT ["dotnet", "OrickLineBot.API.dll"]
