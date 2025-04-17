import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = new SlashCommandBuilder()
  .setName('devto-search')
  .setDescription('Search for Dev.to articles by tag')
  .addStringOption(option => 
    option.setName('tag')
      .setDescription('Tag to search for')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of articles to return (max 5)')
      .setRequired(false)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'devto-search',
  description: 'Search for Dev.to articles by tag',
  aliases: ['devsearch', 'dev-search'],
  usage: '<tag> [limit]',
  args: true,
  guildOnly: false
};

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const tag = interaction.options.getString('tag');
  let requestedLimit = interaction.options.getInteger('limit');
  
  // Validate tag
  if (!tag || tag.trim() === '') {
    return interaction.editReply('Please provide a tag to search for. Example: `/devto-search tag:javascript`');
  }
  
  try {
    const devToService = new DevToService();
    
    // Cap the limit to prevent abuse
    const limit = requestedLimit ? Math.min(requestedLimit, 5) : 3;
    
    const articles = await devToService.getArticlesByTag(tag, limit);
    
    if (!articles || articles.length === 0) {
      return interaction.editReply(`No articles found with tag "${tag}". Try another tag.`);
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`Dev.to Articles - #${tag}`)
      .setColor('#0A0A0A')
      .setDescription(`Found ${articles.length} articles with tag #${tag}`)
      .setURL(`https://dev.to/t/${tag}`)
      .setThumbnail('https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png');
    
    articles.forEach((article, index) => {
      embed.addFields({
        name: `${index + 1}. ${article.title}`,
        value: `${article.description || 'No description available'}\n` +
               `👤 ${article.user.name} • ❤️ ${article.positive_reactions_count} • 💬 ${article.comments_count || 0}\n` +
               `[Read article](${article.url})`
      });
    });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('View more on Dev.to')
          .setURL(`https://dev.to/t/${tag}`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error executing devto-search command:', error);
    return interaction.editReply('Failed to search Dev.to articles. Please try again later.');
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  if (!args || !args.length) {
    return message.reply('Please provide a tag to search for. Example: `!devto-search javascript`');
  }

  const tag = args[0];
  let requestedLimit = parseInt(args[1]) || 3;
  
  // Set loading status
  const loadingMessage = await message.channel.send('🔍 Searching Dev.to articles...');
  
  try {
    const devToService = new DevToService();
    
    // Cap the limit to prevent abuse
    const limit = Math.min(requestedLimit, 5);
    
    const articles = await devToService.getArticlesByTag(tag, limit);
    
    // Delete loading message
    await loadingMessage.delete().catch(e => console.error('Error deleting message:', e));
    
    if (!articles || articles.length === 0) {
      return message.reply(`No articles found with tag "${tag}". Try another tag.`);
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`Dev.to Articles - #${tag}`)
      .setColor('#0A0A0A')
      .setDescription(`Found ${articles.length} articles with tag #${tag}`)
      .setURL(`https://dev.to/t/${tag}`)
      .setThumbnail('https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png');
    
    articles.forEach((article, index) => {
      embed.addFields({
        name: `${index + 1}. ${article.title}`,
        value: `${article.description || 'No description available'}\n` +
               `👤 ${article.user.name} • ❤️ ${article.positive_reactions_count} • 💬 ${article.comments_count || 0}\n` +
               `[Read article](${article.url})`
      });
    });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('View more on Dev.to')
          .setURL(`https://dev.to/t/${tag}`)
          .setStyle(ButtonStyle.Link)
      );

    return message.reply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error executing devto-search command:', error);
    
    // Delete loading message
    await loadingMessage.delete().catch(e => console.error('Error deleting message:', e));
    
    return message.reply('Failed to search Dev.to articles. Please try again later.');
  }
};