import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('devto-random')
    .setDescription('Get a random Dev.to article')
    .addStringOption(option => 
      option.setName('tag')
        .setDescription('Optional tag to filter articles')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const devToService = new DevToService();
      const tag = interaction.options.getString('tag');
      
      let articles;
      if (tag) {
        articles = await devToService.getArticlesByTag(tag, 10);
        if (articles.length === 0) {
          return interaction.editReply(`No articles found with tag "${tag}". Try another tag or omit for random articles.`);
        }
      } else {
        articles = await devToService.getArticles(20);
      }
      
      if (!articles || articles.length === 0) {
        return interaction.editReply('Failed to find Dev.to articles. Please try again later.');
      }
      
      // Get a random article from the results
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      
      const embed = new EmbedBuilder()
        .setTitle(randomArticle.title)
        .setURL(randomArticle.url)
        .setColor('#0A0A0A') // Dev.to brand color
        .setDescription(randomArticle.description || 'No description available')
        .setThumbnail(randomArticle.social_image || 'https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png')
        .addFields(
          { name: 'Author', value: randomArticle.user.name, inline: true },
          { name: 'Published', value: new Date(randomArticle.published_at).toLocaleDateString(), inline: true },
          { name: 'Reactions', value: randomArticle.positive_reactions_count.toString(), inline: true }
        );
      
      if (randomArticle.tags && randomArticle.tags.length > 0) {
        embed.addFields({ name: 'Tags', value: randomArticle.tags.join(', ') });
      }
      
      if (randomArticle.comments_count) {
        embed.addFields({ name: 'Comments', value: randomArticle.comments_count.toString(), inline: true });
      }
      
      if (randomArticle.reading_time_minutes) {
        embed.addFields({ name: 'Reading Time', value: `${randomArticle.reading_time_minutes} min`, inline: true });
      }
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing devto-random command:', error);
      await interaction.editReply('Failed to retrieve a random Dev.to article. Please try again later.');
    }
  }
}; 