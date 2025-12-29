# Learn to Ski in Bohinj - Landing Page

Modern landing page for Bohinj Ski Week package by Apartmaji Žnidar.

## Features

- ✅ Responsive design (mobile-first)
- ✅ Clean, modern UI
- ✅ Booking form with email integration
- ✅ Smooth scroll animations
- ✅ Price calculator
- ✅ Program overview
- ✅ Contact information

## Structure

```
website/
├── index.html      # Main landing page
├── styles.css      # Styles
├── script.js       # Form handling & animations
└── README.md       # This file
```

## Deployment to Vercel

### Quick Deploy

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to this directory:
   ```bash
   cd "/Users/vitalijkurilov/Bohinj Ski Week/website"
   ```

3. Deploy:
   ```bash
   vercel
   ```

### GitHub Deploy

1. Push to GitHub
2. Go to https://vercel.com
3. Import repository
4. Deploy

## Form Integration

Currently uses `mailto:` link. For production, integrate with:
- **Formspree** (recommended, free tier available)
- **EmailJS**
- **Your own backend API**

### Formspree Setup

1. Sign up at https://formspree.io
2. Create a new form
3. Replace form action in `script.js`:
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
       method: 'POST',
       body: JSON.stringify(data),
       headers: {
           'Content-Type': 'application/json'
       }
   });
   ```

## Contact

Peter (Apartmaji Žnidar)
- Phone: +386 51 362 390
- Address: Savska cesta 6, 4264 Bohinjska Bistrica, Slovenia

## Next Steps

1. ✅ Created landing page
2. ⏳ Deploy to Vercel
3. ⏳ Set up proper email integration (Formspree)
4. ⏳ Add analytics (Google Analytics / Plausible)
5. ⏳ Create Hungarian version
6. ⏳ Set up Facebook Pixel for ads
7. ⏳ Add real photos from Bohinj
