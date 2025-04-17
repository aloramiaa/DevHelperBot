import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import GitHubService from '../../services/GitHubService.js';

export const data = new SlashCommandBuilder()
  .setName('ghrepo')
  .setDescription('Get detailed information about a GitHub repository')
  .addStringOption(option => 
    option.setName('repository')
      .setDescription('Repository in the format owner/repo (e.g., facebook/react)')
      .setRequired(true)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'ghrepo',
  description: 'Get detailed information about a GitHub repository',
  aliases: ['githubrepo', 'repo'],
  usage: '<owner/repo>',
  args: true,
  guildOnly: false
};

// Initialize GitHub service
const githubService = new GitHubService();

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const repoPath = interaction.options.getString('repository');
  
  // Validate repository format
  if (!repoPath || !repoPath.includes('/')) {
    return interaction.editReply('You need to provide a repository in the format `owner/repo`. Example: `/ghrepo repository:facebook/react`');
  }
  
  const [owner, repo] = repoPath.split('/');
  
  try {
    // Get repository info
    const repoInfo = await githubService.client.get(`/repos/${owner}/${repo}`);
    const repoData = repoInfo.data;
    
    // Get repository languages
    const languagesResponse = await githubService.client.get(`/repos/${owner}/${repo}/languages`);
    const languages = languagesResponse.data;
    
    // Calculate percentages
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languagePercentages = Object.entries(languages).map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10
    })).sort((a, b) => b.percentage - a.percentage);
    
    // Create chart URL for languages
    const languagesChartUrl = generateRepoLanguagesChartUrl(languagePercentages);
    
    // Get contributors (limited to top 10)
    const contributorsResponse = await githubService.client.get(`/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 10 }
    });
    const contributors = contributorsResponse.data;
    
    // Get commit activity (commits per week for the past year)
    const commitActivityResponse = await githubService.client.get(`/repos/${owner}/${repo}/stats/commit_activity`);
    const commitActivity = commitActivityResponse.data;
    
    // Create chart URL for commit activity
    const commitActivityChartUrl = generateCommitActivityChartUrl(commitActivity);
    
    // Create main embed
    const embed = new EmbedBuilder()
      .setTitle(`${repoData.full_name}`)
      .setURL(repoData.html_url)
      .setColor('#24292E') // GitHub dark color
      .setDescription(repoData.description || 'No description provided')
      .setThumbnail(repoData.owner.avatar_url)
      .addFields(
        { name: '📊 Repository Info', value: '━━━━━━━━━━━━━━━━━━━━━━' },
        { name: 'Stars', value: repoData.stargazers_count.toString(), inline: true },
        { name: 'Forks', value: repoData.forks_count.toString(), inline: true },
        { name: 'Watchers', value: repoData.watchers_count.toString(), inline: true },
        { name: 'Issues', value: repoData.open_issues_count.toString(), inline: true },
        { name: 'Created', value: new Date(repoData.created_at).toLocaleDateString(), inline: true },
        { name: 'Last Update', value: new Date(repoData.updated_at).toLocaleDateString(), inline: true }
      )
      .setFooter({ text: 'DevHelper Bot | GitHub Repository', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add default branch
    if (repoData.default_branch) {
      embed.addFields({ name: 'Default Branch', value: repoData.default_branch, inline: true });
    }
    
    // Add languages section
    if (languagePercentages.length > 0) {
      const topLangsText = languagePercentages
        .slice(0, 5)
        .map((lang, index) => `${index + 1}. ${lang.name} (${lang.percentage}%)`)
        .join('\n');
      
      embed.addFields({ name: '🔤 Languages', value: topLangsText });
    }
    
    // Add top contributors section
    if (contributors.length > 0) {
      const contributorsText = contributors
        .slice(0, 5)
        .map((contributor, index) => `${index + 1}. [${contributor.login}](${contributor.html_url}) (${contributor.contributions} commits)`)
        .join('\n');
      
      embed.addFields({ name: '👨‍💻 Top Contributors', value: contributorsText });
    }
    
    // Add image chart
    embed.setImage(languagesChartUrl);
    
    // Create additional embed for activity chart
    const activityEmbed = new EmbedBuilder()
      .setTitle(`Commit Activity for ${repoData.full_name}`)
      .setColor('#24292E')
      .setImage(commitActivityChartUrl);
    
    // Send all embeds
    return interaction.editReply({ embeds: [embed, activityEmbed] });
    
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error);
    
    // Check if it's a 404 error (repository not found)
    if (error.response?.status === 404) {
      return interaction.editReply(`Repository not found: ${owner}/${repo}`);
    }
    
    return interaction.editReply(`An error occurred while analyzing GitHub repository: ${error.message}`);
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args) => {
  const repoPath = args[0];
  
  if (!repoPath || !repoPath.includes('/')) {
    return message.reply('You need to provide a repository in the format `owner/repo`. Example: `!ghrepo facebook/react`');
  }
  
  const [owner, repo] = repoPath.split('/');
  
  try {
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Fetching information for ${owner}/${repo}...`);
    
    try {
      // Get repository info
      const repoInfo = await githubService.client.get(`/repos/${owner}/${repo}`);
      const repoData = repoInfo.data;
      
      // Get repository languages
      const languagesResponse = await githubService.client.get(`/repos/${owner}/${repo}/languages`);
      const languages = languagesResponse.data;
      
      // Calculate percentages
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      const languagePercentages = Object.entries(languages).map(([name, bytes]) => ({
        name,
        percentage: Math.round((bytes / totalBytes) * 1000) / 10
      })).sort((a, b) => b.percentage - a.percentage);
      
      // Create chart URL for languages
      const languagesChartUrl = generateRepoLanguagesChartUrl(languagePercentages);
      
      // Get contributors (limited to top 10)
      const contributorsResponse = await githubService.client.get(`/repos/${owner}/${repo}/contributors`, {
        params: { per_page: 10 }
      });
      const contributors = contributorsResponse.data;
      
      // Get commit activity (commits per week for the past year)
      const commitActivityResponse = await githubService.client.get(`/repos/${owner}/${repo}/stats/commit_activity`);
      const commitActivity = commitActivityResponse.data;
      
      // Create chart URL for commit activity
      const commitActivityChartUrl = generateCommitActivityChartUrl(commitActivity);
      
      // Create main embed
      const embed = new EmbedBuilder()
        .setTitle(`${repoData.full_name}`)
        .setURL(repoData.html_url)
        .setColor('#24292E') // GitHub dark color
        .setDescription(repoData.description || 'No description provided')
        .setThumbnail(repoData.owner.avatar_url)
        .addFields(
          { name: '📊 Repository Info', value: '━━━━━━━━━━━━━━━━━━━━━━' },
          { name: 'Stars', value: repoData.stargazers_count.toString(), inline: true },
          { name: 'Forks', value: repoData.forks_count.toString(), inline: true },
          { name: 'Watchers', value: repoData.watchers_count.toString(), inline: true },
          { name: 'Issues', value: repoData.open_issues_count.toString(), inline: true },
          { name: 'Created', value: new Date(repoData.created_at).toLocaleDateString(), inline: true },
          { name: 'Last Update', value: new Date(repoData.updated_at).toLocaleDateString(), inline: true }
        )
        .setFooter({ text: 'DevHelper Bot | GitHub Repository', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      
      // Add default branch
      if (repoData.default_branch) {
        embed.addFields({ name: 'Default Branch', value: repoData.default_branch, inline: true });
      }
      
      // Add languages section
      if (languagePercentages.length > 0) {
        const topLangsText = languagePercentages
          .slice(0, 5)
          .map((lang, index) => `${index + 1}. ${lang.name} (${lang.percentage}%)`)
          .join('\n');
        
        embed.addFields({ name: '🔤 Languages', value: topLangsText });
      }
      
      // Add top contributors section
      if (contributors.length > 0) {
        const contributorsText = contributors
          .slice(0, 5)
          .map((contributor, index) => `${index + 1}. [${contributor.login}](${contributor.html_url}) (${contributor.contributions} commits)`)
          .join('\n');
        
        embed.addFields({ name: '👨‍💻 Top Contributors', value: contributorsText });
      }
      
      // Add image chart
      embed.setImage(languagesChartUrl);
      
      // Create additional embed for activity chart
      const activityEmbed = new EmbedBuilder()
        .setTitle(`Commit Activity for ${repoData.full_name}`)
        .setColor('#24292E')
        .setImage(commitActivityChartUrl);
      
      // Delete loading message
      await loadingMsg.delete();
      
      // Send all embeds
      return message.reply({ embeds: [embed, activityEmbed] });
      
    } catch (error) {
      console.error(`Error fetching repository ${owner}/${repo}:`, error);
      
      // Check if it's a 404 error (repository not found)
      if (error.response?.status === 404) {
        await loadingMsg.delete();
        return message.reply(`Repository not found: ${owner}/${repo}`);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error analyzing GitHub repository:', error);
    return message.reply(`An error occurred while analyzing GitHub repository: ${error.message}`);
  }
};

/**
 * Generate a URL for a chart showing repository languages
 * @param {Array} languagePercentages - Language percentages
 * @returns {string} - QuickChart.io URL
 */
function generateRepoLanguagesChartUrl(languagePercentages) {
  // Limit to top 6 languages for readability
  const displayLanguages = languagePercentages.slice(0, 6);
  
  // Add "Other" category if needed
  if (languagePercentages.length > 6) {
    const otherPercentage = languagePercentages.slice(6).reduce((sum, lang) => sum + lang.percentage, 0);
    displayLanguages.push({ name: 'Other', percentage: otherPercentage });
  }
  
  const chartData = {
    type: 'doughnut',
    data: {
      labels: displayLanguages.map(lang => lang.name),
      datasets: [{
        data: displayLanguages.map(lang => lang.percentage),
        backgroundColor: [
          '#2ecc71',
          '#3498db',
          '#9b59b6',
          '#e74c3c',
          '#f1c40f',
          '#1abc9c',
          '#95a5a6'
        ]
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Repository Languages (%)'
        }
      }
    }
  };
  
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
}

/**
 * Generate a URL for a chart showing commit activity
 * @param {Array} commitActivity - Weekly commit activity data
 * @returns {string} - QuickChart.io URL
 */
function generateCommitActivityChartUrl(commitActivity) {
  // Get the last 12 weeks of activity
  const recentActivity = commitActivity.slice(-12);
  
  // Create labels for weeks (Week 1, Week 2, etc.)
  const labels = recentActivity.map((_, i) => `Week ${i + 1}`);
  
  // Get the total commits per week
  const data = recentActivity.map(week => week.total);
  
  const chartData = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Commits',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Commit Count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time Period'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Recent Commit Activity (Last 12 Weeks)'
        }
      }
    }
  };
  
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
} 