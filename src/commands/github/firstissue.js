import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import GitHubService from '../../services/GitHubService.js';

export const data = new SlashCommandBuilder()
  .setName('firstissue')
  .setDescription('Find beginner-friendly issues in open-source projects')
  .addStringOption(option => 
    option.setName('query')
      .setDescription('Project name or topic')
      .setRequired(true)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'firstissue',
  description: 'Find beginner-friendly issues in open-source projects',
  aliases: ['goodfirstissue', 'beginnerissue', 'starter'],
  usage: '<project name or topic>',
  args: true,
  guildOnly: false
};

// Initialize GitHub service
const githubService = new GitHubService();

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const query = interaction.options.getString('query');
  
  // Validate query parameter
  if (!query || query.trim() === '') {
    return interaction.editReply({
      content: 'Please provide a project name or topic. Examples:\n' +
        '`/firstissue query:react` - Find issues in projects with React topic\n' +
        '`/firstissue query:facebook/react` - Find issues in a specific repository',
      ephemeral: true
    });
  }
  
  try {
    // Get good first issues
    const { totalCount, issues } = await githubService.findGoodFirstIssues({
      query,
      limit: 10 // Maximum 10 issues to avoid too large embeds
    });
    
    // Check if issues were found
    if (!issues || issues.length === 0) {
      return interaction.editReply(
        `No beginner-friendly issues found for "${query}". Try these tips:\n` +
        '• Use a broader topic (e.g., "javascript" instead of a specific library)\n' +
        '• Check for typos in repository names\n' +
        '• Some projects may not use standard "good first issue" labels'
      );
    }
    
    // Create main embed
    const embed = new EmbedBuilder()
      .setTitle(`🌱 Good First Issues: ${query}`)
      .setColor('#2EA44F') // GitHub green color
      .setDescription(
        `Found ${totalCount} beginner-friendly issues${totalCount > issues.length ? ` (showing top ${issues.length})` : ''}\n\n` +
        `These are open issues labeled as good for newcomers to get started with open-source contributions.`
      )
      .setFooter({ text: 'DevHelper Bot | Good First Issues', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add issues to the embed
    issues.forEach((issue, index) => {
      // Get highlighted labels for better visibility
      const highlightedLabels = issue.labels
        .filter(label => 
          ['good first issue', 'good-first-issue', 'beginner friendly', 'beginner', 'easy', 'starter']
          .some(term => label.name.toLowerCase().includes(term))
        )
        .map(label => `\`${label.name}\``)
        .join(' ');
      
      embed.addFields({
        name: `${index + 1}. ${issue.title}`,
        value: 
          `**Repository:** [${issue.repoName}](${issue.repoUrl}) | **Issue:** [#${issue.number}](${issue.url})\n` +
          `**Created:** ${issue.timeAgo} | **Comments:** ${issue.commentsCount}\n` +
          `**Labels:** ${highlightedLabels || 'None'}`
      });
    });
    
    // Create buttons for additional actions
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Find More Issues')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://github.com/search?q=topic:${encodeURIComponent(query)}+label:%22good+first+issue%22+state:open&type=Issues`),
        new ButtonBuilder()
          .setLabel('How to Contribute')
          .setStyle(ButtonStyle.Link)
          .setURL('https://opensource.guide/how-to-contribute/')
      );
    
    // Send the embed with buttons
    return interaction.editReply({
      embeds: [embed],
      components: [row]
    });
    
  } catch (error) {
    console.error('Error finding good first issues:', error);
    return interaction.editReply(`An error occurred while searching for good first issues: ${error.message}`);
  }
};

// Legacy command handler for text commands
export const legacyExecute = async (message, args) => {
  if (!args || args.length === 0) {
    return message.reply(
      'Please provide a project name or topic. Examples:\n' +
      '`!firstissue react` - Find issues in projects with React topic\n' +
      '`!firstissue facebook/react` - Find issues in a specific repository'
    );
  }
  
  const query = args.join(' ');
  
  try {
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Searching for beginner-friendly issues in ${query}...`);
    
    // Get good first issues
    const { totalCount, issues } = await githubService.findGoodFirstIssues({
      query,
      limit: 10 // Maximum 10 issues to avoid too large embeds
    });
    
    // Check if issues were found
    if (!issues || issues.length === 0) {
      await loadingMsg.delete();
      return message.reply(
        `No beginner-friendly issues found for "${query}". Try these tips:\n` +
        '• Use a broader topic (e.g., "javascript" instead of a specific library)\n' +
        '• Check for typos in repository names\n' +
        '• Some projects may not use standard "good first issue" labels'
      );
    }
    
    // Create main embed
    const embed = new EmbedBuilder()
      .setTitle(`🌱 Good First Issues: ${query}`)
      .setColor('#2EA44F') // GitHub green color
      .setDescription(
        `Found ${totalCount} beginner-friendly issues${totalCount > issues.length ? ` (showing top ${issues.length})` : ''}\n\n` +
        `These are open issues labeled as good for newcomers to get started with open-source contributions.`
      )
      .setFooter({ text: 'DevHelper Bot | Good First Issues', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add issues to the embed
    issues.forEach((issue, index) => {
      // Get highlighted labels for better visibility
      const highlightedLabels = issue.labels
        .filter(label => 
          ['good first issue', 'good-first-issue', 'beginner friendly', 'beginner', 'easy', 'starter']
          .some(term => label.name.toLowerCase().includes(term))
        )
        .map(label => `\`${label.name}\``)
        .join(' ');
      
      embed.addFields({
        name: `${index + 1}. ${issue.title}`,
        value: 
          `**Repository:** [${issue.repoName}](${issue.repoUrl}) | **Issue:** [#${issue.number}](${issue.url})\n` +
          `**Created:** ${issue.timeAgo} | **Comments:** ${issue.commentsCount}\n` +
          `**Labels:** ${highlightedLabels || 'None'}`
      });
    });
    
    // Create buttons for additional actions
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Find More Issues')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://github.com/search?q=topic:${encodeURIComponent(query)}+label:%22good+first+issue%22+state:open&type=Issues`),
        new ButtonBuilder()
          .setLabel('How to Contribute')
          .setStyle(ButtonStyle.Link)
          .setURL('https://opensource.guide/how-to-contribute/')
      );
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send the embed with buttons
    return message.reply({
      embeds: [embed],
      components: [row]
    });
    
  } catch (error) {
    console.error('Error finding good first issues:', error);
    return message.reply(`An error occurred while searching for good first issues: ${error.message}`);
  }
}; 