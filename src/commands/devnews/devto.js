import { EmbedBuilder } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = {
  name: 'devto',
  description: 'Get articles from Dev.to',
  aliases: ['dev.to'],
  usage: '[category] [limit]',
  args: false,
  guildOnly: false
};

// Initialize service
const devToService = new DevToService();

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

export const execute = async (message, args) => {
  // Parse arguments - first arg could be category, second could be limit
  let category = 'top';
  let limit = 5;
  
  if (args.length > 0) {
    // Check if first arg is a category
    if (Object.keys(categories).includes(args[0].toLowerCase())) {
      category = args[0].toLowerCase();
      
      // If there's a second arg, it might be the limit
      if (args.length > 1 && !isNaN(args[1])) {
        limit = parseInt(args[1]);
      }
    } 
    // If first arg is a number, it's the limit
    else if (!isNaN(args[0])) {
      limit = parseInt(args[0]);
    }
  }
  
  // Cap the limit to prevent abuse
  limit = Math.min(limit, 10);
  
  try {
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Fetching ${category} articles from Dev.to...`);
    
    // Fetch articles based on category
    let articles = [];
    
    switch (category) {
      case 'top':
        articles = await devToService.getTopArticles(limit);
        break;
      case 'latest':
        articles = await devToService.getLatestArticles(limit);
        break;
      case 'webdev':
      case 'javascript':
      case 'python':
      case 'devops':
      case 'ai':
        // For tag-based categories
        const tag = category === 'ai' ? 'machinelearning' : category;
        articles = await devToService.getArticlesByTag(tag, limit);
        break;
      default:
        articles = await devToService.getTopArticles(limit);
    }
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`👩‍💻 Dev.to ${category.charAt(0).toUpperCase() + category.slice(1)} Articles`)
      .setColor('#08090a') // Dev.to brand color
      .setDescription(`Here are the ${categories[category].toLowerCase()}.`)
      .setFooter({ text: 'DevHelper Bot | Dev.to', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add articles
    if (articles && articles.length > 0) {
      articles.forEach((article, index) => {
        const tags = article.tag_list?.length > 0 
          ? `\n**Tags:** ${article.tag_list.slice(0, 3).join(', ')}` 
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
      value: Object.keys(categories).map(key => `\`${key}\``).join(', ')
    });
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send embed
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error fetching Dev.to articles:', error);
    return message.reply('An error occurred while fetching Dev.to articles. Please try again later.');
  }
}; 