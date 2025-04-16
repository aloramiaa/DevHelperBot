import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'base64',
  description: 'Encode or decode Base64 strings',
  aliases: ['b64'],
  usage: '<encode|decode> <text>',
  args: true,
  guildOnly: false,
  cooldown: 3
};

export const execute = async (message, args) => {
  // Check if we have enough arguments
  if (args.length < 2) {
    return message.reply(
      `You need to provide an operation (encode/decode) and text.\nUsage: \`${message.client.prefix}${data.name} ${data.usage}\`\n` +
      `Example: \`${message.client.prefix}${data.name} encode hello world\``
    );
  }

  // Get the operation and text
  const operation = args[0].toLowerCase();
  
  // Get all but the first argument (the operation) and join them with spaces
  const text = args.slice(1).join(' ');
  
  try {
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
      return message.reply(`Invalid operation. Use \`encode\` or \`decode\`.\nUsage: \`${message.client.prefix}${data.name} ${data.usage}\``);
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
    console.error(`Error ${args[0]} Base64:`, error);
    return message.reply(`An error occurred: ${error.message}`);
  }
};

// Create a slash command version
export const slash = {
  data: {
    name: 'base64',
    description: 'Encode or decode Base64 strings',
    options: [
      {
        name: 'operation',
        description: 'Operation to perform',
        type: 3, // STRING type
        required: true,
        choices: [
          { name: 'Encode', value: 'encode' },
          { name: 'Decode', value: 'decode' }
        ]
      },
      {
        name: 'text',
        description: 'Text to encode or decode',
        type: 3, // STRING type
        required: true
      }
    ]
  },
  async execute(interaction) {
    try {
      const operation = interaction.options.getString('operation');
      const text = interaction.options.getString('text');
      
      // Get the DevTools service
      const devToolsService = interaction.client.devToolsService;
      
      if (!devToolsService) {
        return interaction.reply('DevTools service is not available.');
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
        return interaction.reply(`Invalid operation. Use \`encode\` or \`decode\`.`);
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
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`Error with Base64 command:`, error);
      return interaction.reply(`An error occurred: ${error.message}`);
    }
  }
}; 