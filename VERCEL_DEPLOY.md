# 🚀 Quick Deploy to Vercel

## ✅ Pre-Flight Checklist

Before pushing to GitHub and deploying:

- [ ] Contract address updated in `lib/genlayer/client.js`
- [ ] All files saved
- [ ] Tested locally with `npm run dev`
- [ ] Build works with `npm run build`

## 📤 Step-by-Step Deployment

### 1. Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Wild Guess game ready for deployment"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `wild-guess`
3. Description: "Challenge AI to identify animal images on GenLayer blockchain"
4. Keep it **Public** (or Private if you prefer)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### 3. Push to GitHub

```bash
# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/wild-guess.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"New Project"**
4. **Import** your `wild-guess` repository
5. Vercel will auto-detect settings:
   - **Framework Preset**: Vite ✅
   - **Build Command**: `npm run build` ✅
   - **Output Directory**: `dist` ✅
6. Click **"Deploy"**
7. Wait ~1-2 minutes ⏳
8. **Done!** Get your live URL 🎉

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

## 🎯 After Deployment

### Test Your Live App

1. Open your Vercel URL (e.g., `https://wild-guess.vercel.app`)
2. Click "Connect Wallet"
3. Add GenLayer network (if prompted)
4. Upload an animal image
5. Submit a challenge
6. Verify everything works!

### Update Your README

Replace placeholder URLs in `README.md`:

```markdown
- **Live Demo**: https://wild-guess.vercel.app
- **GitHub**: https://github.com/YOUR_USERNAME/wild-guess
```

### Share Your Game!

Tweet it, share on Discord, post to Reddit - let people play! 🎮

## 🔄 Making Updates

After making changes:

```bash
# Save changes
git add .
git commit -m "Describe your changes"
git push origin main

# Vercel auto-deploys! 🚀
```

## 🐛 Common Issues

### Issue: Build fails on Vercel

**Solution**: Check build logs in Vercel dashboard
```bash
# Test build locally first
npm run build
```

### Issue: Page loads but is blank

**Solution**: Check browser console for errors
- Verify contract address is correct
- Check all imports are correct

### Issue: MetaMask won't connect

**Solution**: 
- Make sure user has MetaMask installed
- GenLayer network should auto-add when user clicks button

### Issue: Images won't upload

**Solution**:
- Check ImgBB API key is valid
- Verify file size is under 5MB

## 🎉 Success!

Your Wild Guess game is now live on Vercel!

**Next Steps:**
- Monitor analytics in Vercel dashboard
- Check for user feedback
- Iterate and improve
- Share with the community!

---

**Need more help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced configuration.
