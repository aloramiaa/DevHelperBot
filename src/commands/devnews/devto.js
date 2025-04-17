import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import DevToService from '../../services/feeds/DevToService.js';

// Define available categories
const categories = {
  top: 'Top articles by reactions',
  latest: 'Latest published articles',
  webdev: 'Web Development articles',
  javascript: 'JavaScript articles',
  python: 'Python articles',
  devops: 'DevOps articles',
  ai: 'AI and Machine Learning articles'
};

export const data = new SlashCommandBuilder()
  .setName('devto')
  .setDescription('Get articles from Dev.to')
  .addStringOption(option =>
    option
      .setName('category')
      .setDescription('Category of articles to fetch')
      .setRequired(false)
      .addChoices(...Object.entries(categories).map(([key, value]) => ({ 
        name: value, 
        value: key 
      })))
  )
  .addIntegerOption(option =>
    option
      .setName('limit')
      .setDescription('Number of articles to return (max 10)')
      .setRequired(false)
  );

// Initialize service
const devToService = new DevToService();

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const category = interaction.options.getString('category') || 'top';
  const limit = interaction.options.getInteger('limit') || 5;
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Fetch articles based on category
    let articles = [];
    
    switch (category) {
      case 'top':
        articles = await devToService.getTopArticles(cappedLimit);
        break;
      case 'latest':
        articles = await devToService.getLatestArticles(cappedLimit);
        break;
      case 'webdev':
      case 'javascript':
      case 'python':
      case 'devops':
      case 'ai':
        // For tag-based categories
        const tag = category === 'ai' ? 'machinelearning' : category;
        articles = await devToService.getArticlesByTag(tag, cappedLimit);
        break;
      default:
        articles = await devToService.getTopArticles(cappedLimit);
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`👩‍💻 Dev.to ${category.charAt(0).toUpperCase() + category.slice(1)} Articles`)
      .setColor('#08090a') // Dev.to brand color
      .setDescription(`Here are the ${categories[category].toLowerCase()}.`)
      .setFooter({ text: 'DevHelper Bot | Dev.to', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add articles
    if (articles && articles.length > 0) {
      articles.forEach((article, index) => {
        const tags = article.tag_list?.length > 0 
          ? `\n**Tags:** ${article.tag_list.join(', ')}` 
          : '';
          
        embed.addFields({
          name: `${index + 1}. ${article.title} (${article.positive_reactions_count}🔼)`,
          value: `${article.description?.substring(0, 100)}...${tags}\n[Read more](${article.url}) • by ${article.user?.name || 'Unknown'}${article.comments_count ? ` • ${article.comments_count} comments` : ''}`
        });
      });
    } else {
      embed.setDescription(`No ${category} articles found. Try a different category.`);
    }
    
    // Add help for categories
    embed.addFields({
      name: '📚 Available Categories',
      value: Object.entries(categories).map(([key, value]) => `\`${key}\` - ${value}`).join('\n')
    });
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching Dev.to articles:', error);
    return interaction.editReply('An error occurred while fetching Dev.to articles. Please try again later.');
  }
};