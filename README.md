# Stephen McGillivray - AI-Powered Portfolio

An AI-queryable professional portfolio that allows recruiters to ask questions and get honest, contextual answers powered by Claude.

## Features

- **AI Chat**: Ask questions about experience, skills, and fit - powered by Claude
- **Honest Fit Assessment**: Paste a job description to get a candid assessment of fit
- **Skills Matrix**: Visual representation of strong skills, moderate skills, and gaps
- **Experience Timeline**: Work history with expandable AI context
- **Admin Panel**: Manage all content through a web interface

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Anthropic Claude API

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ 
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env.example` already contains the Supabase credentials. If you need to change them, edit `.env`.

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Deployment to Vercel (Recommended)

### Step 1: Push to GitHub

If you haven't already, create a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = `https://ulntzjwploxqhchhltlc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (the key from .env.example)
6. Click "Deploy"

You'll get a URL like `portfolio-abc123.vercel.app` immediately.

### Step 3: Add Custom Domain (Optional)

1. In Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., `stephenmcgillivray.com`)
3. Update DNS records as instructed by Vercel
4. SSL is automatic

---

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the same environment variables

### Self-Hosted (nginx)

```bash
# Build the project
npm run build

# Copy dist folder to your server
scp -r dist/* user@server:/var/www/portfolio/

# nginx config example
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/portfolio;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Supabase Configuration

Your data lives in Supabase. The database schema and edge functions are already set up.

### Edge Functions (Already Deployed)

The following edge functions handle AI interactions:

- `chat` - Powers the AI chat feature
- `analyze-jd` - Powers the job description fit analysis

These are already deployed to your Supabase project and require an `ANTHROPIC_API_KEY` secret.

### Setting Anthropic API Key

In your Supabase dashboard:

1. Go to Project Settings → Edge Functions
2. Add secret: `ANTHROPIC_API_KEY` = your Anthropic API key

Get an API key at: https://console.anthropic.com/

### Database Tables

| Table | Purpose |
|-------|---------|
| `candidate_profile` | Main profile info, elevator pitch, preferences |
| `experiences` | Work history with AI context |
| `skills` | Skills categorized as strong/moderate/gap |
| `gaps_weaknesses` | Explicit gaps and weaknesses |
| `values_culture` | Must-haves, dealbreakers, work style |
| `faq_responses` | Pre-written answers to common questions |
| `ai_instructions` | Instructions for AI behavior |
| `chat_messages` | Conversation history |

---

## Admin Panel

Access the admin panel at `/admin` to manage content.

Default login uses Supabase Auth. Set up authentication in your Supabase dashboard under Authentication → Users.

---

## Customizing for Your Own Use

If you want to use this portfolio for yourself:

1. Update `index.html` meta tags with your name and description
2. Clear the existing data in Supabase
3. Create a new candidate_profile record with your info
4. Add your experiences, skills, etc. through the admin panel

---

## Project Structure

```
├── src/
│   ├── components/       # React components
│   │   ├── admin/        # Admin panel components
│   │   ├── ChatDrawer.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── JDAnalyzer.tsx
│   │   ├── Navigation.tsx
│   │   ├── ScrollToTop.tsx
│   │   └── SkillsMatrix.tsx
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/              # Supabase client
│   ├── pages/            # Page components
│   └── index.css         # Global styles
├── supabase/
│   ├── functions/        # Edge functions (chat, analyze-jd)
│   └── migrations/       # Database schema
├── index.html            # Entry point with SEO meta tags
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Updating SEO Meta Tags

When you get a custom domain, update these files:

1. `index.html` - Update all URLs from `ai-powered-portfolio-98mc.bolt.host` to your domain
2. Create an `og-image.png` (1200x630px) for social sharing and place in `public/`

---

## Troubleshooting

### "Unable to Load Portfolio" Error

- Check that environment variables are set correctly
- Verify Supabase project is active
- Check browser console for specific error

### Chat Not Working

- Verify `ANTHROPIC_API_KEY` is set in Supabase Edge Function secrets
- Check that the edge functions are deployed
- Look at Supabase Edge Function logs for errors

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Cost Estimate

| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free |
| Supabase (Free tier) | Free |
| Domain (.com) | ~$12/year |
| Anthropic API | Pay-as-you-go (~$0.003 per chat message) |

**Total: ~$12/year + minimal API costs**

---

## License

MIT License - Feel free to use this as a template for your own portfolio.
