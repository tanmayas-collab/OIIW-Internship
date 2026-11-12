<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/753624f6-36df-4ce2-a2bc-631ff8bd2424

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` (or `.env.local`) and set `GEMINI_API_KEY` and `ADMIN_PASSWORD`
3. Run the development server:
   `npm run dev`
4. Typecheck & build for production:
   `npm run lint && npm run build && npm start`
