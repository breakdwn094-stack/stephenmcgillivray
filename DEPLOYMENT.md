# Deployment Checklist

## Quick Start (5-10 minutes)

### Option 1: Vercel (Recommended)

- [ ] Create GitHub account (if needed): https://github.com
- [ ] Create Vercel account: https://vercel.com (sign in with GitHub)
- [ ] Push code to GitHub repository
- [ ] In Vercel, click "Add New Project" → Import your repo
- [ ] Add environment variables:
  - `VITE_SUPABASE_URL` = `https://ulntzjwploxqhchhltlc.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = (copy from .env.example)
- [ ] Click Deploy
- [ ] Your site is live at `yourproject.vercel.app`

### Option 2: Netlify

- [ ] Create Netlify account: https://netlify.com
- [ ] Connect GitHub repository
- [ ] Build settings are auto-detected from `netlify.toml`
- [ ] Add same environment variables
- [ ] Deploy

---

## Custom Domain Setup

1. **Buy domain** (~$12/year):
   - Cloudflare Registrar: https://www.cloudflare.com/products/registrar/
   - Namecheap: https://www.namecheap.com
   
2. **Connect to Vercel**:
   - Project → Settings → Domains → Add Domain
   - Follow DNS instructions

3. **Update SEO meta tags**:
   - Open `index.html`
   - Find & Replace: `YOUR_DOMAIN.com` → your actual domain

4. **Create og-image.png**:
   - Size: 1200x630 pixels
   - Place in `public/` folder
   - Shows when shared on LinkedIn/Twitter

---

## Supabase Setup (Already Done)

Your Supabase project is already configured with:
- ✅ Database schema
- ✅ Edge functions (chat, analyze-jd)
- ✅ Row Level Security

**Only remaining step**: Add your Anthropic API key

1. Go to: https://console.anthropic.com/
2. Create API key
3. In Supabase: Project Settings → Edge Functions → Secrets
4. Add: `ANTHROPIC_API_KEY` = your key

---

## Test Your Deployment

- [ ] Homepage loads with your profile
- [ ] Experience section shows all roles
- [ ] Skills matrix displays correctly
- [ ] Chat drawer opens and responds
- [ ] Job description analyzer works
- [ ] Mobile responsive layout works

---

## Costs

| Item | Cost |
|------|------|
| Vercel/Netlify | Free |
| Supabase | Free |
| Domain | ~$12/year |
| Anthropic API | ~$0.003 per chat message |

**Estimated annual cost: $12 + minimal API usage**
