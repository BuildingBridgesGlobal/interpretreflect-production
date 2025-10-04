# 🧹 Project Cleanup Guide

## Files to Move to Archive Folder:

### SQL Files (Move to `_archive/sql_scripts/`)
- All the individual SQL files (burnout_test.sql, CHECK_*.sql, CREATE_*.sql, etc.)
- Keep only: PABBLY_SUPABASE_SETUP.sql and WEBHOOK_MONITORING_QUERIES.sql

### Old Documentation (Move to `_archive/old_docs/`)
- BACKUP_*.txt files
- FIX_*.md files
- DEBUG_*.sql files
- TEST_*.sql files
- All the individual setup guides that are completed

### Keep in Root (Active Files):
- .env files
- package.json
- vite.config.ts
- vercel.json
- WEBHOOK_DEPLOYMENT_GUIDE.md
- deploy_webhooks.ps1

## 🗂️ Suggested New Structure:
```
project/
├── src/                    # Your app code
├── supabase/              # Edge functions
├── public/                # Public assets
├── docs/                  # Active documentation
│   ├── WEBHOOK_DEPLOYMENT_GUIDE.md
│   └── WEBHOOK_MONITORING_QUERIES.sql
├── _archive/              # Old files for reference
│   ├── sql_scripts/
│   ├── old_docs/
│   └── test_files/
└── [config files in root]
```

## 🗄️ Database Cleanup Queries:

```sql
-- 1. Clean old webhook logs (keep last 30 days)
DELETE FROM pabbly_webhook_logs 
WHERE created_at < NOW() - INTERVAL '30 days'
AND processing_status = 'success';

-- 2. Clean resolved reconciliation issues
DELETE FROM subscription_reconciliation
WHERE resolution_status = 'resolved'
AND created_at < NOW() - INTERVAL '60 days';

-- 3. Clean recovered failed payments
DELETE FROM failed_payments
WHERE recovered = true
AND created_at < NOW() - INTERVAL '90 days';

-- 4. View what needs manual attention
SELECT 
  'Failed Webhooks' as issue_type,
  COUNT(*) as count
FROM pabbly_webhook_logs
WHERE processing_status = 'failed'
UNION ALL
SELECT 
  'Pending Reconciliation' as issue_type,
  COUNT(*) as count
FROM subscription_reconciliation
WHERE resolution_status = 'pending'
UNION ALL
SELECT 
  'Unrecovered Payments' as issue_type,
  COUNT(*) as count
FROM failed_payments
WHERE recovered = false;
```

## 📋 Cleanup Checklist:

### Phase 1: Organize Files
- [ ] Create `_archive` folder
- [ ] Move old SQL files
- [ ] Move old documentation
- [ ] Keep only active files in root

### Phase 2: Database Cleanup
- [ ] Run cleanup queries above
- [ ] Review pending issues
- [ ] Mark resolved items

### Phase 3: Code Cleanup
- [ ] Remove unused imports in src/
- [ ] Delete .backup files
- [ ] Clean node_modules and reinstall

### Phase 4: Final Organization
- [ ] Update .gitignore
- [ ] Commit cleaned structure
- [ ] Deploy to Vercel

## 🚀 Quick Cleanup Script:

Save as `cleanup_project.ps1`:

```powershell
# Create archive structure
New-Item -ItemType Directory -Force -Path "_archive"
New-Item -ItemType Directory -Force -Path "_archive/sql_scripts"
New-Item -ItemType Directory -Force -Path "_archive/old_docs"
New-Item -ItemType Directory -Force -Path "_archive/test_files"

# Move SQL files
Move-Item -Path "*.sql" -Destination "_archive/sql_scripts/" -Exclude "PABBLY_SUPABASE_SETUP.sql","WEBHOOK_MONITORING_QUERIES.sql"

# Move old documentation
Move-Item -Path "FIX_*.md" -Destination "_archive/old_docs/"
Move-Item -Path "TEST_*.md" -Destination "_archive/old_docs/"
Move-Item -Path "DEBUG_*.md" -Destination "_archive/old_docs/"
Move-Item -Path "BACKUP_*.txt" -Destination "_archive/old_docs/"

# Move test files
Move-Item -Path "test-*.html" -Destination "_archive/test_files/"

Write-Host "✅ Files organized!" -ForegroundColor Green
Write-Host "📁 Check _archive folder for moved files" -ForegroundColor Yellow
```
