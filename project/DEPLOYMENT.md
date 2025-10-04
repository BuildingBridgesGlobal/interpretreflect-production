# Deployment Guide

## Environment Variables Setup

### Required Variables

Copy `.env.example` to `.env.local` (for local development) or set these in your deployment platform:

```bash
# Supabase (Required for authentication)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# OpenAI (Optional - app works with simulated AI if not set)
VITE_AI_PROVIDER=simulated  # or 'openai' if using real API
VITE_OPENAI_API_KEY=sk-...  # Only needed if provider is 'openai'
VITE_AI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
```

### Getting Your Keys

1. **Supabase**:
   - Go to https://supabase.com/dashboard
   - Select your project → Settings → API
   - Copy the Project URL and anon/public key

2. **OpenAI** (optional):
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Set `VITE_AI_PROVIDER=openai` to enable

## Deployment Platforms

### Vercel

1. Connect your GitHub repository
2. Set environment variables in Project Settings → Environment Variables
3. Deploy from `feat/first-deploy` branch

### Netlify

1. Import your GitHub repository
2. Set environment variables in Site Settings → Environment Variables
3. Deploy from `feat/first-deploy` branch

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Directory Structure

- **Build output**: `dist/`
- **Public assets**: `public/` (if exists) or root level
- **Source code**: `src/`

## Deployment Checklist

- [ ] Environment variables set in deployment platform
- [ ] Supabase project created and configured
- [ ] Build succeeds locally with `npm run build`
- [ ] No sensitive data in repository
- [ ] `.env` files are gitignored

## Troubleshooting

### Build Errors

- Ensure all dependencies are in `package.json` (not devDependencies if needed for build)
- Check for TypeScript errors: `npm run type-check` (if available)
- Verify environment variables are accessible during build

### Runtime Errors

- Check browser console for errors
- Verify environment variables are prefixed with `VITE_`
- Ensure Supabase credentials are correct
- Check network tab for failed API requests

### Common Issues

1. **Blank page**: Check console for errors, verify routes
2. **Auth not working**: Verify Supabase credentials
3. **AI chat not responding**: Check OpenAI key or use simulated mode
4. **Styles missing**: Ensure Tailwind CSS is building properly
