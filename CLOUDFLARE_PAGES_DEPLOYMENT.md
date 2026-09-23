# Cloudflare Pages Deployment Guide

## Why Your Site Shows Raw HTML

The issue you're experiencing (raw HTML with no CSS/JS) is likely due to:

1. **Missing Content-Type headers** - Cloudflare Pages needs to know how to serve your files
2. **Incorrect deployment configuration** - The build settings or directory structure
3. **Missing wrangler.toml** - No proper Cloudflare Pages configuration
4. **Git deployment vs Direct upload** - Different deployment methods

## Quick Fix Steps

### Option 1: Git-based Deployment (Recommended)

1. **Push your changes to GitHub**
   ```bash
   cd /media/xplxt/ad8de25b-7c41-4644-93e1-699b5988e51b/xvmx/CITED/bumbled
   git add .
   git commit -m "Add Cloudflare Pages configuration"
   git push origin main
   ```

2. **Set up Cloudflare Pages via Dashboard**
   - Go to Cloudflare Dashboard → Pages → Create a project
   - Connect to GitHub
   - Select your repository
   - **Build settings** (important):
     - Build command: Leave empty
     - Build output directory: `/` (root directory)
   - Click "Save and Deploy"

### Option 2: Direct Upload via Wrangler CLI

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy directly**
   ```bash
   cd /media/xplxt/ad8de25b-7c41-4644-93e1-699b5988e51b/xvmx/CITED/bumbled
   wrangler pages deploy . --project-name=bumbleb
   ```

## Configuration Files Explained

### wrangler.toml
- Main configuration file for Cloudflare Pages
- Defines project name, compatibility date, and build settings
- Configures Pages Functions

### _headers
- Controls HTTP headers for security and caching
- We've made them more permissive to avoid blocking resources

### _redirects
- Controls URL redirects
- Handles routing rules

### package.json
- Defines scripts for local development and deployment
- Not strictly required for static sites but helpful

## Troubleshooting

### If you still see raw HTML:

1. **Check file permissions**
   ```bash
   chmod -R 755 /media/xplxt/ad8de25b-7c41-4644-93e1-699b5988e51b/xvmx/CITED/bumbled
   ```

2. **Verify HTML structure**
   - Your files should have proper HTML structure
   - CSS and JS are embedded inline (which is good for static sites)

3. **Check Cloudflare Pages logs**
   - Go to Cloudflare Dashboard → Pages → Your project → Logs
   - Look for errors during deployment

4. **Test locally first**
   ```bash
   cd /media/xplxt/ad8de25b-7c41-4644-93e1-699b5988e51b/xvmx/CITED/bumbled
   python3 -m http.server 8000
   ```
   Then visit http://localhost:8000 to see if it works locally

## What We've Added

1. **wrangler.toml** - Cloudflare Pages configuration
2. **package.json** - Deployment scripts
3. **Updated _headers** - More permissive security headers
4. **Updated _redirects** - Cleaned up redirects
5. **Functions** - Serverless functions for orders and products

## Next Steps

1. Choose a deployment method (Git or Wrangler CLI)
2. Deploy using the steps above
3. Test your site
4. If issues persist, check Cloudflare Pages logs

## Important Notes

- **No database needed** for basic functionality - the site works as a static site
- **Functions are optional** - the site will work without them
- **CSS/JS are inline** - which is actually good for Cloudflare Pages
- **Large files** - Your HTML files are large (15MB+) which is fine but may slow initial deployment

Would you like me to help you with the actual deployment process using either Git or Wrangler CLI?