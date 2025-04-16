import { EmbedBuilder } from 'discord.js';
import HackerNewsService from '../../services/feeds/HackerNewsService.js';

export const data = {
  name: 'hn',
  description: 'Get top stories from Hacker News',
  aliases: ['hackernews'],
  usage: '[top|new|best|ask|show] [number]',
  args: false,
  guildOnly: false
};

// Initialize service
const hnService = new HackerNewsService();

export const execute = async (message, args) => {
  const type = args.length > 0 ? args[0].toLowerCase() : 'top';
  const limit = args.length > 1 && !isNaN(args[1]) ? parseInt(args[1]) : 5;
  
  // Cap the limit to prevent abuse
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Validate type
    if (!['top', 'new', 'best', 'ask', 'show'].includes(type)) {
      return message.reply(
        'Invalid story type. Available options: top, new, best, ask, show.\n\nExample: `!hn top 5`'
      );
    }
    
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Fetching ${type} Hacker News stories...`);
    
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
      await loadingMsg.delete();
      return message.reply('No Hacker News stories found. Please try again later.');
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
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send embed
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error);
    return message.reply('An error occurred while fetching Hacker News stories. Please try again later.');
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