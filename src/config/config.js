const dotenv = require('dotenv');
const path = require('path');

// Initialize dotenv
dotenv.config();

exports.config = {
  // Discord Bot Configuration
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  prefix: process.env.PREFIX || '!',

  // Database Configuration
  mongoURI: process.env.MONGODB_URI,

  // API Keys
  githubToken: process.env.GITHUB_TOKEN,
  stackoverflowKey: process.env.STACKOVERFLOW_KEY,

  // Feature Configuration
  features: {
    docs: true,
    stackoverflow: true,
    codeSnippets: true,
    boilerplateGenerator: true,
    npmInfo: true,
    pomodoro: true,
    githubStats: process.env.ENABLE_GITHUB_STATS !== 'false',
    todoManager: true,
    newsDigest: true,
    markdownRenderer: process.env.ENABLE_MARKDOWN_RENDERER !== 'false',
    goodFirstIssue: process.env.ENABLE_GOODFIRSTISSUE !== 'false',
    regexTools: process.env.ENABLE_REGEX_TOOLS !== 'false'
  },

  // Paths
  paths: {
    commands: path.join(__dirname, '..', 'commands'),
    events: path.join(__dirname, '..', 'events'),
  },
  
  // GitHub Settings
  github: {
    // Max repos to analyze for a user
    maxReposToAnalyze: 20,
    // Max number of chart items to display
    maxChartItems: 6,
    // Chart colors
    chartColors: [
      '#2ecc71', // green
      '#3498db', // blue
      '#9b59b6', // purple
      '#e74c3c', // red
      '#f1c40f', // yellow
      '#1abc9c', // teal
      '#95a5a6'  // gray
    ]
  },
  
  // Markdown Renderer Settings
  markdown: {
    // Max size of markdown to render (in characters)
    maxLength: 10000,
    // Default viewport width for rendered markdown
    defaultWidth: 800,
    // Default viewport height for rendered markdown (0 means auto)
    defaultHeight: 0,
    // Max age of cached screenshots (in milliseconds) - default: 1 hour
    maxCacheAge: 3600000,
    // Output formats supported
    formats: ['png', 'jpeg']
  },
  
  // Regex Tools Settings
  regex: {
    // Max pattern length
    maxPatternLength: 500,
    // Max test string length
    maxTestStringLength: 10000,
    // Default flags
    defaultFlags: '',
    // Available flags
    availableFlags: ['g', 'i', 'm', 's', 'u', 'y']
  }
}; 