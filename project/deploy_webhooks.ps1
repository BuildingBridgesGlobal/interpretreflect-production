# Deploy Webhooks Script
# Run this from your project root: C:\Users\maddo\Desktop\boltV1IR\project\

Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Cyan

# First, make sure you're logged in to Supabase
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
supabase login

# Link to your project if not already linked
Write-Host "Linking to your Supabase project..." -ForegroundColor Yellow
supabase link --project-ref kvguxuxanpynwdffpssm

# Deploy the Stripe webhook handler
Write-Host "Deploying Stripe webhook handler..." -ForegroundColor Green
supabase functions deploy handle-webhook

# Deploy the Encharge webhook handler
Write-Host "Deploying Encharge webhook handler..." -ForegroundColor Green
supabase functions deploy encharge-webhook

# Deploy other functions
Write-Host "Deploying other functions..." -ForegroundColor Green
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy send-encharge-event

Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green

# Get the webhook URLs
Write-Host "`n📌 Your Webhook URLs:" -ForegroundColor Cyan
Write-Host "Stripe Webhook: https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/handle-webhook" -ForegroundColor White
Write-Host "Encharge Webhook: https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/encharge-webhook" -ForegroundColor White
