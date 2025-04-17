import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import APIExplorerService from '../../services/APIExplorerService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('api-random')
    .setDescription('Get a random free API to play with')
    .addStringOption(option => 
      option.setName('category')
        .setDescription('Optional category to pick from')
        .setRequired(false)
        .setAutocomplete(true)
    ),
    
  async autocomplete(interaction) {
    const categories = await APIExplorerService.getCategories();
    const focusedValue = interaction.options.getFocused().toLowerCase();
    
    const filtered = categories.filter(category => 
      category.toLowerCase().includes(focusedValue)
    );
    
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
    );
  },
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const category = interaction.options.getString('category');
      let api;
      
      if (category) {
        const apis = await APIExplorerService.getAPIsByCategory(category);
        if (apis.length === 0) {
          return interaction.editReply(`No APIs found in the "${category}" category.`);
        }
        api = apis[Math.floor(Math.random() * apis.length)];
      } else {
        api = await APIExplorerService.getRandomAPI();
      }
      
      if (!api) {
        return interaction.editReply('Failed to find a random API. Please try again.');
      }
      
      const embed = new EmbedBuilder()
        .setTitle(`🌐 ${api.name}`)
        .setDescription(api.description)
        .setColor('#4CAF50')
        .addFields(
          { name: 'Category', value: api.category, inline: true },
          { name: 'Auth Required', value: api.requiresAuth ? 'Yes' : 'No', inline: true },
          { name: 'HTTPS', value: api.https ? 'Yes' : 'No', inline: true },
          { name: 'CORS', value: api.cors || 'Unknown', inline: true }
        );
        
      if (api.url) {
        embed.addFields({ name: 'URL', value: api.url });
      }
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing api-random command:', error);
      await interaction.editReply('Failed to retrieve a random API. Please try again later.');
    }
  }
}; 