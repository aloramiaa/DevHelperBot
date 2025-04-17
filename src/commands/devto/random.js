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

export const execute = async (interaction, args = []) => {
  // Determine if this is a slash command or message command
  const isSlashCommand = interaction.deferReply !== undefined;
  
  // Handle reply based on context
  if (isSlashCommand) {
    await interaction.deferReply();
  } else {
    // For message commands, just acknowledge receipt
    await interaction.channel.send('Fetching a random article from Dev.to...');
  }
  
  try {
    const devToService = new DevToService();
    // Get tag from either slash command or message args
    const tag = isSlashCommand 
      ? interaction.options.getString('tag') 
      : args && args.length > 0 ? args[0] : null;
    
    let articles = [];
    if (tag) {
      articles = await devToService.getArticlesByTag(tag, 10);
    } else {
      articles = await devToService.getTopArticles(10);
    }
    
    if (!articles || articles.length === 0) {
      const errorMessage = tag 
        ? `No articles found with tag "${tag}". Try another tag.`
        : 'Failed to fetch articles from Dev.to. Please try again later.';
      
      return isSlashCommand
        ? interaction.editReply(errorMessage)
        : interaction.channel.send(errorMessage);
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
    
    // Send the embed based on context
    if (isSlashCommand) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error executing devto-random command:', error);
    const errorMessage = 'Failed to fetch a random article from Dev.to. Please try again later.';
    
    if (isSlashCommand) {
      await interaction.editReply(errorMessage);
    } else {
      await interaction.channel.send(errorMessage);
    }
  }
};