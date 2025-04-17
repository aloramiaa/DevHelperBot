import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import APIExplorerService from '../../services/APIExplorerService.js';

export const data = new SlashCommandBuilder()
  .setName('api-random')
  .setDescription('Get a random free API to play with')
  .addStringOption(option => 
    option.setName('category')
      .setDescription('Optional category to pick from')
      .setRequired(false)
      .setAutocomplete(true)
  );
    
export const autocomplete = async (interaction) => {
  const categories = await APIExplorerService.getCategories();
  const focusedValue = interaction.options.getFocused().toLowerCase();
  
  const filtered = categories.filter(category => 
    category.toLowerCase().includes(focusedValue)
  );
  
  await interaction.respond(
    filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
  );
};

// Helper function to create the API embed
const createAPIEmbed = (api) => {
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
  
  return embed;
};

// Slash command handler
export const execute = async (interaction) => {
  if (interaction.isChatInputCommand()) {
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
      
      await interaction.editReply({ embeds: [createAPIEmbed(api)] });
    } catch (error) {
      console.error('Error executing api-random command:', error);
      await interaction.editReply('Failed to retrieve a random API. Please try again later.');
    }
  } else {
    // Message command handler
    const args = interaction.content.split(' ').slice(1);
    const category = args[0];
    const loadingMsg = await interaction.channel.send('🔍 Finding a random API...');
    
    try {
      let api;
      
      if (category) {
        const apis = await APIExplorerService.getAPIsByCategory(category);
        if (apis.length === 0) {
          await loadingMsg.delete();
          return interaction.reply(`No APIs found in the "${category}" category.`);
        }
        api = apis[Math.floor(Math.random() * apis.length)];
      } else {
        api = await APIExplorerService.getRandomAPI();
      }
      
      if (!api) {
        await loadingMsg.delete();
        return interaction.reply('Failed to find a random API. Please try again.');
      }
      
      await loadingMsg.delete();
      await interaction.reply({ embeds: [createAPIEmbed(api)] });
    } catch (error) {
      console.error('Error executing api-random command:', error);
      await loadingMsg.delete();
      await interaction.reply('Failed to retrieve a random API. Please try again later.');
    }
  }
};