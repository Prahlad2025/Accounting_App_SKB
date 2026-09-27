FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

COPY Accounting_App.Api/Accounting_App.Api.csproj Accounting_App.Api/
RUN dotnet restore Accounting_App.Api/Accounting_App.Api.csproj

COPY Accounting_App.Api/ Accounting_App.Api/
RUN dotnet publish Accounting_App.Api/Accounting_App.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "dotnet Accounting_App.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]
