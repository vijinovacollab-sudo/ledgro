// Ledgro settings. Fill these in after the setup steps in README.md.
// Leave a value empty ("") to switch that feature off.
window.LEDGRO_CONFIG = {
  pwa: true,                 // offline support + "Add to Home screen"
  apiBase: "/api",           // the small licence server (Vercel functions in /api)
  razorpayKeyId: "",         // Razorpay Key ID, e.g. rzp_live_xxxxx (public, safe here)
  googleClientId: "",        // Google OAuth Client ID for Drive backup, e.g. 1234-abc.apps.googleusercontent.com
};
