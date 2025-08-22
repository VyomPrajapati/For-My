# 🚀 Vercel Deployment Guide

This guide will help you deploy your customizable love website to Vercel.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## 🚀 Step-by-Step Deployment

### 1. **Prepare Your Repository**
- Make sure all your changes are committed and pushed to GitHub
- Ensure your repository is public (or you have a Vercel Pro account for private repos)

### 2. **Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite React project
5. Click **"Deploy"**

#### **Option B: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project directory
cd project-sorry-renew

# Deploy
vercel

# Follow the prompts to link your project
```

### 3. **Configuration**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. **Environment Variables (Optional)**
If you want to change the default login credentials, you can set environment variables:
- Go to your project settings in Vercel
- Add environment variables:
  - `KALESHI_AURAT_USERNAME`: Your desired Kaleshi aurat username
  - `KALESHI_AURAT_PASSWORD`: Your desired Kaleshi aurat password
  - `USER_USERNAME`: Your desired user username
  - `USER_PASSWORD`: Your desired user password

## 🔐 **Default Login Credentials**

After deployment, use these credentials:

### **Admin Access (Kaleshi aurat)**
- **Username**: `kaleshi aurat`
- **Password**: `rotihuyiadri1306`
- **Permissions**: Full customization access

### **User Access (boondi ka laddu)**
- **Username**: `boondi ka laddu`
- **Password**: `Loml131803`
- **Permissions**: View-only access

## 🔧 **Customizing Login Credentials**

To change the default credentials, edit `src/utils/auth.ts`:

```typescript
export const AUTH_CONFIG = {
  KALESHI_AURAT: {
    username: 'your-username', // Change this
    password: 'your-password', // Change this
    role: 'kaleshi_aurat'
  },
  USER: {
    username: 'her-username', // Change this
    password: 'her-password', // Change this
    role: 'user'
  }
};
```

## 🌐 **Accessing Your Website**

After deployment, Vercel will provide you with:
- **Production URL**: `https://your-project.vercel.app`
- **Custom Domain**: You can add your own domain in Vercel settings

## 📱 **Sharing with Your Friend**

1. **Send the production URL** to your best friend
2. **Give her the admin credentials** to customize the website
3. **She can then share the URL** with her boyfriend using the user credentials

## 🔄 **Updating Your Website**

1. **Make changes** to your code locally
2. **Commit and push** to GitHub
3. **Vercel automatically redeploys** when it detects changes

## 🎯 **Features After Deployment**

### **Kaleshi aurat (Your Best Friend)**
- ✅ Full customization access
- ✅ Edit all text content
- ✅ Upload custom images
- ✅ Save changes to local storage
- ✅ Access to settings panel

### **User (Her Boyfriend)**
- ✅ View the customized website
- ✅ Play the heart-catching game
- ✅ Listen to music
- ✅ View all animations
- ❌ No customization access
- ❌ No settings panel

## 🚨 **Important Notes**

1. **Local Storage**: Changes are saved in the user's browser, not on the server
2. **Image Storage**: Images are stored as base64 in local storage
3. **Security**: This is a client-side only application - no server-side validation
4. **Backup**: Users can export their customizations for backup

## 🆘 **Troubleshooting**

### **Build Errors**
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes locally
- Verify all imports are correct

### **Runtime Errors**
- Check browser console for errors
- Verify all components are properly exported
- Check authentication flow

### **Deployment Issues**
- Ensure repository is accessible
- Check build logs in Vercel dashboard
- Verify build command and output directory

## 🎉 **You're All Set!**

Your customizable love website is now deployed and ready to share! 

**Next Steps:**
1. Test the admin login and customization
2. Share with your best friend
3. Let her customize it for her boyfriend
4. Share the final result with her boyfriend

---

**Need Help?** Check Vercel's documentation or reach out to their support team! 🚀
