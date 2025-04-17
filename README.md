<h1 align="center">📎 DevHelper</h1>
<p align="center">The <b>ultimate free Discord bot</b> for developers, teams, and coding communities.</p>

<p align="center">
  <a href="https://github.com/aloramiaa/devhelperbot/stargazers">
    <img src="https://img.shields.io/github/stars/aloramiaa/devhelperbot?style=for-the-badge&color=brightgreen" alt="Stars">
  </a>
  <a href="https://github.com/aloramiaa/devhelperbot/issues">
    <img src="https://img.shields.io/github/issues/aloramiaa/devhelperbot?style=for-the-badge&color=orange" alt="Issues">
  </a>
  <a href="https://github.com/aloramiaa/devhelperbot/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/aloramiaa/devhelperbot?style=for-the-badge&color=blue" alt="License">
  </a>
  <a href="https://discord.gg/yourinvitecode">
    <img src="https://img.shields.io/discord/yourserverid?style=for-the-badge&label=Join%20Community&logo=discord&color=7289da" alt="Discord">
  </a>
</p>

---

## 🚀 Features

> Designed to **boost productivity**, centralize tools, and empower dev communities — with zero cost.

| 💡 Command         | ⚙️ Description |
|--------------------|----------------|
| `!doc`             | Search docs: React, MDN, Python, Node, etc. |
| `!so`              | Get top StackOverflow answers |
| `!github`          | Fetch user stats, repos, and good first issues |
| `!boilerplate`     | Generate starter templates for projects |
| `!snippet`         | Share and beautify code |
| `!regex`           | Test & explain regex |
| `!npm`             | Fetch package info |
| `!devnews`         | Daily news from Dev.to, Hacker News |
| `!pomodoro`        | Productivity timer |
| `!todos`           | Task manager inside Discord |
| `!techstack`       | Detect stack from GitHub repo |
| `!markdown`        | Preview rendered markdown |
| … and more!        | All open-source & free |

---

## 🎥 Demo

> 🌐 Join our [**Live Demo Server**](https://discord.gg/yourinvitecode) to try commands live!  
> Use: `!doc react useEffect`, `!github aloramiaa`, `!firstissue react`, `!run js console.log('hi')`

![DevHelper Screenshot](https://your-screenshot-link.com)

---

## 🌟 Why DevHelper?

- ✅ 100% Free Forever — no paywalls, no rate limits
- 💻 Made for devs, by devs
- ⚙️ Easy self-hosting
- 🤝 Open source + community-powered
- 🧩 Modular command structure

---

## 📂 Folder Structure

```bash
src/
├── commands/         # All features (api, github, devnews, etc.)
├── services/         # Logic & API layer
├── models/           # Data schemas
├── events/           # Discord event listeners
├── config/           # Config & secrets
```

---

## 🛠 Tech Stack

- Node.js
- Discord.js
- GitHub API, StackOverflow, Dev.to RSS
- Markdown-it, Prettier, Regex parser
- Zero external paid services ✅

---

## 🔧 Troubleshooting

### Puppeteer Installation Issues

If you encounter errors related to Puppeteer or the markdown rendering command (`!markdown`), you may need to install additional dependencies required by Chromium:

#### Ubuntu/Debian:
```bash
apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

#### CentOS:
```bash
yum install -y alsa-lib at-spi2-atk at-spi2-core atk cups-libs libdrm libXcomposite libXcursor libXdamage libXext libXfixes libxi libXrandr libXrender mesa-libgbm nspr nss pango
```

#### Windows:
The bot should work without additional dependencies on Windows.

#### MacOS:
The bot should work without additional dependencies on MacOS.

#### Alternative: Disable Markdown Service
If you can't install the required dependencies, the bot will still function without the markdown rendering capability.

---

## ⚡ One-Click Deployment

> Deploy DevHelper on your own in seconds. No credit card, no catch.

[![Deploy to Replit](https://img.shields.io/badge/Deploy-Replit-blue?style=for-the-badge&logo=replit)](https://replit.com/github/aloramiaa/devhelperbot)  
[![Deploy to Deta](https://img.shields.io/badge/Deploy-Deta-brightgreen?style=for-the-badge)](https://deta.space)  
[![Deploy to Render](https://img.shields.io/badge/Deploy-Render-orange?style=for-the-badge)](https://render.com)

---

## 🧑‍💻 Contributing

We love contributors!

- 🏷 `good first issue` available
- 🌍 Help us add translations (English, Japanese, etc.)
- 🧠 Suggest new commands (AI tools, leetcode, etc.)
- ✨ Add your server to our showcase

> Check out [`CONTRIBUTING.md`](CONTRIBUTING.md) to get started.

---

## 🧠 Roadmap

- [x] GitHub & NPM integration
- [x] Dev news from dev.to, HN, Reddit
- [x] Pomodoro + Todos
- [ ] AI-powered `!explain` for code
- [ ] Web dashboard (planned)

---

## ⭐ Support & Share

If you like DevHelper:
- Give it a ⭐ on GitHub
- Share with your dev Discord
- Join our community

---

## 📄 License

MIT — Free to use, modify, and share.

---

**Built with ❤️ by devs for devs.**  
[Follow me on GitHub](https://github.com/aloramiaa)

