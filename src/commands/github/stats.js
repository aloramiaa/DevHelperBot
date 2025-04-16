import { EmbedBuilder } from 'discord.js';
import GitHubService from '../../services/GitHubService.js';

export const data = {
  name: 'ghstats',
  description: 'Get GitHub statistics and contribution analysis for a user',
  aliases: ['githubstats', 'ghprofile'],
  usage: '<username>',
  args: true,
  guildOnly: false
};

// Initialize GitHub service
const githubService = new GitHubService();

export const execute = async (message, args) => {
  const username = args[0];
  
  if (!username) {
    return message.reply('You need to provide a GitHub username. Example: `!ghstats octocat`');
  }
  
  try {
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Analyzing GitHub stats for ${username}...`);
    
    // Get user info and contributions
    const [userInfo, contributions] = await Promise.all([
      githubService.getUserInfo(username),
      githubService.getUserContributions(username)
    ]);
    
    // Create chart URLs
    const languagesChartUrl = githubService.generateLanguagesChartUrl(contributions.topLanguages);
    const commitActivityChartUrl = githubService.generateCommitActivityChartUrl(contributions.commitActivity);
    const hourlyCommitChartUrl = githubService.generateHourlyCommitChartUrl(contributions.commitActivity);
    
    // Create main embed
    const embed = new EmbedBuilder()
      .setTitle(`GitHub Stats: ${userInfo.name || username}`)
      .setURL(userInfo.html_url)
      .setColor('#24292E') // GitHub dark color
      .setDescription(userInfo.bio || '')
      .setThumbnail(userInfo.avatar_url)
      .addFields(
        { name: '📊 Profile Summary', value: '━━━━━━━━━━━━━━━━━━━━━━' },
        { name: 'Public Repositories', value: userInfo.public_repos.toString(), inline: true },
        { name: 'Followers', value: userInfo.followers.toString(), inline: true },
        { name: 'Following', value: userInfo.following.toString(), inline: true },
        { name: '📈 Contribution Analysis', value: '━━━━━━━━━━━━━━━━━━━━━━' },
        { name: 'Total Analyzed Commits', value: contributions.commitActivity.total.toString(), inline: true },
        { name: 'Most Active Day', value: contributions.mostActiveDay.day, inline: true },
        { name: 'Most Active Time', value: contributions.mostActiveTime.formatted, inline: true }
      )
      .setFooter({ text: 'DevHelper Bot | GitHub Stats', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add location if available
    if (userInfo.location) {
      embed.addFields({ name: 'Location', value: userInfo.location, inline: true });
    }
    
    // Add top languages section
    if (contributions.topLanguages.length > 0) {
      const topLangsText = contributions.topLanguages
        .slice(0, 5)
        .map((lang, index) => `${index + 1}. ${lang.name} (${lang.percentage}%)`)
        .join('\n');
      
      embed.addFields({ name: '🔤 Top Languages', value: topLangsText });
    }
    
    // Add image charts
    embed.setImage(languagesChartUrl);
    
    // Create additional embeds for charts
    const activityEmbed = new EmbedBuilder()
      .setTitle(`Commit Activity for ${username}`)
      .setColor('#24292E')
      .setImage(commitActivityChartUrl);
    
    const hourlyEmbed = new EmbedBuilder()
      .setTitle(`Daily Activity Pattern for ${username}`)
      .setColor('#24292E')
      .setImage(hourlyCommitChartUrl);
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send all embeds
    return message.reply({ embeds: [embed, activityEmbed, hourlyEmbed] });
    
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return message.reply(`An error occurred while fetching GitHub stats: ${error.message}`);
  }
}; 