/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ── XSS / injection ─────────────────────────────────────
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js needs 'unsafe-inline' for its runtime styles; nonces would require custom server
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // all avatars now proxied through /api/avatar (same-origin), so external avatar hosts removed from img-src
              "img-src 'self' data: blob:",
              "connect-src 'self' https://api.github.com https://api.spotify.com https://accounts.spotify.com https://va.vercel-scripts.com",
              "media-src 'self'",
              // block Flash, Java applets and other legacy plugins
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // auto-upgrade any accidental HTTP sub-resource requests
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // ── Clickjacking ─────────────────────────────────────────
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // ── MIME sniffing ────────────────────────────────────────
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // ── Referrer ─────────────────────────────────────────────
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ── Browser features ─────────────────────────────────────
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          // ── HSTS — preload-ready ──────────────────────────────────
          // After verifying all subdomains support HTTPS, submit at hstspreload.org
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // ── Cross-origin isolation ───────────────────────────────
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          // credentialless allows cross-origin resources without CORP headers
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          // ── Reporting ────────────────────────────────────────────
          {
            key: "Report-To",
            value: JSON.stringify({
              group: "default",
              max_age: 86400,
              endpoints: [{ url: "https://rejectmodders.is-a.dev/api/csp-report" }],
            }),
          },
          {
            key: "NEL",
            value: JSON.stringify({
              report_to: "default",
              max_age: 86400,
              include_subdomains: true,
            }),
          },
        ],
      },
      // API routes — tighten CORS to own origin only
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://rejectmodders.is-a.dev",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ]
  },
}

export default nextConfig
