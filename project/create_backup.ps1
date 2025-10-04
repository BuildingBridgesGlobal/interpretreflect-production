# Supabase Database Backup Script
# Run this in PowerShell from the project root directory

Write-Host "Starting Supabase database backup..." -ForegroundColor Cyan

# Create backups folder if it doesn't exist
Write-Host "Creating backups folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".\backups" | Out-Null

# Generate timestamp for backup files
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "Timestamp: $timestamp" -ForegroundColor Gray

# Define backup file paths
$fullBackupFile = ".\backups\pre_migration_$timestamp.sql"
$schemaBackupFile = ".\backups\schema_$timestamp.sql"
$dataBackupFile = ".\backups\data_$timestamp.sql"

Write-Host "`nCreating backups..." -ForegroundColor Yellow

# Create full backup (schema + data)
Write-Host "1. Creating full backup (schema + data)..." -ForegroundColor Green
Write-Host "   File: $fullBackupFile" -ForegroundColor Gray
supabase db dump -f $fullBackupFile --db-url "$env:SUPABASE_DB_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Full backup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Full backup failed!" -ForegroundColor Red
    exit 1
}

# Create schema-only backup
Write-Host "`n2. Creating schema-only backup..." -ForegroundColor Green
Write-Host "   File: $schemaBackupFile" -ForegroundColor Gray
supabase db dump -f $schemaBackupFile --db-url "$env:SUPABASE_DB_URL" --schema-only

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Schema backup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Schema backup failed!" -ForegroundColor Red
}

# Create data-only backup
Write-Host "`n3. Creating data-only backup..." -ForegroundColor Green
Write-Host "   File: $dataBackupFile" -ForegroundColor Gray
supabase db dump -f $dataBackupFile --db-url "$env:SUPABASE_DB_URL" --data-only --schema public

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Data backup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Data backup failed!" -ForegroundColor Red
}

# Display summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nBackup files created:" -ForegroundColor Yellow
Write-Host "  • Full backup:   $fullBackupFile" -ForegroundColor White
Write-Host "  • Schema only:   $schemaBackupFile" -ForegroundColor White
Write-Host "  • Data only:     $dataBackupFile" -ForegroundColor White

Write-Host "`nTo restore from backup later, use:" -ForegroundColor Yellow
Write-Host "  psql -d `"`$env:SUPABASE_DB_URL`" -f `"$fullBackupFile`"" -ForegroundColor Cyan

Write-Host "`nYou can now safely proceed with the migration:" -ForegroundColor Green
Write-Host "  supabase db push" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan