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

export const execute = async (interaction, args) => {
  // Determine if this is a slash command or message command
  const isSlashCommand = interaction.deferReply !== undefined;
  
  try {
    const devToService = new DevToService();
    let tag, requestedLimit;
    let loadingMessage;

    if (isSlashCommand) {
      await interaction.deferReply();
      tag = interaction.options.getString('tag');
      requestedLimit = interaction.options.getInteger('limit');
    } else {
      // Message command handling
      if (!args || !args.length) {
        return interaction.reply('Please provide a tag to search for. Example: `!devto-search javascript`');
      }
      tag = args[0];
      requestedLimit = parseInt(args[1]) || 3;
      loadingMessage = await interaction.channel.send('🔍 Searching Dev.to articles...');
    }
    
    // Cap the limit to prevent abuse
    const limit = requestedLimit ? Math.min(requestedLimit, 5) : 3;
    
    const articles = await devToService.getArticlesByTag(tag, limit);
    
    if (!articles || articles.length === 0) {
      const response = `No articles found with tag "${tag}". Try another tag.`;
      if (isSlashCommand) {
        return interaction.editReply(response);
      } else {
        if (loadingMessage) await loadingMessage.delete();
        return interaction.reply(response);
      }
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

    if (isSlashCommand) {
      await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
      if (loadingMessage) await loadingMessage.delete();
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  } catch (error) {
    console.error('Error executing devto-search command:', error);
    const errorMessage = 'Failed to search Dev.to articles. Please try again later.';
    if (isSlashCommand) {
      await interaction.editReply(errorMessage);
    } else {
      if (loadingMessage) await loadingMessage.delete();
      await interaction.reply(errorMessage);
    }
  }
};