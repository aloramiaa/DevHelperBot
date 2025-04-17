import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = new SlashCommandBuilder()
  .setName('devto-trending')
  .setDescription('Get trending articles from Dev.to')
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of articles to return (max 5)')
      .setRequired(false)
  );

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const devToService = new DevToService();
    const requestedLimit = interaction.options.getInteger('limit');
    
    // Cap the limit to prevent abuse
    const limit = requestedLimit ? Math.min(requestedLimit, 5) : 3;
    
    const articles = await devToService.getTopArticles(limit);
    
    if (!articles || articles.length === 0) {
      return interaction.editReply('Failed to fetch trending articles from Dev.to. Please try again later.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Trending Articles on Dev.to')
      .setColor('#0A0A0A') // Dev.to brand color
      .setDescription('The most popular articles on Dev.to right now')
      .setURL('https://dev.to')
      .setThumbnail('https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png');
    
    articles.forEach((article, index) => {
      // Get article tags as a string
      const tags = article.tags ? `Tags: ${article.tags.join(', ')}` : '';
      
      embed.addFields({
        name: `${index + 1}. ${article.title}`,
        value: `${article.description || 'No description available'}\n` +
               `👤 ${article.user.name} • ❤️ ${article.positive_reactions_count} • 💬 ${article.comments_count || 0}\n` +
               `${tags}\n[Read article](${article.url})`
      });
    });
    
    // Add a button to visit Dev.to
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Visit Dev.to')
          .setURL('https://dev.to')
          .setStyle(ButtonStyle.Link)
      );
    
    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error executing devto-trending command:', error);
    await interaction.editReply('Failed to fetch trending articles from Dev.to. Please try again later.');
  }
};