# Test Webhook Script
# This will help you verify everything is working

Write-Host "🚀 Testing Webhook System" -ForegroundColor Cyan
Write-Host "Draco is watching for success! 🐕" -ForegroundColor Yellow

# Test 1: Direct Supabase Function Test
Write-Host "`n📡 Test 1: Direct Supabase Function..." -ForegroundColor Green

$testPayload = @{
    event_type = "test_from_cleanup"
    email = "cleanup-test@example.com"
    message = "Testing after cleanup!"
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/pabbly-webhook" `
        -Method POST `
        -Body $testPayload `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Direct test successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Direct test failed: $_" -ForegroundColor Red
}

# Test 2: Pabbly Hook Test
Write-Host "`n📡 Test 2: Pabbly Hook URL..." -ForegroundColor Green

$pabblyPayload = @{
    event_type = "test_via_pabbly"
    email = "pabbly-test@example.com"
    stripe_data = @{
        customer_id = "cus_test123"
        status = "active"
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://hook.pabbly.com/api/webhook/68d91ea6482060cfab19a50c/68daeea45e434afb5dd8271d" `
        -Method POST `
        -Body $pabblyPayload `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Pabbly hook test successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Pabbly test failed: $_" -ForegroundColor Red
}

Write-Host "`n📊 Now check your database!" -ForegroundColor Yellow
Write-Host "Run this SQL in Supabase:" -ForegroundColor Cyan
Write-Host @"

SELECT 
  id,
  workflow_name,
  processing_status,
  created_at,
  webhook_payload->>'event_type' as event_type,
  webhook_payload->>'email' as email
FROM pabbly_webhook_logs 
WHERE webhook_payload->>'email' LIKE '%test%'
ORDER BY created_at DESC 
LIMIT 5;

"@ -ForegroundColor White

Write-Host "`n🐕 Woof! Tests complete!" -ForegroundColor Magenta
