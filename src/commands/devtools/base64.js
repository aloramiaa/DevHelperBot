import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('base64')
  .setDescription('Encode or decode Base64 strings')
  .addStringOption(option => 
    option.setName('operation')
      .setDescription('Operation to perform')
      .setRequired(true)
      .addChoices(
        { name: 'Encode', value: 'encode' },
        { name: 'Decode', value: 'decode' }
      )
  )
  .addStringOption(option => 
    option.setName('text')
      .setDescription('Text to encode or decode')
      .setRequired(true)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'base64',
  description: 'Encode or decode Base64 strings',
  aliases: ['b64'],
  usage: '<encode|decode> <text>',
  args: true,
  guildOnly: false,
  cooldown: 3
};

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const operation = interaction.options.getString('operation');
    const text = interaction.options.getString('text');
    
    // Validate inputs
    if (!operation || !text) {
      return interaction.editReply('Both operation and text are required.');
    }
    
    // Get the DevTools service
    const devToolsService = interaction.client.devToolsService;
    
    if (!devToolsService) {
      return interaction.editReply('DevTools service is not available.');
    }

    let result;
    let title;
    
    // Perform the operation
    if (operation === 'encode') {
      result = devToolsService.encodeBase64(text);
      title = '🔒 Base64 Encode';
    } else if (operation === 'decode') {
      result = devToolsService.decodeBase64(text);
      title = '🔓 Base64 Decode';
    } else {
      return interaction.editReply(`Invalid operation. Use \`encode\` or \`decode\`.`);
    }
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(title)
      .addFields(
        { name: 'Input', value: `\`\`\`\n${text.substring(0, 1000)}\n\`\`\`${text.length > 1000 ? '... (truncated)' : ''}` },
        { name: 'Output', value: `\`\`\`\n${result.substring(0, 1000)}\n\`\`\`${result.length > 1000 ? '... (truncated)' : ''}` }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Send the result
    return interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error(`Error with Base64 command:`, error);
    return interaction.editReply(`An error occurred: ${error.message}`);
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  // Check if we have enough arguments
  if (!args || args.length < 2) {
    return message.reply(
      `You need to provide an operation (encode/decode) and text.\nUsage: \`${message.client.prefix}${legacyData.name} ${legacyData.usage}\`\n` +
      `Example: \`${message.client.prefix}${legacyData.name} encode hello world\``
    );
  }

  try {
    // Get the operation and text
    const operation = args[0].toLowerCase();
    
    // Get all but the first argument (the operation) and join them with spaces
    const text = args.slice(1).join(' ');
    
    // Get the DevTools service
    const devToolsService = message.client.devToolsService;
    
    if (!devToolsService) {
      return message.reply('DevTools service is not available.');
    }

    let result;
    let title;
    
    // Perform the operation
    if (operation === 'encode') {
      result = devToolsService.encodeBase64(text);
      title = '🔒 Base64 Encode';
    } else if (operation === 'decode') {
      result = devToolsService.decodeBase64(text);
      title = '🔓 Base64 Decode';
    } else {
      return message.reply(`Invalid operation. Use \`encode\` or \`decode\`.\nUsage: \`${message.client.prefix}${legacyData.name} ${legacyData.usage}\``);
    }
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(title)
      .addFields(
        { name: 'Input', value: `\`\`\`\n${text.substring(0, 1000)}\n\`\`\`${text.length > 1000 ? '... (truncated)' : ''}` },
        { name: 'Output', value: `\`\`\`\n${result.substring(0, 1000)}\n\`\`\`${result.length > 1000 ? '... (truncated)' : ''}` }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Send the result
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error(`Error with Base64 command:`, error);
    return message.reply(`An error occurred: ${error.message}`);
  }
}; 