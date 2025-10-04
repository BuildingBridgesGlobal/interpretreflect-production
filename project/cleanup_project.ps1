# Project Cleanup Script
# Run from: C:\Users\maddo\Desktop\boltV1IR\project\

Write-Host "🧹 Starting Project Cleanup..." -ForegroundColor Cyan
Write-Host "Give Draco a treat while we clean! 🐕" -ForegroundColor Yellow

# Create archive structure
Write-Host "`n📁 Creating archive folders..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "_archive" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/sql_scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/old_docs" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/test_files" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/backup_files" | Out-Null
New-Item -ItemType Directory -Force -Path "docs" | Out-Null

# Count files before moving
$sqlCount = (Get-ChildItem -Path "*.sql" -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch "PABBLY_SUPABASE_SETUP|WEBHOOK_MONITORING_QUERIES" }).Count
$fixCount = (Get-ChildItem -Path "FIX_*.md" -File -ErrorAction SilentlyContinue).Count
$testCount = (Get-ChildItem -Path "TEST_*.*" -File -ErrorAction SilentlyContinue).Count
$backupCount = (Get-ChildItem -Path "BACKUP_*.txt" -File -ErrorAction SilentlyContinue).Count

Write-Host "`n📊 Files to organize:" -ForegroundColor White
Write-Host "  - SQL files: $sqlCount" -ForegroundColor Gray
Write-Host "  - Fix docs: $fixCount" -ForegroundColor Gray
Write-Host "  - Test files: $testCount" -ForegroundColor Gray
Write-Host "  - Backup docs: $backupCount" -ForegroundColor Gray

# Move SQL files (keeping important ones)
Write-Host "`n🗃️ Moving SQL files to archive..." -ForegroundColor Yellow
Get-ChildItem -Path "*.sql" -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -notmatch "PABBLY_SUPABASE_SETUP|WEBHOOK_MONITORING_QUERIES" } |
    ForEach-Object { 
        Move-Item -Path $_.FullName -Destination "_archive/sql_scripts/" -Force
        Write-Host "  ✓ Moved: $($_.Name)" -ForegroundColor DarkGray
    }

# Keep important SQL files in docs
if (Test-Path "PABBLY_SUPABASE_SETUP.sql") {
    Copy-Item -Path "PABBLY_SUPABASE_SETUP.sql" -Destination "docs/" -Force
    Write-Host "  ✓ Kept: PABBLY_SUPABASE_SETUP.sql in docs/" -ForegroundColor Green
}
if (Test-Path "WEBHOOK_MONITORING_QUERIES.sql") {
    Copy-Item -Path "WEBHOOK_MONITORING_QUERIES.sql" -Destination "docs/" -Force
    Write-Host "  ✓ Kept: WEBHOOK_MONITORING_QUERIES.sql in docs/" -ForegroundColor Green
}

# Move old documentation
Write-Host "`n📚 Moving old documentation..." -ForegroundColor Yellow
@("FIX_*.md", "DEBUG_*.md", "CHECK_*.md", "CREATE_*.md", "COMPLETE_*.md", "REFACTOR_*.md") | ForEach-Object {
    Get-ChildItem -Path $_ -File -ErrorAction SilentlyContinue |
        ForEach-Object { 
            Move-Item -Path $_.FullName -Destination "_archive/old_docs/" -Force
            Write-Host "  ✓ Moved: $($_.Name)" -ForegroundColor DarkGray
        }
}

# Move test files
Write-Host "`n🧪 Moving test files..." -ForegroundColor Yellow
@("TEST_*.*", "test-*.html", "test_*.sql") | ForEach-Object {
    Get-ChildItem -Path $_ -File -ErrorAction SilentlyContinue |
        ForEach-Object { 
            Move-Item -Path $_.FullName -Destination "_archive/test_files/" -Force
            Write-Host "  ✓ Moved: $($_.Name)" -ForegroundColor DarkGray
        }
}

# Move backup instructions
Write-Host "`n💾 Moving backup files..." -ForegroundColor Yellow
@("BACKUP_*.txt", "backup_*.ps1", "*_INSTRUCTIONS.txt", "GET_*.txt", "CORRECT_*.txt", "INSTALL_*.txt", "RUN_*.txt") | ForEach-Object {
    Get-ChildItem -Path $_ -File -ErrorAction SilentlyContinue |
        ForEach-Object { 
            Move-Item -Path $_.FullName -Destination "_archive/backup_files/" -Force
            Write-Host "  ✓ Moved: $($_.Name)" -ForegroundColor DarkGray
        }
}

# Move important docs to docs folder
Write-Host "`n📄 Organizing active documentation..." -ForegroundColor Yellow
@("WEBHOOK_DEPLOYMENT_GUIDE.md", "CLEANUP_GUIDE.md", "STRIPE_SETUP.md", "ENCHARGE_SETUP_GUIDE.md") | ForEach-Object {
    if (Test-Path $_) {
        Move-Item -Path $_ -Destination "docs/" -Force
        Write-Host "  ✓ Moved to docs: $_" -ForegroundColor Green
    }
}

# Clean up unused HTML files
Write-Host "`n🗑️ Removing unused files..." -ForegroundColor Yellow
@("clear_post_assignment_draft.html", "unregister-sw.html") | ForEach-Object {
    if (Test-Path $_) {
        Move-Item -Path $_ -Destination "_archive/test_files/" -Force
        Write-Host "  ✓ Archived: $_" -ForegroundColor DarkGray
    }
}

# Clean node_modules (optional - uncomment if you want to reinstall)
# Write-Host "`n🔄 Cleaning node_modules..." -ForegroundColor Yellow
# Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
# Write-Host "  ✓ Removed node_modules - run 'npm install' to reinstall" -ForegroundColor Yellow

# Summary
Write-Host "`n✨ Cleanup Complete!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Cyan

$remainingFiles = Get-ChildItem -Path "*.sql", "*.md", "*.txt" -File -ErrorAction SilentlyContinue
Write-Host "  📁 Files in root: $($remainingFiles.Count)" -ForegroundColor White
Write-Host "  📁 Files archived: $($sqlCount + $fixCount + $testCount + $backupCount)" -ForegroundColor White

Write-Host "`n📂 New Structure:" -ForegroundColor Cyan
Write-Host "  /src          - Your application code" -ForegroundColor Gray
Write-Host "  /supabase     - Edge functions" -ForegroundColor Gray
Write-Host "  /docs         - Active documentation" -ForegroundColor Gray
Write-Host "  /_archive     - Old files (safe to delete later)" -ForegroundColor Gray

Write-Host "`n🐕 Draco says: Woof! All clean!" -ForegroundColor Magenta

# Create a cleanup report
$report = @"
# Cleanup Report - $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Files Archived:
- SQL Scripts: $sqlCount files
- Fix Documentation: $fixCount files
- Test Files: $testCount files
- Backup Instructions: $backupCount files

## Active Files Kept:
- PABBLY_SUPABASE_SETUP.sql
- WEBHOOK_MONITORING_QUERIES.sql
- WEBHOOK_DEPLOYMENT_GUIDE.md
- Core configuration files

## Next Steps:
1. Run 'npm install' if you cleaned node_modules
2. Test your webhooks
3. Deploy to Vercel
4. Delete _archive folder once confirmed everything works
"@

$report | Out-File -FilePath "CLEANUP_REPORT_$(Get-Date -Format 'yyyy-MM-dd').md"
Write-Host "`n📝 Cleanup report saved!" -ForegroundColor Green
