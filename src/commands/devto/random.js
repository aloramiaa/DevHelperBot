import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = new SlashCommandBuilder()
  .setName('devto-random')
  .setDescription('Get a random Dev.to article')
  .addStringOption(option => 
    option.setName('tag')
      .setDescription('Optional tag to filter articles')
      .setRequired(false)
  );

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const devToService = new DevToService();
    const tag = interaction.options.getString('tag');
    
    let articles = [];
    if (tag) {
      articles = await devToService.getArticlesByTag(tag, 10);
    } else {
      articles = await devToService.getTopArticles(10);
    }
    
    if (!articles || articles.length === 0) {
      return interaction.editReply(tag 
        ? `No articles found with tag "${tag}". Try another tag.`
        : 'Failed to fetch articles from Dev.to. Please try again later.'
      );
    }
    
    // Pick a random article
    const article = articles[Math.floor(Math.random() * articles.length)];
    
    const embed = new EmbedBuilder()
      .setTitle(`📝 ${article.title}`)
      .setColor('#0A0A0A') // Dev.to brand color
      .setDescription(article.description || 'No description available.')
      .setURL(article.url)
      .addFields(
        { name: 'Author', value: article.user.name, inline: true },
        { name: 'Reactions', value: `❤️ ${article.positive_reactions_count}`, inline: true },
        { name: 'Comments', value: `💬 ${article.comments_count || 0}`, inline: true }
      );
      
    if (article.tag_list && article.tag_list.length > 0) {
      embed.addFields({ name: 'Tags', value: article.tag_list.join(', ') });
    }
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error executing devto-random command:', error);
    await interaction.editReply('Failed to fetch a random article from Dev.to. Please try again later.');
  }
};