'use strict';

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// These come from the Kubernetes ConfigMap injected as environment variables
const APP_COLOR = process.env.APP_COLOR || 'grey';
const APP_ENV   = process.env.APP_ENV   || 'local';

// Map color names to richer hex values for a nicer UI
const colorPalette = {
  blue:  { bg: '#1a3a5c', accent: '#4a90d9', text: '#e8f4fd', badge: 'STAGING'    },
  red:   { bg: '#4a1010', accent: '#d94a4a', text: '#fde8e8', badge: 'PRODUCTION' },
  grey:  { bg: '#2a2a2a', accent: '#888888', text: '#eeeeee', badge: 'LOCAL'      },
};

const palette = colorPalette[APP_COLOR] ?? colorPalette.grey;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: APP_ENV, color: APP_COLOR });
});

app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Config-Master | ${APP_ENV.toUpperCase()}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:     ${palette.bg};
      --accent: ${palette.accent};
      --text:   ${palette.text};
    }

    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 50%);
      color: var(--text);
      overflow: hidden;
    }

    /* Animated background rings */
    body::before, body::after {
      content: '';
      position: fixed;
      border-radius: 50%;
      border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
      animation: pulse 6s ease-in-out infinite;
    }
    body::before { width: 600px; height: 600px; top: -200px; right: -200px; animation-delay: 0s; }
    body::after  { width: 400px; height: 400px; bottom: -150px; left: -100px; animation-delay: 3s; }

    @keyframes pulse {
      0%, 100% { transform: scale(1);    opacity: 0.4; }
      50%       { transform: scale(1.08); opacity: 0.8; }
    }

    .card {
      position: relative;
      z-index: 1;
      background: color-mix(in srgb, var(--bg) 60%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3rem 4rem;
      max-width: 560px;
      width: 90%;
      text-align: center;
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 10%, transparent),
        0 32px 64px -12px rgba(0,0,0,0.6),
        inset 0 1px 0 color-mix(in srgb, var(--accent) 20%, transparent);
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    .badge {
      display: inline-block;
      background: var(--accent);
      color: var(--bg);
      font-weight: 700;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      padding: 0.3rem 1rem;
      border-radius: 100px;
      margin-bottom: 1.5rem;
      animation: slideUp 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    h1 {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--text) 40%, var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: slideUp 0.6s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .subtitle {
      font-size: 1rem;
      font-weight: 300;
      opacity: 0.7;
      margin-bottom: 2.5rem;
      animation: slideUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
      animation: slideUp 0.6s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .info-item {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
      border-radius: 12px;
      padding: 1rem;
      transition: background 0.2s;
    }
    .info-item:hover {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
    }

    .info-label {
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.55;
      margin-bottom: 0.3rem;
    }

    .info-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent);
    }

    .color-swatch {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent);
      margin-right: 6px;
      vertical-align: middle;
    }

    .footer {
      font-size: 0.75rem;
      opacity: 0.4;
      animation: slideUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${palette.badge}</div>
    <h1>Config-Master</h1>
    <p class="subtitle">Environment-aware deployment via Kubernetes ConfigMaps</p>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Environment</div>
        <div class="info-value">${APP_ENV}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Theme Color</div>
        <div class="info-value">
          <span class="color-swatch"></span>${APP_COLOR}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Hostname</div>
        <div class="info-value" style="font-size:0.85rem">${require('os').hostname()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Port</div>
        <div class="info-value">${PORT}</div>
      </div>
    </div>

    <p class="footer">
      Color injected via Kubernetes ConfigMap &nbsp;·&nbsp; Node.js ${process.version}
    </p>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`[Config-Master] Running on port ${PORT} | env=${APP_ENV} | color=${APP_COLOR}`);
});
