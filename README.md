# Ledgro launch kit — ledgro.co.in

Ledgro by VJ Hokhmah Pvt. Ltd. This folder is a complete, ready-to-host website and web app.

| Path | What it is |
|---|---|
| `index.html` | Website (home page, English) |
| `app/` | The Ledgro web app. Installs on the phone, works offline |
| `app/config.js` | The only file you edit: Razorpay and Google keys |
| `api/` | Small server: Razorpay subscriptions and plan check |
| `vercel.json` | Hosting settings |

## How shop data is kept safe

- All khata, bills, customers and settings are stored **only on the shop's phone**, in the browser's IndexedDB.
- Data is **encrypted with AES-256-GCM**. The key comes from the shop's 6-digit PIN (PBKDF2-SHA256, 310,000 rounds, random salt). Without the PIN the data is unreadable.
- The app **auto-locks** after 1–30 minutes (the shop chooses) and when idle.
- **Backup:** the shop taps "Back up to Google Drive". An encrypted file named `Ledgro backup.ledgro` is saved in **their own** Google Drive (Gmail account). After that, while the app is open, it backs up automatically every 10 minutes when data changes, and shows a reminder if there's been no backup for 24 hours. They can also share the encrypted file by email or WhatsApp.
- **Restore:** on a new phone, open Ledgro → Restore from backup → Google Drive or the file → enter the PIN used for that backup.
- **The server never receives shop data.** It stores only a random shop ID and its plan status (active / grace / halted / cancelled). The shop's phone number goes only to Razorpay with the subscription.

Two honest limits to tell shops:
1. **If they forget the PIN and have no backup, the data cannot be recovered**, by anyone, including Ledgro.
2. A 6-digit PIN stops anyone who picks up the phone. Someone who steals the backup file *and* has strong computers could try every PIN, so shops should keep backup files in their own Drive/email, not share them.

## 1. Put it online (about 30 minutes)

1. Create a free account at **vercel.com** (sign in with GitHub or email).
2. Upload this folder: either push it to a GitHub repository and click **Add New → Project → Import**, or install the Vercel CLI and run `vercel` inside this folder.
3. Framework preset: **Other**. No build command. Output directory: leave empty.
4. After the first deploy you get a link like `ledgro-xyz.vercel.app`. Open `/app/` to check the app.

## 2. Connect ledgro.co.in

1. In Vercel: Project → **Settings → Domains** → add `ledgro.co.in` and `www.ledgro.co.in`.
2. Vercel shows the DNS records to add. Log in where you bought the domain and add them:
   - `A` record for `@` → the IP Vercel shows (usually `76.76.21.21`)
   - `CNAME` for `www` → `cname.vercel-dns.com`
3. Wait 10 minutes to a few hours. Vercel adds HTTPS automatically. HTTPS is required for the app to install and for encryption to work.

## 3. Licence store (Upstash, free)

1. Create a free database at **upstash.com** → Redis → Create database (region: Mumbai `ap-south-1`).
2. Copy **REST URL** and **REST Token**.
3. In Vercel: Settings → **Environment Variables**, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## 4. Razorpay subscriptions

1. In the Razorpay Dashboard, complete KYC and enable **Subscriptions**.
2. Create six **Plans** (Subscriptions → Plans):

| Plan | Period | Amount |
|---|---|---|
| Starter monthly | monthly, every 1 | ₹199 |
| Starter yearly | yearly, every 1 | ₹1,990 |
| Growth monthly | monthly | ₹399 |
| Growth yearly | yearly | ₹3,990 |
| Pro monthly | monthly | ₹499 |
| Pro yearly | yearly | ₹4,990 |

3. Add these Vercel environment variables:
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (Settings → API Keys)
   - `RZP_PLAN_STARTER_MONTHLY`, `RZP_PLAN_STARTER_YEARLY`, `RZP_PLAN_GROWTH_MONTHLY`, `RZP_PLAN_GROWTH_YEARLY`, `RZP_PLAN_PRO_MONTHLY`, `RZP_PLAN_PRO_YEARLY` (each plan's `plan_...` ID)
4. Webhook: Settings → Webhooks → Add → URL `https://ledgro.co.in/api/razorpay-webhook`, choose a secret, tick the **subscription.*** events. Add that secret as `RAZORPAY_WEBHOOK_SECRET` in Vercel.
5. In `app/config.js` set `razorpayKeyId` to your Key ID (the public one, never the secret).
6. Redeploy. Test with Razorpay **Test Mode** keys first, then switch to Live keys.

## 5. Google Drive backup

1. Go to **console.cloud.google.com** → create project "Ledgro".
2. APIs & Services → Library → enable **Google Drive API**.
3. OAuth consent screen: External, app name "Ledgro", support email, logo, privacy policy URL. Add scope `.../auth/drive.file` (only files Ledgro creates; it cannot see anything else in their Drive).
4. Credentials → Create credentials → **OAuth client ID** → Web application. Authorised JavaScript origins: `https://ledgro.co.in`.
5. Copy the Client ID into `googleClientId` in `app/config.js` and redeploy.
6. While the consent screen is in "Testing", add your test Gmail IDs. Click **Publish app** before launch.

## 6. Before launch checklist

- [ ] Privacy policy and terms pages (Razorpay and Google both require them)
- [ ] Native Tamil and Malayalam speakers check every screen
- [ ] GST rates in the starter product list confirmed with your CA
- [ ] Test on 3 cheap Android phones: install, add credit, make a bill, back up, restore on another phone
- [ ] Razorpay test payment → plan shows as active in the app

## Not in this version (Phase 2)

- **Automatic WhatsApp reminders and the scheduled 9:30 pm report.** These need the WhatsApp Business API and the shop's explicit permission to send only the reminder details (customer number + amount) to the server at send time.
- **Phone OTP login and multi-phone staff logins.** Data stays on one phone in this version; a new phone uses Restore.

<!-- deployed with Razorpay keys + Upstash store, 2026-11-02 -->
<!-- redeploy after secret update -->
