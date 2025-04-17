import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import DevToService from '../../services/feeds/DevToService.js';

// Popular Dev.to users for suggestions
const popularUsers = [
  'ben', 'devteam', 'codenewbie', 'michaeltharrington', 
  'taeluralexis', 'bolajiayodeji', 'rhymes', 'kayis'
];

export const data = new SlashCommandBuilder()
  .setName('devuser')
  .setDescription('Get articles from a specific Dev.to user')
  .addStringOption(option =>
    option
      .setName('username')
      .setDescription('Dev.to username')
      .setRequired(true)
      .addChoices(...popularUsers.map(user => ({ name: user, value: user })))
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
  
  const username = interaction.options.getString('username').toLowerCase();
  const limit = interaction.options.getInteger('limit') || 5;
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Fetch articles by username
    const articles = await devToService.getArticlesByUsername(username, cappedLimit);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`👩‍💻 Dev.to Articles by @${username}`)
      .setColor('#08090a') // Dev.to brand color
      .setFooter({ text: 'DevHelper Bot | Dev.to User Search', iconURL: interaction.client.user.displayAvatarURL() })
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
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`Error fetching Dev.to articles for user ${username}:`, error);
    return interaction.editReply('An error occurred while fetching Dev.to articles. Please try again later.');
  }
};