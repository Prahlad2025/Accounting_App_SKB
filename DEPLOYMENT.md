# Deployment

This app uses Cloudflare Pages for the React/Vite frontend, Render's free
Docker web service for the ASP.NET Core API, and Supabase PostgreSQL. The free
tiers can sleep or pause when idle, and do not provide an always-on or
availability guarantee. Review provider limits before relying on this app for
important records.

## 1. Prepare Supabase

1. Create a Supabase project and open **Connect**.
2. Use the **Session pooler** connection details (IPv4-compatible) for the API.
   The API expects a standard Npgsql connection string:

   ```text
   Host=<pooler-host>;Port=5432;Database=postgres;Username=<pooler-user>;Password=<database-password>;SSL Mode=Require
   ```

3. Keep the password private. If it contains semicolons, quote/escape it as
   required by Npgsql connection-string syntax.
4. The free Supabase plan may pause inactive projects and does not include
   automatic database backups. Export important data regularly.
5. The old local configuration stored the database password in source. Rotate
   that password in Supabase before deployment, then update local User Secrets
   and the Render secret with the replacement.

## 2. Create the database schema

Apply the checked-in Entity Framework migrations to the Supabase database
before deploying the API. Run this from the project root in PowerShell, using
the same session-pooler connection string:

```powershell
$env:ConnectionStrings__DefaultConnection = "Host=<pooler-host>;Port=5432;Database=postgres;Username=<pooler-user>;Password=<database-password>;SSL Mode=Require"
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet tool install --global dotnet-ef --version 10.0.12
dotnet ef database update --project .\Accounting_App.Api\Accounting_App.Api.csproj --startup-project .\Accounting_App.Api\Accounting_App.Api.csproj
Remove-Item Env:ConnectionStrings__DefaultConnection
Remove-Item Env:ASPNETCORE_ENVIRONMENT
```

If `dotnet-ef` is already installed, skip its install command. Do not commit or
paste the connection string into source control.

For local development, secrets are loaded from .NET User Secrets:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<local-connection-string>" --project .\Accounting_App.Api\Accounting_App.Api.csproj
dotnet user-secrets set "Jwt:Key" "<random-key-at-least-32-bytes>" --project .\Accounting_App.Api\Accounting_App.Api.csproj
```

The API project already has a User Secrets ID. User Secrets are for local
development only; production values belong in the hosting provider's secret
environment variables.

## 3. Deploy the API to Render

1. Push the project to a Git provider and create a Render **Blueprint** using
   the root `render.yaml`.
2. Choose the Cloudflare Pages project name first. Use its expected
   `https://<project-name>.pages.dev` origin for the CORS value; if Cloudflare
   assigns a different URL, update the Render value after Pages is created.
3. Provide these Blueprint values when prompted:
   - `ConnectionStrings__DefaultConnection`: Supabase session-pooler connection
     string from step 1.
   - `Jwt__Key`: a randomly generated key with at least 32 bytes. For example,
     generate one locally with
     `[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))`.
   - `Cors__AllowedOrigins__0`: the exact HTTPS Cloudflare Pages site origin,
     without a path or trailing slash (for example,
     `https://accounting-app.pages.dev`).
4. Wait for the first deploy. Confirm the API health check succeeds at
   `https://<render-service>.onrender.com/health`.
5. Render's free service sleeps after inactivity; its first request after
   sleeping can take time to respond. It may restart and has no production
   availability guarantee.

Do not use a JWT key previously exposed in a source file. Replacing the signing
key invalidates existing login tokens; users will need to sign in again.

## 4. Deploy the frontend to Cloudflare Pages

Create a Pages project connected to the same Git repository:

- **Root directory:** `Accounting-app-web`
- **Build command:** `npm ci && npm run build`
- **Build output directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL=https://<render-service>.onrender.com/api`

Set `VITE_API_BASE_URL` for the production environment and trigger a fresh
build. The value is embedded in the public frontend bundle, so it must be the
public API URL and must never contain credentials.

## 5. Verify the deployment

1. Open the Pages site and verify `/health` on the API reports `healthy`.
2. Register a test account, log in, and verify adding, editing, and clearing an
   expense, the cleared-expense view, extras, and dashboard totals.
3. Check browser developer tools for CORS errors and the Render logs for
   connection or migration errors.
4. Confirm no database password or JWT signing key appears in the frontend
   build, Git history, or deployment logs. Rotate credentials if a secret was
   ever committed or shared.
