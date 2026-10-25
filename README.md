# Web Connector website

A responsive static marketing site for **web-connector.win**, with separate pages for each service and an enquiry form that forwards leads to n8n.

## Preview locally

Open `index.html` in a browser or run a simple local web server from this folder. The static pages work without a build step. Direct `file://` previews automatically use demo-only form behaviour.

Use `enquiry.html?demo=1` to test the enquiry form. Demo submissions are stored only in this browser and are not sent to n8n. Clear this browser's site data to remove the demo entry.

## Deploy with GitHub and Cloudflare Pages

This project contains a Cloudflare Pages Function in `functions/api/lead.js`. Connect the GitHub repository to a **Cloudflare Pages** project using Git integration, with the repository root as the project root and no build command. Keep the `functions/` folder at the project root. Cloudflare's dashboard Direct Upload does not deploy Pages Functions.

After deployment, in the Pages project settings, add the encrypted secret `N8N_WEBHOOK_URL` and use the production n8n webhook URL as its value. Add it under **Settings → Variables and Secrets**, choose **Encrypt**, save, and redeploy. Configure it for the production environment; configure preview separately if you want to test preview deployments.

The Function serves `POST /api/lead`. The form calls that same-origin route; the Function forwards the submission to n8n. The webhook URL stays server-side and is not included in the HTML, JavaScript, or repository.

## n8n receiver

Create an n8n Webhook trigger with HTTP method **POST**, publish/activate the workflow, and use its production webhook URL for `N8N_WEBHOOK_URL`. The form sends a JSON payload containing:

- `type`: `service_enquiry`
- `name`, `business`, `email`, `phone`
- `service`, `timing`, `message`
- `consent`, `submittedAt`, `source`

Map those fields to an email notification, CRM, spreadsheet, or the next step you want. Add a Cloudflare rate limiting rule or Turnstile before public launch to reduce automated spam. Set retention and access controls for enquiry data in n8n.

## Video

Cloudflare Pages can serve static video files up to its current 25 MiB per-file limit, but it does not transcode them or provide adaptive streaming. For larger videos or smoother playback across different connections, upload the video to Cloudflare Stream and use its player/iframe. Check Cloudflare's current Stream pricing before use.

## Before publishing

- Confirm `hello@web-connector.win` is a real monitored mailbox or replace it throughout the files.
- Review the privacy notice in `privacy.html` against the actual business setup, n8n workflow, retention, and legal requirements.
- Photos are loaded from Unsplash and fonts from Google Fonts; self-host these assets if you prefer not to rely on third-party delivery.

## Files

- `index.html`, `services.html`, `about.html`, `enquiry.html`, `privacy.html` — primary pages
- `services/` — individual service landing pages
- `styles.css`, `script.js` — responsive visual system and browser interactions
- `functions/api/lead.js` — Cloudflare Pages enquiry handler
- `_headers`, `robots.txt`, `sitemap.xml` — hosting and search basics
