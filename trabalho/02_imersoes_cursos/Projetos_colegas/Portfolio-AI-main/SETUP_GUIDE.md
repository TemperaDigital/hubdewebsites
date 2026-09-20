# RyzenAI Website - Setup & Launch Guide

## 🚀 Quick Start (Windows)

### Option 1: Automatic Start (Easiest)
Simply double-click `start.bat` to launch both frontend and backend servers automatically!

### Option 2: Manual Start

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

## 📋 First Time Setup

1. **Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

2. **Run the Website**
```bash
# Option A: Use the start script
start.bat

# Option B: Run manually (see above)
```

3. **Open in Browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start backend server
cd backend && npm start
```

## 📁 Project Structure

```
F:\Upwork Agency Website\
├── src/
│   ├── components/          # All React components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── Hero.tsx        # Landing section
│   │   ├── About.tsx       # About section
│   │   ├── Services.tsx    # Services grid
│   │   ├── Portfolio.tsx   # Project showcase
│   │   ├── Process.tsx     # How we work
│   │   ├── Team.tsx        # Team members
│   │   ├── Testimonials.tsx # Client reviews
│   │   ├── Stats.tsx       # Statistics counters
│   │   ├── Contact.tsx     # Contact form
│   │   └── Footer.tsx      # Footer section
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── style.css           # Global styles
├── backend/
│   ├── server.js           # Express API
│   └── package.json        # Backend dependencies
├── public/                 # Static assets
├── dist/                   # Production build (generated)
├── start.bat               # Windows launch script
└── README.md               # Full documentation
```

## 🎨 Customization Guide

### Update Content

1. **Hero Section** - Edit `src/components/Hero.tsx`
2. **About Text** - Edit `src/components/About.tsx`
3. **Services** - Edit `src/components/Services.tsx`
4. **Portfolio Projects** - Edit `src/components/Portfolio.tsx`
5. **Team Members** - Edit `src/components/Team.tsx`
6. **Testimonials** - Edit `src/components/Testimonials.tsx`

### Change Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
}
```

### Update Contact Email

In `src/components/Contact.tsx`, change the API endpoint:
```typescript
const response = await fetch('YOUR_BACKEND_URL/api/contact', {
  // ...
})
```

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to:
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag & drop `dist/` folder
   - **GitHub Pages**: Use GitHub Actions

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway or Render
3. Set root directory to `/backend`
4. Add environment variables if needed
5. Deploy

### Environment Variables

For production, update the Contact form API endpoint:

**Frontend** (`src/components/Contact.tsx`):
```typescript
const response = await fetch(import.meta.env.VITE_API_URL || 'http://localhost:3001/api/contact', {
  // ...
})
```

Create `.env.production`:
```
VITE_API_URL=https://your-backend-url.com/api/contact
```

## 📧 Email Integration (Production)

The contact form currently logs to console. For production:

### Option 1: SendGrid
```bash
cd backend
npm install @sendgrid/mail
```

Update `backend/server.js`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In the contact endpoint:
await sgMail.send({
  to: 'hello@ryzenai.com',
  from: 'noreply@ryzenai.com',
  subject: `New Contact: ${name}`,
  text: message,
});
```

### Option 2: Nodemailer
```bash
cd backend
npm install nodemailer
```

Update `backend/server.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In the contact endpoint:
await transporter.sendMail({
  from: email,
  to: 'hello@ryzenai.com',
  subject: `New Contact: ${name}`,
  text: message,
});
```

## 🔧 Troubleshooting

### Port Already in Use

**Frontend (5173):**
```bash
# Kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Backend (3001):**
```bash
# Kill the process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

## 📱 Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Performance Tips

1. **Optimize Images**: Use WebP format, compress images
2. **Lazy Loading**: Already implemented for animations
3. **Code Splitting**: Vite handles this automatically
4. **CDN**: Deploy to Vercel/Netlify for global CDN

## 📞 Support

For questions or issues:
- Check the main `README.md`
- Review component files for inline documentation
- Test in browser console for debugging

## ✅ Pre-Launch Checklist

- [ ] Update all content (text, images)
- [ ] Test contact form with backend running
- [ ] Update email addresses and social links
- [ ] Test on mobile devices
- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Update meta tags in `index.html`
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Set up email notifications for contact form
- [ ] Deploy backend first, then frontend
- [ ] Update API endpoint in Contact.tsx
- [ ] Test live contact form after deployment

---

🎉 **Your website is ready! Launch with confidence.**

