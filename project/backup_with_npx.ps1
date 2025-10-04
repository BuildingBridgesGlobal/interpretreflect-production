# Supabase Backup using npx (no installation required)
# This runs Supabase CLI directly without installing it

Write-Host "Creating database backup using npx..." -ForegroundColor Cyan
Write-Host "This may take a moment on first run..." -ForegroundColor Yellow

# Ensure backups folder exists
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = ".\backups\pre_migration_$timestamp.sql"

Write-Host "`nCreating backup file: $backupFile" -ForegroundColor Green

# Use npx to run supabase without installing
Write-Host "Running backup command..." -ForegroundColor Yellow
npx supabase db dump -f $backupFile --db-url "$env:SUPABASE_DB_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Backup completed successfully!" -ForegroundColor Green
    Write-Host "Backup saved to: $backupFile" -ForegroundColor Cyan

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Your backup is ready at: $backupFile" -ForegroundColor White
    Write-Host "2. You can now apply migrations using npx:" -ForegroundColor White
    Write-Host "   npx supabase db push" -ForegroundColor Cyan
    Write-Host "`nTo restore if needed:" -ForegroundColor Yellow
    Write-Host "   psql -d `"`$env:SUPABASE_DB_URL`" -f `"$backupFile`"" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Backup failed!" -ForegroundColor Red
    Write-Host "Please check your SUPABASE_DB_URL environment variable" -ForegroundColor Yellow
}