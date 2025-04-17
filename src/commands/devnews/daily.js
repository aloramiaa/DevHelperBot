import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import HackerNewsService from '../../services/feeds/HackerNewsService.js';
import DevToService from '../../services/feeds/DevToService.js';
import APIExplorerService from '../../services/APIExplorerService.js';

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Get a daily digest of developer news')
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of articles per source (max 5)')
      .setRequired(false)
  );

// Initialize services
const hnService = new HackerNewsService();
const devToService = new DevToService();

export const execute = async (interaction) => {
  await interaction.deferReply();

  // Get the limit from args, default to 3 per source
  const limit = interaction.options.getInteger('limit') || 3;
  
  // Cap the limit to prevent abuse
  const cappedLimit = Math.min(limit, 5);
  
  try {
    // Fetch news from various sources concurrently
    const [hnStories, devToArticles] = await Promise.all([
      hnService.getTopStories(cappedLimit),
      devToService.getTopArticles(cappedLimit)
    ]);
    
    // Initialize API Explorer and get a random API
    await APIExplorerService.ensureInitialized();
    const randomApi = await APIExplorerService.getRandomAPI();
    
    // Create main embed
    const embed = new EmbedBuilder()
      .setTitle('📰 Developer News Daily Digest')
      .setColor('#0099ff')
      .setDescription(`Here's your daily digest of developer news from around the web.`)
      .setFooter({ text: 'DevHelper Bot | Daily Digest', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add Hacker News section
    if (hnStories && hnStories.length > 0) {
      // Add section header
      embed.addFields({
        name: '🔥 Hacker News',
        value: '------------------------'
      });
      
      // Add stories
      hnStories.forEach((story, index) => {
        embed.addFields({
          name: `${index + 1}. ${story.title} ${story.score ? `(${story.score}🔼)` : ''}`,
          value: `[Read more](${story.url || `https://news.ycombinator.com/item?id=${story.id}`})${story.descendants ? ` • ${story.descendants} comments` : ''}`
        });
      });
    }
    
    // Add Dev.to section
    if (devToArticles && devToArticles.length > 0) {
      // Add section header
      embed.addFields({
        name: '👩‍💻 Dev.to',
        value: '------------------------'
      });
      
      // Add articles
      devToArticles.forEach((article, index) => {
        embed.addFields({
          name: `${index + 1}. ${article.title} (${article.positive_reactions_count}🔼)`,
          value: `[Read more](${article.url}) • by ${article.user.name}${article.comments_count ? ` • ${article.comments_count} comments` : ''}`
        });
      });
    }
    
    // Add API of the Day section
    if (randomApi) {
      embed.addFields({
        name: '🌐 API of the Day',
        value: '------------------------'
      });
      
      embed.addFields({
        name: randomApi.name,
        value: `${randomApi.description}\n[Check it out](${randomApi.url}) • Category: ${randomApi.category}`
      });
    }
    
    // Note about future integrations
    embed.addFields({
      name: '🔮 Coming Soon',
      value: 'More sources like GitHub Trending and Reddit programming communities will be added soon!'
    });
    
    // Send embed
    return interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error fetching developer news digest:', error);
    return interaction.editReply('An error occurred while fetching the developer news digest. Please try again later.');
  }
};