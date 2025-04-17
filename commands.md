# 🤖 DevHelper Bot Commands

A comprehensive list of all available commands for DevHelper Bot.

## 🌐 API Commands
- `/api-categories` - List all available API categories
- `/api-list [category]` - Lists available free APIs by category
- `/api-random` - Get a random API from the collection

## 🔄 Development Tools
- `/base64 <encode|decode> <text>` - Encode or decode Base64 strings
- `/devtools` - List all available developer tools
- `/json <format|minify> <json>` - Format or minify JSON strings
- `/jwt <token>` - Decode JWT tokens
- `/format <language> <code>` - Format code in various languages
- `/formathelp` - Get help with code formatting
- `/regex <test|explain> <pattern>` - Test or explain regular expressions
- `/techstack <repository>` - Analyze tech stack of a GitHub repository

## 📰 Developer News
- `/devnews` - Get developer news and manage subscriptions
  - `/devnews latest [limit]` - Get latest news
  - `/devnews weekly [limit]` - Get weekly roundup
  - `/devnews subscribe <daily|weekly>` - Subscribe to news digest
  - `/devnews unsubscribe` - Unsubscribe from news digest
  - `/devnews sources` - Show available news sources
- `/daily [limit]` - Get a daily digest of developer news
- `/devtag <tag> [limit]` - Get Dev.to articles by tag
- `/devto [category] [limit]` - Get articles from Dev.to
- `/devuser <username> [limit]` - Get articles from a specific Dev.to user
- `/hn [type] [limit]` - Get Hacker News stories (top/new/best/ask/show)

## 🔍 Dev.to Specific
- `/devto-random` - Get random articles from Dev.to
- `/devto-search <query>` - Search articles on Dev.to
- `/devto-trending` - Get trending articles from Dev.to
- `/devto-user <username>` - Get user information from Dev.to

## 📚 Documentation
- `/doc <technology> <query>` - Search documentation (js, html, css, react, node, python)
- `/help [command]` - Show all available commands or info about a specific command

## 🐙 GitHub Tools
- `/firstissue <project|topic>` - Find beginner-friendly issues
- `/github` - Show all GitHub-related commands
- `/ghrepo <owner/repo>` - Get repository analysis
- `/ghstats <username>` - Get GitHub user statistics

## 📦 Package Management
- `/npm <package>` - Get information about an NPM package

## ⏰ Productivity
- `/pomodoro <start|stop|status>` - Manage Pomodoro sessions
- `/snippet <save|list|get|delete>` - Manage code snippets
- `/todo <add|list|complete|remove>` - Manage your todo list

## 🤔 Stack Overflow
- `/so <query>` - Search Stack Overflow for answers

## 🛠️ Utility Commands
- `/markdown` - Render Markdown text
- `/snippet` - Manage code snippets

---

### 📝 Command Usage Tips
- Commands marked with `/` are slash commands
- Parameters in `<>` are required
- Parameters in `[]` are optional
- Use `/help <command>` to get detailed information about any command

### 🎨 Categories Color Guide
- 🌐 API - Light Blue
- 🔄 Dev Tools - Purple
- 📰 News - Orange
- 📚 Docs - Green
- 🐙 GitHub - Dark Gray
- ⏰ Productivity - Red
- 🛠️ Utilities - Cyan

---

*Generated for DevHelper Bot - Made by devs, for devs* 🚀