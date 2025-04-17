import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import DevToService from '../../services/feeds/DevToService.js';

// Popular Dev.to tags for suggestions
const popularTags = [
  'javascript', 'webdev', 'beginners', 'python', 
  'react', 'node', 'devops', 'programming',
  'aws', 'typescript', 'productivity', 'discuss',
  'career', 'docker', 'ai', 'tutorial'
];

export const data = new SlashCommandBuilder()
  .setName('devtag')
  .setDescription('Get Dev.to articles by tag')
  .addStringOption(option =>
    option
      .setName('tag')
      .setDescription('The tag to search for')
      .setRequired(true)
      .addChoices(...popularTags.map(tag => ({ name: tag, value: tag })))
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
  
  const tag = interaction.options.getString('tag').toLowerCase();
  const limit = interaction.options.getInteger('limit') || 5;
  const cappedLimit = Math.min(limit, 10);
  
  try {
    // Fetch articles by tag
    const articles = await devToService.getArticlesByTag(tag, cappedLimit);
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`👩‍💻 Dev.to Articles: #${tag}`)
      .setColor('#08090a') // Dev.to brand color
      .setFooter({ text: 'DevHelper Bot | Dev.to Tag Search', iconURL: interaction.client.user.displayAvatarURL() })
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
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`Error fetching Dev.to articles with tag ${tag}:`, error);
    return interaction.editReply('An error occurred while fetching Dev.to articles. Please try again later.');
  }
};