import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import FeedService from '../../services/feeds/FeedService.js';
import NewsDigestService from '../../services/NewsDigestService.js';

export const data = new SlashCommandBuilder()
  .setName('devnews')
  .setDescription('Get developer news and manage news subscriptions')
  .addSubcommand(subcommand =>
    subcommand
      .setName('latest')
      .setDescription('Get the latest developer news')
      .addIntegerOption(option =>
        option
          .setName('limit')
          .setDescription('Number of articles to show (max 7)')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('weekly')
      .setDescription('Get a weekly roundup of developer news')
      .addIntegerOption(option =>
        option
          .setName('limit')
          .setDescription('Number of articles to show (max 10)')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('subscribe')
      .setDescription('Subscribe to news digests')
      .addStringOption(option =>
        option
          .setName('frequency')
          .setDescription('How often to receive updates')
          .setRequired(true)
          .addChoices(
            { name: 'Daily', value: 'daily' },
            { name: 'Weekly', value: 'weekly' }
          )
      )
      .addStringOption(option =>
        option
          .setName('sources')
          .setDescription('Comma-separated list of sources (devto,hackernews,reddit)')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('unsubscribe')
      .setDescription('Unsubscribe from news digests')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('sources')
      .setDescription('Show available news sources')
  );

// Initialize feed service
const feedService = new FeedService();

export const execute = async (interaction) => {
  const subCommand = interaction.options.getSubcommand();
  
  try {
    switch (subCommand) {
      case 'latest':
        return await getLatestNews(interaction);
      case 'weekly':
        return await getWeeklyNews(interaction);
      case 'subscribe':
        return await subscribeToDigest(interaction);
      case 'unsubscribe':
        return await unsubscribeFromDigest(interaction);
      case 'sources':
        return await showSources(interaction);
    }
  } catch (error) {
    console.error('Dev news command error:', error);
    return interaction.reply('An error occurred while processing your request. Please try again later.');
  }
};

async function getLatestNews(interaction) {
  await interaction.deferReply();
  
  try {
    const limit = interaction.options.getInteger('limit') || 7;
    const cappedLimit = Math.min(limit, 7);
    
    const news = await feedService.getNews({ limit: cappedLimit });
    
    if (!news || news.length === 0) {
      return interaction.editReply('No developer news found. Please try again later.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🗞️ Latest Developer News')
      .setColor('#0099ff')
      .setDescription('Here\'s the latest developer news from around the web:')
      .setFooter({ text: 'DevHelper Bot News', iconURL: interaction.client.user.displayAvatarURL() })
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
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return interaction.editReply('An error occurred while fetching the latest developer news. Please try again later.');
  }
}

async function getWeeklyNews(interaction) {
  await interaction.deferReply();
  
  try {
    const limit = interaction.options.getInteger('limit') || 10;
    const cappedLimit = Math.min(limit, 10);
    
    const news = await feedService.getNews({ limit: cappedLimit });
    
    if (!news || news.length === 0) {
      return interaction.editReply('No developer news found. Please try again later.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🗞️ Weekly Developer News Roundup')
      .setColor('#0099ff')
      .setDescription('Here\'s your weekly roundup of developer news:')
      .setFooter({ text: 'DevHelper Bot News', iconURL: interaction.client.user.displayAvatarURL() })
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
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching weekly news:', error);
    return interaction.editReply('An error occurred while fetching weekly developer news. Please try again later.');
  }
}

async function subscribeToDigest(interaction) {
  // Check if NewsDigestService is available on the client
  if (!interaction.client.newsDigestService) {
    interaction.client.newsDigestService = new NewsDigestService(interaction.client);
  }
  
  const frequency = interaction.options.getString('frequency');
  const sourcesInput = interaction.options.getString('sources');
  
  // Parse sources
  let sources = ['devto', 'hackernews', 'reddit'];
  if (sourcesInput) {
    const parsedSources = sourcesInput.split(',').map(s => s.trim().toLowerCase());
    if (parsedSources.length > 0) {
      sources = parsedSources.filter(source => 
        ['devto', 'hackernews', 'reddit'].includes(source)
      );
    }
  }
  
  try {
    await interaction.client.newsDigestService.subscribe({
      userId: interaction.user.id,
      serverId: interaction.guildId,
      channelId: interaction.channelId,
      frequency,
      sources
    });
    
    return interaction.reply(
      `✅ You have been subscribed to ${frequency} developer news digest! You'll receive updates in this channel.`
    );
  } catch (error) {
    console.error('Error subscribing to news digest:', error);
    return interaction.reply('An error occurred while subscribing to the news digest. Please try again later.');
  }
}

async function unsubscribeFromDigest(interaction) {
  // Check if NewsDigestService is available on the client
  if (!interaction.client.newsDigestService) {
    interaction.client.newsDigestService = new NewsDigestService(interaction.client);
  }
  
  try {
    const unsubscribed = await interaction.client.newsDigestService.unsubscribe(
      interaction.user.id,
      interaction.guildId
    );
    
    if (unsubscribed) {
      return interaction.reply('✅ You have been unsubscribed from the developer news digest.');
    } else {
      return interaction.reply('You are not currently subscribed to the developer news digest.');
    }
  } catch (error) {
    console.error('Error unsubscribing from news digest:', error);
    return interaction.reply('An error occurred while unsubscribing from the news digest. Please try again later.');
  }
}

async function showSources(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📰 Available News Sources')
    .setColor('#0099ff')
    .setDescription('Here are the available developer news sources:')
    .addFields(
      { name: '👩‍💻 Dev.to', value: 'Articles from developers on Dev.to', inline: true },
      { name: '🔥 Hacker News', value: 'Top stories from Hacker News', inline: true },
      { name: '🤖 Reddit', value: 'Top posts from programming subreddits', inline: true }
    )
    .setFooter({ text: 'DevHelper Bot News', iconURL: interaction.client.user.displayAvatarURL() });
  
  return interaction.reply({ embeds: [embed] });
}