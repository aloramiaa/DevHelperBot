import { EmbedBuilder } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = {
  name: 'devtag',
  description: 'Get Dev.to articles by tag',
  aliases: ['dev-tag'],
  usage: '<tag> [limit]',
  args: true,
  guildOnly: false
};

// Initialize service
const devToService = new DevToService();

// Popular Dev.to tags for suggestions
const popularTags = [
  'javascript', 'webdev', 'beginners', 'python', 
  'react', 'node', 'devops', 'programming',
  'aws', 'typescript', 'productivity', 'discuss',
  'career', 'docker', 'ai', 'tutorial'
];

export const execute = async (message, args) => {
  // Check if tag is provided
  if (!args.length) {
    return message.reply(
      `You need to provide a tag! \nFor example: \`!devtag javascript 5\`\n\nPopular tags: ${popularTags.map(tag => `\`${tag}\``).join(', ')}`
    );
  }
  
  const tag = args[0].toLowerCase();
  // Second argument could be limit
  const limit = args.length > 1 && !isNaN(args[1]) ? parseInt(args[1]) : 5;
  // Cap the limit to prevent abuse
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Fetching Dev.to articles with tag: ${tag}...`);
    
    // Fetch articles by tag
    const articles = await devToService.getArticlesByTag(tag, cappedLimit);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`👩‍💻 Dev.to Articles: #${tag}`)
      .setColor('#08090a') // Dev.to brand color
      .setFooter({ text: 'DevHelper Bot | Dev.to Tag Search', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add articles
    if (articles && articles.length > 0) {
      embed.setDescription(`Found ${articles.length} articles with the tag \`${tag}\`.`);
      
      articles.forEach((article, index) => {
        const relatedTags = article.tag_list
          ?.filter(t => t !== tag)
          .slice(0, 3) || [];
        
        const tagText = relatedTags.length > 0 
          ? `\n**Related tags:** ${relatedTags.join(', ')}` 
          : '';
          
        embed.addFields({
          name: `${index + 1}. ${article.title} (${article.positive_reactions_count}🔼)`,
          value: `${article.description?.substring(0, 100) || ''}...${tagText}\n[Read more](${article.url}) • by ${article.user?.name || 'Unknown'}${article.comments_count ? ` • ${article.comments_count} comments` : ''}`
        });
      });
    } else {
      embed.setDescription(`No articles found with tag \`${tag}\`. Try a different tag.`);
      
      // Add tag suggestions
      embed.addFields({
        name: '🏷️ Popular Tags',
        value: popularTags.map(t => `\`${t}\``).join(', ')
      });
    }
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send embed
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error(`Error fetching Dev.to articles with tag ${tag}:`, error);
    return message.reply('An error occurred while fetching Dev.to articles. Please try again later.');
  }
}; 