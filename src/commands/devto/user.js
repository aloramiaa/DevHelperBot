import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import DevToService from '../../services/feeds/DevToService.js';

export const data = new SlashCommandBuilder()
  .setName('devto-user')
  .setDescription('Get articles by a specific Dev.to user')
  .addStringOption(option => 
    option.setName('username')
      .setDescription('Dev.to username')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName('limit')
      .setDescription('Number of articles to return (max 5)')
      .setRequired(false)
  );

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const devToService = new DevToService();
    const username = interaction.options.getString('username');
    const requestedLimit = interaction.options.getInteger('limit');
    
    // Cap the limit to prevent abuse
    const limit = requestedLimit ? Math.min(requestedLimit, 5) : 3;
    
    const articles = await devToService.getArticlesByUsername(username, limit);
    
    if (!articles || articles.length === 0) {
      return interaction.editReply(`No articles found for user "${username}". Make sure the username is correct.`);
    }
    
    // Get the user info from the first article
    const user = articles[0].user;
    
    const embed = new EmbedBuilder()
      .setTitle(`Articles by ${user.name}`)
      .setColor('#0A0A0A') // Dev.to brand color
      .setDescription(`Latest articles by ${username} on Dev.to`)
      .setURL(`https://dev.to/${username}`)
      .setThumbnail(user.profile_image || 'https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png');
    
    articles.forEach((article, index) => {
      embed.addFields({
        name: `${index + 1}. ${article.title}`,
        value: `${article.description || 'No description available'}\n` +
               `❤️ ${article.positive_reactions_count} • 💬 ${article.comments_count || 0}\n` +
               `[Read article](${article.url})`
      });
    });
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(`Visit ${username}'s profile`)
          .setURL(`https://dev.to/${username}`)
          .setStyle(ButtonStyle.Link)
      );
    
    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error executing devto-user command:', error);
    await interaction.editReply('Failed to fetch articles for this user. Please try again later.');
  }
};