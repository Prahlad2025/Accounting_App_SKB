
# Accounting App Deployment

This application uses:

- Vercel for the React + Vite frontend.
- Render for the ASP.NET Core API, deployed using Docker.
- Supabase PostgreSQL for the database.

The free tiers may sleep, pause, or have usage limits. They do not provide
an always-on or availability guarantee. Export important accounting data
regularly and review provider limits before relying on the app for important
records.

## 1. Prepare Supabase

1. Open the Supabase dashboard and select the existing project.
2. Open Connect and select Session Pooler.
3. Use the session-pooler connection details for the API.

The connection string format is:

```text
Host=<pooler-host>;Port=5432;Database=postgres;Username=<pooler-user>;Password=<database-password>;SSL Mode=Require
```

Use the actual host, username, and password supplied by Supabase.

Keep the database password private. If it contains special characters,
quote or escape it as required by Npgsql connection-string syntax.

If a database password was previously committed to source control, rotate
it in Supabase before deployment.

## 2. Configure local development secrets

The API uses .NET User Secrets for local development.

From the repository root, run:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<local-connection-string>" --project .\Accounting_App.Api\Accounting_App.Api.csproj

dotnet user-secrets set "Jwt:Key" "<random-key-at-least-32-bytes>" --project .\Accounting_App.Api\Accounting_App.Api.csproj
```

User Secrets are for local development only. Production credentials must
be configured in Render.

Do not commit database passwords or JWT signing keys to GitHub.

## 3. Apply EF Core migrations to Supabase

Apply the checked-in Entity Framework migrations to the Supabase database
before using the deployed API.

Open PowerShell in the repository root.

Set the database connection string for the current PowerShell session:

```powershell
$env:ConnectionStrings__DefaultConnection = "Host=<pooler-host>;Port=5432;Database=postgres;Username=<pooler-user>;Password=<database-password>;SSL Mode=Require"

$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:Jwt__Key = "<random-key-at-least-32-bytes>"
$env:Jwt__Issuer = "Accounting_App.Api"
$env:Jwt__Audience = "Accounting_App"
```

Install the matching EF Core CLI tool if it is not already installed:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.12
```

Apply the migrations:

```powershell
dotnet ef database update --project .\Accounting_App.Api\Accounting_App.Api.csproj --startup-project .\Accounting_App.Api\Accounting_App.Api.csproj
```

After a successful migration, clear the temporary variables:

```powershell
Remove-Item Env:ConnectionStrings__DefaultConnection
Remove-Item Env:ASPNETCORE_ENVIRONMENT
Remove-Item Env:Jwt__Key
Remove-Item Env:Jwt__Issuer
Remove-Item Env:Jwt__Audience
```

If the EF Core tool is already installed, skip its installation command.

Do not reset or recreate an existing database that contains data.

## 4. Deploy the API to Render

The repository contains a root `render.yaml` Blueprint and a Dockerfile
at `Accounting_App.Api/Dockerfile`.

1. Push the latest project changes to GitHub.
2. Sign in to Render using GitHub.
3. Select New + and then Blueprint.
4. Connect the repository `Prahlad2025/Accounting_App_SKB`.
5. Select the branch containing the deployment files.
6. Allow Render to detect the root `render.yaml`.

The Blueprint configures:

- Service: accounting-app-api
- Runtime: Docker
- Region: Singapore
- Plan: Free
- Docker context: repository root
- Dockerfile: Accounting_App.Api/Dockerfile
- Health check: /health

Provide these environment variables when prompted:

### ConnectionStrings__DefaultConnection

The complete Supabase Session Pooler connection string.

### Jwt__Key

Generate a new random key locally using PowerShell:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Use the generated value as the production JWT signing key.

Do not use a key that was previously exposed in source code.

### Cors__AllowedOrigins__0

Use your exact Vercel frontend origin, without a path or trailing slash.

For example:

```text
https://accounting-app-skb.vercel.app
```

Replace this with the actual Vercel domain assigned to your project.

The JWT issuer and audience are configured by the Blueprint:

```text
Jwt__Issuer=Accounting_App.Api
Jwt__Audience=Accounting_App
```

Deploy the service and wait for the build to finish.

Verify the health endpoint:

```text
https://<render-service>.onrender.com/health
```

Expected response:

```json
{"status":"healthy"}
```

The free Render service may sleep after inactivity. The first request after
sleeping may take time to respond.

## 5. Deploy the frontend to Vercel

The React frontend is located in `Accounting-app-web`.

1. Open Vercel and sign in using GitHub.
2. Select Add New Project.
3. Import `Prahlad2025/Accounting_App_SKB`.
4. Configure the project as follows:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | Accounting-app-web |
| Build Command | npm run build |
| Output Directory | dist |
| Install Command | npm install |

The frontend uses `package-lock.json`, so `npm ci` can also be used as
the build command followed by `npm run build`, if needed.

### Configure the frontend environment variable

In Vercel, open Project Settings, then Environment Variables.

Add:

```text
VITE_API_BASE_URL=https://<render-service>.onrender.com/api
```

Replace the placeholder with your actual Render service URL.

Enable this variable for the Production environment.

The VITE_API_BASE_URL value is embedded in the public frontend bundle.
It must contain only the public API URL and must never contain database
credentials, JWT signing keys, or other secrets.

Trigger a new deployment after changing the environment variable.

The repository already contains `Accounting-app-web/vercel.json` for
React Router SPA routing. Keep that file so direct navigation to frontend
routes returns the application.

## 6. Configure CORS

After Vercel assigns your production domain, open the Render service.

Go to Environment and update:

```text
Cors__AllowedOrigins__0=https://<your-vercel-domain>
```

Use the exact origin, including HTTPS, with no trailing slash or path.

Save the environment variable and redeploy or restart the Render service
so the updated configuration is applied.

If you later add a custom domain, add its origin to the API's allowed
origins configuration as well.

## 7. Verify the deployment

Test the following from the deployed Vercel website:

1. Open the application and register a test account.
2. Log in and confirm authentication works.
3. Add a new expense.
4. Edit and delete an expense.
5. Clear an expense and verify the cleared-expense view.
6. Verify extras and dashboard totals.
7. Refresh nested frontend routes directly.

If a request fails, check:

- Browser developer tools for CORS and network errors.
- Render logs for database connection or startup errors.
- Supabase to confirm the expected tables and migrations exist.

Do not put database passwords or JWT signing keys in the frontend bundle,
GitHub, or deployment logs.

Export important database records regularly and rotate any credentials
that were ever committed or exposed.