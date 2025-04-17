import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { config } from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('github')
  .setDescription('Show all GitHub-related commands and features');

// Legacy data for text commands
export const legacyData = {
  name: 'github',
  description: 'Show all GitHub-related commands and features',
  aliases: ['gh'],
  usage: '',
  args: false,
  guildOnly: false
};

// Slash command handler
export const execute = async (interaction) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle('🐙 GitHub Commands')
      .setColor('#24292E') // GitHub dark color
      .setDescription('Here are all available GitHub-related commands:')
      .addFields(
        { 
          name: '📊 GitHub User Stats', 
          value: '`/ghstats username:<username>` - Get detailed statistics and contribution analysis for a GitHub user\n' +
                'Shows top languages, commit activity, repository count, and most active times.'
        },
        { 
          name: '📚 Repository Analysis', 
          value: '`/ghrepo repository:<owner/repo>` - Get detailed information about a GitHub repository\n' +
                'Shows languages, stars, contributors, commit activity, and more.'
        },
        {
          name: '🌱 Good First Issue Finder',
          value: '`/firstissue query:<project or topic>` - Find beginner-friendly issues in open-source projects\n' +
                'Great for developers looking to start contributing to open source.'
        },
        {
          name: '📈 Data Visualization',
          value: 'Stats commands include auto-generated charts powered by QuickChart.io:\n' +
                '• Language distribution (doughnut chart)\n' +
                '• Commit activity by day (bar chart)\n' +
                '• Time of day activity pattern (line chart)'
        },
        {
          name: '💡 Examples',
          value: '`/ghstats username:octocat` - Show GitHub stats for user "octocat"\n' +
                '`/ghrepo repository:facebook/react` - Show repository analysis for React\n' +
                '`/firstissue query:javascript` - Find beginner issues in JavaScript projects'
        }
      )
      .setFooter({ text: 'DevHelper Bot | GitHub Features', iconURL: interaction.client.user.displayAvatarURL() });
    
    return interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error displaying GitHub help:', error);
    return interaction.reply('An error occurred while displaying GitHub help.');
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle('🐙 GitHub Commands')
      .setColor('#24292E') // GitHub dark color
      .setDescription('Here are all available GitHub-related commands:')
      .addFields(
        { 
          name: '📊 GitHub User Stats', 
          value: '`!ghstats <username>` - Get detailed statistics and contribution analysis for a GitHub user\n' +
                'Shows top languages, commit activity, repository count, and most active times.'
        },
        { 
          name: '📚 Repository Analysis', 
          value: '`!ghrepo <owner/repo>` - Get detailed information about a GitHub repository\n' +
                'Shows languages, stars, contributors, commit activity, and more.'
        },
        {
          name: '🌱 Good First Issue Finder',
          value: '`!firstissue <project or topic>` - Find beginner-friendly issues in open-source projects\n' +
                'Great for developers looking to start contributing to open source.'
        },
        {
          name: '📈 Data Visualization',
          value: 'Stats commands include auto-generated charts powered by QuickChart.io:\n' +
                '• Language distribution (doughnut chart)\n' +
                '• Commit activity by day (bar chart)\n' +
                '• Time of day activity pattern (line chart)'
        },
        {
          name: '💡 Examples',
          value: '`!ghstats octocat` - Show GitHub stats for user "octocat"\n' +
                '`!ghrepo facebook/react` - Show repository analysis for React\n' +
                '`!firstissue javascript` - Find beginner issues in JavaScript projects'
        }
      )
      .setFooter({ text: 'DevHelper Bot | GitHub Features', iconURL: message.client.user.displayAvatarURL() });
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error displaying GitHub help:', error);
    return message.reply('An error occurred while displaying GitHub help.');
  }
};

// Fetch repository information from GitHub API
async function getRepoInfo(owner, repo) {
  try {
    const headers = { 
      'Accept': 'application/vnd.github.v3+json',
      ...(config.githubToken ? { 'Authorization': `token ${config.githubToken}` } : {})
    };
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    return response.data;
  } catch (error) {
    console.error('GitHub repo info error:', error);
    
    // If repo not found (404), return null
    if (error.response && error.response.status === 404) {
      return null;
    }
    
    throw error;
  }
}

// Fetch repository contributors from GitHub API
async function getContributors(owner, repo) {
  try {
    const headers = { 
      'Accept': 'application/vnd.github.v3+json',
      ...(config.githubToken ? { 'Authorization': `token ${config.githubToken}` } : {})
    };
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, { 
      headers,
      params: { per_page: 100 } // Get up to 100 contributors
    });
    
    return response.data;
  } catch (error) {
    console.error('GitHub contributors error:', error);
    return null;
  }
}

// Format date to readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

// Format number with commas
function formatNumber(num) {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
} 