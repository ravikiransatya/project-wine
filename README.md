# VINNI — A World Made For You

A cinematic, click-driven birthday experience for Vinni (16 November 2026), built with React + Vite.

## Features
- Passcode-based identity gate before the music and birthday experience
- Cinematic, GSAP-timed birthday landing with canvas fireworks and a progressive personal message
- Optional user-controlled local instrumental music
- Luxury cream, champagne and rose-gold visual direction
- Animated entrance, floating gold particles and scene transitions
- Click-to-open envelope
- Interactive birthday cake and candle-blowing moment
- Unfolding heartfelt friendship letter
- Gift box jewelry reveal and celebratory fireworks
- Message form that sends to the configured Formspree inbox
- Optional locally hosted soft instrumental audio (`public/soft-instrumental.wav`)
- Responsive layout and `prefers-reduced-motion` support

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Deploy
Push this folder to GitHub, import the repository into Vercel, select Vite, use `npm run build` and `dist` as the output directory.

The in-app identity gate is a casual front-end check, not real access security: its passcode is included in the public JavaScript. Use Vercel access protection if the site must be restricted to specific people.

## Message delivery setup
The final gift includes a message form. To receive messages:

1. Create a form at [Formspree](https://formspree.io/) and set your email as its recipient.
2. Verify the recipient email with Formspree and copy the form endpoint, which looks like `https://formspree.io/f/your-form-id`.
3. For local development, copy `.env.example` to `.env.local` and replace the example endpoint with your Formspree endpoint. Restart the Vite server.
4. For a deployed site, add `VITE_FORMSPREE_ENDPOINT` with the same endpoint in the hosting provider's environment-variable settings, then redeploy.

The endpoint is a public form identifier, not an email password or API secret. The message rocket animation only starts after Formspree accepts the submission; failures leave the written message in the form so it can be retried.

After identity verification, the opening screen invites visitors to turn on music before the birthday animation begins. Audio starts only after a click, respecting browser autoplay rules.
