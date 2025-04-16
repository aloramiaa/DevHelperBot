import { EmbedBuilder } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = {
  name: 'devuser',
  description: 'Get articles from a specific Dev.to user',
  aliases: ['dev-user'],
  usage: '<username> [limit]',
  args: true,
  guildOnly: false
};

// Initialize service
const devToService = new DevToService();

// Popular Dev.to users for suggestions
const popularUsers = [
  'ben', 'devteam', 'codenewbie', 'michaeltharrington', 
  'taeluralexis', 'bolajiayodeji', 'rhymes', 'kayis'
];

export const execute = async (message, args) => {
  // Check if username is provided
  if (!args.length) {
    return message.reply(
      `You need to provide a Dev.to username! \nFor example: \`!devuser ben 5\`\n\nPopular users: ${popularUsers.map(user => `\`${user}\``).join(', ')}`
    );
  }
  
  const username = args[0].toLowerCase();
  // Second argument could be limit
  const limit = args.length > 1 && !isNaN(args[1]) ? parseInt(args[1]) : 5;
  // Cap the limit to prevent abuse
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Send loading message
    const loadingMsg = await message.channel.send(`🔍 Fetching articles by Dev.to user: ${username}...`);
    
    // Fetch articles by username
    const articles = await devToService.getArticlesByUsername(username, cappedLimit);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`👩‍💻 Dev.to Articles by @${username}`)
      .setColor('#08090a') // Dev.to brand color
      .setFooter({ text: 'DevHelper Bot | Dev.to User Search', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add articles
    if (articles && articles.length > 0) {
      // Get user profile from the first article
      const userProfile = articles[0].user;
      
      // Set author with user info if available
      if (userProfile) {
        embed.setDescription(`Found ${articles.length} articles by [${userProfile.name}](https://dev.to/${username}).`);
        
        // Add user profile pic if available
        if (userProfile.profile_image) {
          embed.setThumbnail(userProfile.profile_image);
        }
      } else {
        embed.setDescription(`Found ${articles.length} articles by @${username}.`);
      }
      
      articles.forEach((article, index) => {
        // Get up to 3 tags
        const tags = article.tag_list?.slice(0, 3) || [];
        const tagText = tags.length > 0 
          ? `\n**Tags:** ${tags.join(', ')}` 
          : '';
          
        embed.addFields({
          name: `${index + 1}. ${article.title} (${article.positive_reactions_count}🔼)`,
          value: `${article.description?.substring(0, 100) || ''}...${tagText}\n[Read more](${article.url})${article.comments_count ? ` • ${article.comments_count} comments` : ''}`
        });
      });
      
      // Add link to user profile
      embed.addFields({
        name: '🔗 Profile Link',
        value: `[View @${username}'s profile on Dev.to](https://dev.to/${username})`
      });
    } else {
      embed.setDescription(`No articles found for user \`${username}\`. The username might not exist or they haven't published any articles.`);
      
      // Add user suggestions
      embed.addFields({
        name: '👨‍💻 Popular Dev.to Users',
        value: popularUsers.map(u => `\`${u}\``).join(', ')
      });
    }
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send embed
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error(`Error fetching Dev.to articles for user ${username}:`, error);
    return message.reply('An error occurred while fetching Dev.to articles. Please try again later.');
  }
}; 