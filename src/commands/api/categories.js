const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const APIExplorerService = require('../../services/APIExplorerService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('api-categories')
    .setDescription('List all available API categories'),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const apiExplorer = new APIExplorerService();
      const initialized = await apiExplorer.initialize();
      
      if (!initialized) {
        return interaction.editReply('Failed to initialize API Explorer. Please try again later.');
      }
      
      const categories = apiExplorer.getCategories();
      
      if (!categories || categories.length === 0) {
        return interaction.editReply('No API categories found.');
      }
      
      const embed = new MessageEmbed()
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
  }
}; 