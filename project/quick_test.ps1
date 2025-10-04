# Quick Webhook Test
Write-Host "🚀 Testing your newly created tables!" -ForegroundColor Cyan

# Simple test payload
$testData = @{
    event_type = "table_test"
    email = "draco-owner@example.com"
    message = "Tables are ready! Woof! 🐕"
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json

# Send to your Supabase function
Write-Host "Sending test webhook..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/pabbly-webhook" `
        -Method POST `
        -Body $testData `
        -ContentType "application/json"
    
    Write-Host "✅ Test sent successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n📊 Now check your database with this SQL:" -ForegroundColor Cyan
Write-Host @"
SELECT 
  COUNT(*) as total_webhooks,
  MAX(created_at) as last_webhook
FROM pabbly_webhook_logs;
"@ -ForegroundColor White
