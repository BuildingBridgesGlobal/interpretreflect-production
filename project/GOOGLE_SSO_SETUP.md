# Google SSO Setup Guide for InterpretReflect

## Overview
The Google SSO code is already implemented in the application. You just need to configure it in Google Cloud Console and Supabase.

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen first:
     - Choose "External" for public access
     - Fill in required fields:
       - App name: InterpretReflect
       - User support email: your email
       - Authorized domains: Add your production domain
       - Developer contact: your email

4. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "InterpretReflect Web Client"
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:5174
     http://localhost:5175
     http://localhost:5176
     https://YOUR-PRODUCTION-DOMAIN.com
     ```
   - Authorized redirect URIs:
     ```
     https://kvguxuxanpynwdffpssm.supabase.co/auth/v1/callback
     http://localhost:5173/dashboard
     https://YOUR-PRODUCTION-DOMAIN.com/dashboard
     ```

5. **Save Your Credentials**
   - Copy the "Client ID"
   - Copy the "Client Secret"

## Step 2: Supabase Configuration

1. **Log into Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Select your project: kvguxuxanpynwdffpssm

2. **Configure Google Provider**
   - Navigate to "Authentication" → "Providers"
   - Find "Google" in the list
   - Enable Google provider (toggle on)
   - Enter your credentials:
     - Client ID: [paste from Google Cloud Console]
     - Client Secret: [paste from Google Cloud Console]
   - Click "Save"

3. **Verify Redirect URL**
   - Copy the redirect URL shown in Supabase (should be: `https://kvguxuxanpynwdffpssm.supabase.co/auth/v1/callback`)
   - Make sure this EXACT URL is added to Google Cloud Console's "Authorized redirect URIs"

## Step 3: Update Application Settings (if needed)

The application already has the redirect URL configured in `AuthContext.tsx`:
```javascript
redirectTo: `${window.location.origin}/dashboard`
```

This is correct and will redirect users to the dashboard after successful login.

## Step 4: Test the Integration

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test login flow**
   - Click "Continue with Google" button
   - You should be redirected to Google's login page
   - After logging in, you should be redirected back to the dashboard

## Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**
   - Make sure the redirect URI in Google Cloud Console EXACTLY matches Supabase's callback URL
   - Check for trailing slashes, http vs https, etc.

2. **"Google provider is not enabled"**
   - Enable Google provider in Supabase Authentication settings

3. **User not redirected after login**
   - Check browser console for errors
   - Verify the redirectTo URL in the code

4. **"Invalid Client" error**
   - Double-check Client ID and Client Secret in Supabase
   - Make sure there are no extra spaces when copying credentials

## Production Deployment

Before deploying to production:

1. Add your production domain to Google OAuth authorized origins
2. Add production redirect URLs
3. Update Supabase redirect URLs if needed
4. Test thoroughly in staging environment

## Security Notes

- Never commit Google Client Secret to version control
- Use environment variables for sensitive credentials in production
- Keep OAuth consent screen information up to date
- Review and follow Google's OAuth 2.0 policies

## Current Status

✅ Code implementation complete
✅ Supabase project configured
⏳ Awaiting Google OAuth credentials setup
⏳ Awaiting provider activation in Supabase

Once you complete the Google Cloud Console setup and add the credentials to Supabase, the Google SSO will be fully functional!