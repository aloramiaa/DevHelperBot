import { EmbedBuilder } from 'discord.js';
import FeedService from '../../services/feeds/FeedService.js';
import NewsDigestService from '../../services/NewsDigestService.js';

export const data = {
  name: 'devnews',
  description: 'Get the latest developer news or subscribe to news digests',
  aliases: ['news'],
  usage: '[daily|weekly|subscribe|unsubscribe|sources]',
  args: false,
  guildOnly: true
};

// Initialize feed service
const feedService = new FeedService();

export const execute = async (message, args) => {
  const subCommand = args.length > 0 ? args[0].toLowerCase() : 'latest';
  
  try {
    switch (subCommand) {
      case 'daily':
        return await getDailyNews(message);
      case 'weekly':
        return await getWeeklyNews(message);
      case 'latest':
        return await getLatestNews(message);
      case 'subscribe':
        return await subscribeToDigest(message, args.slice(1));
      case 'unsubscribe':
        return await unsubscribeFromDigest(message);
      case 'sources':
        return showSources(message);
      default:
        return message.reply(
          `Invalid subcommand. Available options: daily, weekly, latest, subscribe, unsubscribe, sources.\n\nExample: \`!devnews daily\` or \`!devnews subscribe daily\``
        );
    }
  } catch (error) {
    console.error('Dev news command error:', error);
    return message.reply('An error occurred while fetching developer news. Please try again later.');
  }
};

/**
 * Get the latest developer news
 * @param {Object} message - Discord message
 */
async function getLatestNews(message) {
  // Send loading message
  const loadingMsg = await message.channel.send('🔍 Fetching the latest developer news...');
  
  try {
    // Get news from all sources
    const news = await feedService.getNews({ limit: 7 });
    
    if (!news || news.length === 0) {
      await loadingMsg.delete();
      return message.reply('No developer news found. Please try again later.');
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('🗞️ Latest Developer News')
      .setColor('#0099ff')
      .setDescription('Here\'s the latest developer news from around the web:')
      .setFooter({ text: 'DevHelper Bot News', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add news items to the embed
    news.forEach((item, index) => {
      let sourceEmoji = '📰';
      if (item.source === 'devto') sourceEmoji = '👩‍💻';
      if (item.source === 'hackernews') sourceEmoji = '🔥';
      if (item.source === 'reddit') sourceEmoji = '🤖';
      
      embed.addFields({
        name: `${index + 1}. ${sourceEmoji} ${item.title}`,
        value: `[Read more](${item.url})`
      });
    });
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send embed
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching latest news:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while fetching the latest developer news. Please try again later.');
  }
}

/**
 * Get daily developer news
 * @param {Object} message - Discord message
 */
async function getDailyNews(message) {
  // Same as getLatestNews but with a different title
  const loadingMsg = await message.channel.send('🔍 Fetching daily developer news...');
  
  try {
    const news = await feedService.getNews({ limit: 7 });
    
    if (!news || news.length === 0) {
      await loadingMsg.delete();
      return message.reply('No developer news found. Please try again later.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🗞️ Daily Developer News')
      .setColor('#0099ff')
      .setDescription('Here\'s your daily dose of developer news:')
      .setFooter({ text: 'DevHelper Bot News', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    news.forEach((item, index) => {
      let sourceEmoji = '📰';
      if (item.source === 'devto') sourceEmoji = '👩‍💻';
      if (item.source === 'hackernews') sourceEmoji = '🔥';
      if (item.source === 'reddit') sourceEmoji = '🤖';
      
      embed.addFields({
        name: `${index + 1}. ${sourceEmoji} ${item.title}`,
        value: `[Read more](${item.url})`
      });
    });
    
    await loadingMsg.delete();
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching daily news:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while fetching daily developer news. Please try again later.');
  }
}

/**
 * Get weekly developer news
 * @param {Object} message - Discord message
 */
async function getWeeklyNews(message) {
  // Similar to daily but with more results
  const loadingMsg = await message.channel.send('🔍 Fetching weekly developer news...');
  
  try {
    const news = await feedService.getNews({ limit: 10 });
    
    if (!news || news.length === 0) {
      await loadingMsg.delete();
      return message.reply('No developer news found. Please try again later.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🗞️ Weekly Developer News Roundup')
      .setColor('#0099ff')
      .setDescription('Here\'s your weekly roundup of developer news:')
      .setFooter({ text: 'DevHelper Bot News', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Limit to 10 items to prevent embed size issues
    const displayNews = news.slice(0, 10);
    
    displayNews.forEach((item, index) => {
      let sourceEmoji = '📰';
      if (item.source === 'devto') sourceEmoji = '👩‍💻';
      if (item.source === 'hackernews') sourceEmoji = '🔥';
      if (item.source === 'reddit') sourceEmoji = '🤖';
      
      embed.addFields({
        name: `${index + 1}. ${sourceEmoji} ${item.title}`,
        value: `[Read more](${item.url})`
      });
    });
    
    await loadingMsg.delete();
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching weekly news:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while fetching weekly developer news. Please try again later.');
  }
}

/**
 * Subscribe to news digest
 * @param {Object} message - Discord message
 * @param {Array} args - Command arguments
 */
async function subscribeToDigest(message, args) {
  // Check if NewsDigestService is available on the client
  if (!message.client.newsDigestService) {
    message.client.newsDigestService = new NewsDigestService(message.client);
  }
  
  // Parse frequency from args
  const frequency = args.length > 0 && ['daily', 'weekly'].includes(args[0].toLowerCase())
    ? args[0].toLowerCase()
    : 'daily';
  
  // Parse sources from args
  const sourcesArg = args.find(arg => arg.startsWith('sources='));
  let sources = ['devto', 'hackernews', 'reddit'];
  
  if (sourcesArg) {
    const parsedSources = sourcesArg.substring(8).split(',');
    if (parsedSources.length > 0) {
      // Filter valid sources
      sources = parsedSources.filter(source => 
        ['devto', 'hackernews', 'reddit'].includes(source.toLowerCase())
      );
    }
  }
  
  try {
    const subscription = await message.client.newsDigestService.subscribe({
      userId: message.author.id,
      serverId: message.guild.id,
      channelId: message.channel.id,
      frequency,
      sources
    });
    
    return message.reply(
      `✅ You have been subscribed to ${frequency} developer news digest! You'll receive updates in this channel.`
    );
  } catch (error) {
    console.error('Error subscribing to news digest:', error);
    return message.reply('An error occurred while subscribing to the news digest. Please try again later.');
  }
}

/**
 * Unsubscribe from news digest
 * @param {Object} message - Discord message
 */
async function unsubscribeFromDigest(message) {
  // Check if NewsDigestService is available on the client
  if (!message.client.newsDigestService) {
    message.client.newsDigestService = new NewsDigestService(message.client);
  }
  
  try {
    const unsubscribed = await message.client.newsDigestService.unsubscribe(
      message.author.id,
      message.guild.id
    );
    
    if (unsubscribed) {
      return message.reply('✅ You have been unsubscribed from the developer news digest.');
    } else {
      return message.reply('You are not currently subscribed to the developer news digest.');
    }
  } catch (error) {
    console.error('Error unsubscribing from news digest:', error);
    return message.reply('An error occurred while unsubscribing from the news digest. Please try again later.');
  }
}

/**
 * Show available news sources
 * @param {Object} message - Discord message
 */
function showSources(message) {
  const embed = new EmbedBuilder()
    .setTitle('📰 Available News Sources')
    .setColor('#0099ff')
    .setDescription('Here are the available developer news sources:')
    .addFields(
      { name: '👩‍💻 Dev.to', value: 'Articles from developers on Dev.to', inline: true },
      { name: '🔥 Hacker News', value: 'Top stories from Hacker News', inline: true },
      { name: '🤖 Reddit', value: 'Top posts from programming subreddits', inline: true }
    )
    .setFooter({ text: 'DevHelper Bot News', iconURL: message.client.user.displayAvatarURL() });
  
  return message.reply({ embeds: [embed] });
} 