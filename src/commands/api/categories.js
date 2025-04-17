import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import APIExplorerService from '../../services/APIExplorerService.js';

export const data = new SlashCommandBuilder()
  .setName('api-categories')
  .setDescription('List all available API categories');

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    await APIExplorerService.ensureInitialized();
    const categories = await APIExplorerService.getCategories();
    
    if (!categories || categories.length === 0) {
      return interaction.editReply('No API categories found.');
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Available API Categories')
      .setDescription('Use these categories with the `/api-list` or `/api-random` commands.')
      .setColor('#0099ff')
      .addFields(
        { 
          name: 'Categories', 
          value: categories.join(', ')
        }
      )
      .setFooter({ text: `${categories.length} categories available` });
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error listing API categories:', error);
    await interaction.editReply('An error occurred while listing API categories.');
  }
};