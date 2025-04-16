import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export default {
  data: new SlashCommandBuilder()
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
    ),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const devToService = new DevToService();
      const tag = interaction.options.getString('tag');
      const requestedLimit = interaction.options.getInteger('limit');
      
      // Cap the limit to prevent abuse
      const limit = requestedLimit ? Math.min(requestedLimit, 5) : 3;
      
      const articles = await devToService.getArticlesByTag(tag, limit);
      
      if (!articles || articles.length === 0) {
        return interaction.editReply(`No articles found with tag "${tag}". Try another tag.`);
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`Dev.to Articles - #${tag}`)
        .setColor('#0A0A0A') // Dev.to brand color
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
      
      // Add a button to view more on Dev.to
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('View more on Dev.to')
            .setURL(`https://dev.to/t/${tag}`)
            .setStyle(ButtonStyle.Link)
        );
      
      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Error executing devto-search command:', error);
      await interaction.editReply('Failed to search Dev.to articles. Please try again later.');
    }
  }
}; 