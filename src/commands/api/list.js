import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import APIExplorerService from '../../services/APIExplorerService.js';

export const data = new SlashCommandBuilder()
  .setName('api-list')
  .setDescription('Lists available free APIs by category')
  .addStringOption(option => 
    option.setName('category')
      .setDescription('Filter APIs by category')
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

export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const category = interaction.options.getString('category');
    let apis = [];
    
    if (category) {
      apis = await APIExplorerService.getAPIsByCategory(category);
    } else {
      // If no category specified, show the list of categories
      const categories = await APIExplorerService.getCategories();
      
      const embed = new EmbedBuilder()
        .setTitle('🌐 API Categories')
        .setDescription('Choose a category to see available APIs')
        .setColor('#4CAF50')
        .addFields(
          { name: 'Available Categories', value: categories.join(', ') }
        )
        .setFooter({ text: 'Use /api-list <category> to view APIs in a specific category' });
      
      return interaction.editReply({ embeds: [embed] });
    }
    
    if (apis.length === 0) {
      return interaction.editReply(`No APIs found in the "${category}" category.`);
    }
    
    // Create a formatted list of APIs
    const formattedApis = apis.map(api => {
      const authStatus = api.requiresAuth ? '🔒' : '🔓';
      return `**${api.name}** ${authStatus} - ${api.description.substring(0, 100)}${api.description.length > 100 ? '...' : ''}`;
    });
    
    // Split into chunks of 10 if too many
    const apiChunks = [];
    for (let i = 0; i < formattedApis.length; i += 10) {
      apiChunks.push(formattedApis.slice(i, i + 10));
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`🌐 ${category || 'All'} APIs`)
      .setDescription(`Found ${apis.length} APIs${category ? ` in the "${category}" category` : ''}`)
      .setColor('#4CAF50')
      .setFooter({ text: '🔓 No authentication required | 🔒 Authentication required' });
    
    // Add each chunk as a field
    apiChunks.forEach((chunk, index) => {
      embed.addFields({
        name: index === 0 ? 'APIs' : '\u200B',
        value: chunk.join('\n\n')
      });
    });
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error executing api-list command:', error);
    await interaction.editReply('Failed to retrieve APIs. Please try again later.');
  }
};

export const legacyExecute = async (message, args) => {
  // Message to show that the command is being processed
  const processingMsg = await message.reply('Fetching API list...');
  
  try {
    const category = args[0];
    let apis = [];
    
    if (category) {
      apis = await APIExplorerService.getAPIsByCategory(category);
    } else {
      // If no category specified, show the list of categories
      const categories = await APIExplorerService.getCategories();
      
      const embed = new EmbedBuilder()
        .setTitle('🌐 API Categories')
        .setDescription('Choose a category to see available APIs')
        .setColor('#4CAF50')
        .addFields(
          { name: 'Available Categories', value: categories.join(', ') }
        )
        .setFooter({ text: 'Use !api-list <category> to view APIs in a specific category' });
      
      return processingMsg.edit({ embeds: [embed], content: null });
    }
    
    if (apis.length === 0) {
      return processingMsg.edit(`No APIs found in the "${category}" category.`);
    }
    
    // Create a formatted list of APIs
    const formattedApis = apis.map(api => {
      const authStatus = api.requiresAuth ? '🔒' : '🔓';
      return `**${api.name}** ${authStatus} - ${api.description.substring(0, 100)}${api.description.length > 100 ? '...' : ''}`;
    });
    
    // Split into chunks of 10 if too many
    const apiChunks = [];
    for (let i = 0; i < formattedApis.length; i += 10) {
      apiChunks.push(formattedApis.slice(i, i + 10));
    }
    
    const embed = new EmbedBuilder()
      .setTitle(`🌐 ${category || 'All'} APIs`)
      .setDescription(`Found ${apis.length} APIs${category ? ` in the "${category}" category` : ''}`)
      .setColor('#4CAF50')
      .setFooter({ text: '🔓 No authentication required | 🔒 Authentication required' });
    
    // Add each chunk as a field
    apiChunks.forEach((chunk, index) => {
      embed.addFields({
        name: index === 0 ? 'APIs' : '\u200B',
        value: chunk.join('\n\n')
      });
    });
    
    await processingMsg.edit({ embeds: [embed], content: null });
  } catch (error) {
    console.error('Error executing api-list command:', error);
    await processingMsg.edit('Failed to retrieve APIs. Please try again later.');
  }
};