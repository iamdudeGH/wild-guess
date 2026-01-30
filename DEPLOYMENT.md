# 🚀 Deployment Guide for Wild Guess

This guide will help you deploy your Wild Guess game to Vercel or any other hosting platform.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Updated contract address in `lib/genlayer/client.js`
- ✅ Tested the app locally (`npm run dev`)
- ✅ Built the project successfully (`npm run build`)
- ✅ Committed all changes to Git
- ✅ (Optional) Updated ImgBB API key in `app.js`

## 🌐 Deploy to Vercel (Recommended)

### Option 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite

3. **Configure Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~1-2 minutes)
   - Get your live URL!

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🎯 Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Or use Netlify Dashboard**
   - Go to https://app.netlify.com
   - Drag & drop the `dist` folder
   - Or connect your GitHub repo

## 🔧 Environment Configuration

If you need environment variables (optional):

### Create `.env` file (local only - not committed):
```
VITE_CONTRACT_ADDRESS=0x...
VITE_IMGBB_API_KEY=your_key_here
```

### Update `app.js` to use environment variables:
```javascript
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x21Ab0638F4f0FbcD5C1c87d1423b3874cDb69307';
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '92eb18ce1295fb12bbe68cc5af81c760';
```

### Add to Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add your variables

## 📱 Post-Deployment Tasks

After successful deployment:

1. **Test the live site**
   - Connect MetaMask
   - Upload an image
   - Submit a challenge
   - Check all features work

2. **Update README.md**
   - Add your live URL
   - Update demo links

3. **Share your game!**
   - Twitter/X
   - Discord
   - GenLayer community

## 🐛 Troubleshooting

### Build Fails

**Error**: "Cannot resolve module"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Blank Page After Deploy

**Issue**: Assets not loading
- Check browser console for errors
- Verify `vite.config.js` base path is correct
- Ensure all files are in `dist/` folder

### MetaMask Not Connecting

**Issue**: Network not found
- User needs to add GenLayer network manually
- Check contract address is correct
- Verify RPC URL is accessible

### Images Not Uploading

**Issue**: CORS or API errors
- Check ImgBB API key is valid
- Verify file size is under 5MB
- Check network requests in browser DevTools

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Vercel automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-deploys!
```

### Deploy from Specific Branch

In Vercel dashboard:
- Settings → Git
- Set production branch to `main`
- Preview branches: All branches

## 📊 Monitoring

After deployment, monitor:

- **Analytics**: Vercel Analytics (free)
- **Errors**: Browser console logs
- **Performance**: Lighthouse scores
- **User Feedback**: GitHub Issues

## 🎉 Success!

Your Wild Guess game is now live! 

**Live URL**: `https://your-project.vercel.app`

Share it with the world and let people challenge the AI! 🦁✨

---

Need help? Check the [main README](./README.md) or open an issue on GitHub.
