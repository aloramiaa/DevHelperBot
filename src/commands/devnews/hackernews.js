import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import HackerNewsService from '../../services/feeds/HackerNewsService.js';

export const data = new SlashCommandBuilder()
  .setName('hn')
  .setDescription('Get top stories from Hacker News')
  .addStringOption(option =>
    option
      .setName('type')
      .setDescription('Type of stories to fetch')
      .setRequired(false)
      .addChoices(
        { name: 'Top Stories', value: 'top' },
        { name: 'New Stories', value: 'new' },
        { name: 'Best Stories', value: 'best' },
        { name: 'Ask HN', value: 'ask' },
        { name: 'Show HN', value: 'show' }
      )
  )
  .addIntegerOption(option =>
    option
      .setName('limit')
      .setDescription('Number of stories to return (max 10)')
      .setRequired(false)
  );

// Initialize service
const hnService = new HackerNewsService();

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const type = interaction.options.getString('type') || 'top';
  const limit = interaction.options.getInteger('limit') || 5;
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Get stories based on type
    let stories;
    switch (type) {
      case 'top':
        stories = await hnService.getTopStories(cappedLimit);
        break;
      case 'new':
        stories = await hnService.getNewStories(cappedLimit);
        break;
      case 'best':
        stories = await hnService.getBestStories(cappedLimit);
        break;
      case 'ask':
        stories = await hnService.getAskStories(cappedLimit);
        break;
      case 'show':
        stories = await hnService.getShowStories(cappedLimit);
        break;
      default:
        stories = await hnService.getTopStories(cappedLimit);
    }
    
    // Check if stories were found
    if (!stories || stories.length === 0) {
      return interaction.editReply('No Hacker News stories found. Please try again later.');
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`🔥 ${capitalize(type)} Hacker News Stories`)
      .setColor('#ff6600') // HN orange
      .setDescription(`Here are the ${cappedLimit} ${type} stories from Hacker News:`)
      .setFooter({ text: 'DevHelper Bot | Hacker News', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add stories to embed
    stories.forEach((story, index) => {
      embed.addFields({
        name: `${index + 1}. ${story.title} ${story.score ? `(${story.score}🔼)` : ''}`,
        value: `[Read more](${story.url || `https://news.ycombinator.com/item?id=${story.id}`})${story.descendants ? ` • ${story.descendants} comments` : ''}`
      });
    });
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error);
    return interaction.editReply('An error occurred while fetching Hacker News stories. Please try again later.');
  }
};

// Handler for text-based commands
export const legacyExecute = async (message, args) => {
  // Message to show that the command is being processed
  const processingMsg = await message.reply('Fetching Hacker News stories...');
  
  const type = args[0] || 'top';
  const limit = parseInt(args[1]) || 5;
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Get stories based on type
    let stories;
    switch (type) {
      case 'top':
        stories = await hnService.getTopStories(cappedLimit);
        break;
      case 'new':
        stories = await hnService.getNewStories(cappedLimit);
        break;
      case 'best':
        stories = await hnService.getBestStories(cappedLimit);
        break;
      case 'ask':
        stories = await hnService.getAskStories(cappedLimit);
        break;
      case 'show':
        stories = await hnService.getShowStories(cappedLimit);
        break;
      default:
        stories = await hnService.getTopStories(cappedLimit);
    }
    
    // Check if stories were found
    if (!stories || stories.length === 0) {
      return processingMsg.edit('No Hacker News stories found. Please try again later.');
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`🔥 ${capitalize(type)} Hacker News Stories`)
      .setColor('#ff6600') // HN orange
      .setDescription(`Here are the ${cappedLimit} ${type} stories from Hacker News:`)
      .setFooter({ text: 'DevHelper Bot | Hacker News', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add stories to embed
    stories.forEach((story, index) => {
      embed.addFields({
        name: `${index + 1}. ${story.title} ${story.score ? `(${story.score}🔼)` : ''}`,
        value: `[Read more](${story.url || `https://news.ycombinator.com/item?id=${story.id}`})${story.descendants ? ` • ${story.descendants} comments` : ''}`
      });
    });
    
    return processingMsg.edit({ embeds: [embed], content: null });
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error);
    return processingMsg.edit('An error occurred while fetching Hacker News stories. Please try again later.');
  }
};

/**
 * Capitalize first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}