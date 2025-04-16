import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'json',
  description: 'Format or minify JSON strings',
  aliases: ['jsonformat', 'formatjson'],
  usage: '<format|minify> <json>',
  args: true,
  guildOnly: false,
  cooldown: 3
};

export const execute = async (message, args) => {
  // Check if we have enough arguments
  if (args.length < 2) {
    return message.reply(
      `You need to provide an operation (format/minify) and JSON string.\nUsage: \`${message.client.prefix}${data.name} ${data.usage}\`\n` +
      `Example: \`${message.client.prefix}${data.name} format {"name":"John","age":30}\``
    );
  }

  // Get the operation and JSON string
  const operation = args[0].toLowerCase();
  
  // Get all but the first argument (the operation) and join them with spaces
  const jsonStr = args.slice(1).join(' ');
  
  // Remove code block markdown if present
  let cleanJson = jsonStr;
  if (jsonStr.startsWith('```') && jsonStr.endsWith('```')) {
    // Remove the first line (which might contain the language) and the last line
    const lines = jsonStr.split('\n');
    cleanJson = lines.slice(1, lines.length - 1).join('\n');
  } else if (jsonStr.startsWith('`') && jsonStr.endsWith('`')) {
    cleanJson = jsonStr.substring(1, jsonStr.length - 1);
  }
  
  try {
    // Get the DevTools service
    const devToolsService = message.client.devToolsService;
    
    if (!devToolsService) {
      return message.reply('DevTools service is not available.');
    }

    let result;
    let title;
    
    // Perform the operation
    if (operation === 'format') {
      result = devToolsService.formatJSON(cleanJson, 2);
      title = '🔍 JSON Format';
    } else if (operation === 'minify') {
      result = devToolsService.minifyJSON(cleanJson);
      title = '📦 JSON Minify';
    } else {
      return message.reply(`Invalid operation. Use \`format\` or \`minify\`.\nUsage: \`${message.client.prefix}${data.name} ${data.usage}\``);
    }
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle(title)
      .addFields(
        { name: 'Input', value: `\`\`\`json\n${cleanJson.substring(0, 1000)}\n\`\`\`${cleanJson.length > 1000 ? '... (truncated)' : ''}` },
        { name: 'Output', value: `\`\`\`json\n${result.substring(0, 1000)}\n\`\`\`${result.length > 1000 ? '... (truncated)' : ''}` }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Send the result
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error(`Error ${args[0]} JSON:`, error);
    return message.reply(`An error occurred: ${error.message}`);
  }
};

// Create a slash command version
export const slash = {
  data: {
    name: 'json',
    description: 'Format or minify JSON strings',
    options: [
      {
        name: 'operation',
        description: 'Operation to perform',
        type: 3, // STRING type
        required: true,
        choices: [
          { name: 'Format', value: 'format' },
          { name: 'Minify', value: 'minify' }
        ]
      },
      {
        name: 'json',
        description: 'JSON string to format or minify',
        type: 3, // STRING type
        required: true
      }
    ]
  },
  async execute(interaction) {
    try {
      const operation = interaction.options.getString('operation');
      let jsonStr = interaction.options.getString('json');
      
      // Remove code block markdown if present
      if (jsonStr.startsWith('```') && jsonStr.endsWith('```')) {
        // Remove the first line (which might contain the language) and the last line
        const lines = jsonStr.split('\n');
        jsonStr = lines.slice(1, lines.length - 1).join('\n');
      } else if (jsonStr.startsWith('`') && jsonStr.endsWith('`')) {
        jsonStr = jsonStr.substring(1, jsonStr.length - 1);
      }
      
      // Get the DevTools service
      const devToolsService = interaction.client.devToolsService;
      
      if (!devToolsService) {
        return interaction.reply('DevTools service is not available.');
      }

      let result;
      let title;
      
      // Perform the operation
      if (operation === 'format') {
        result = devToolsService.formatJSON(jsonStr, 2);
        title = '🔍 JSON Format';
      } else if (operation === 'minify') {
        result = devToolsService.minifyJSON(jsonStr);
        title = '📦 JSON Minify';
      } else {
        return interaction.reply(`Invalid operation. Use \`format\` or \`minify\`.`);
      }
      
      // Create embed for the response
      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle(title)
        .addFields(
          { name: 'Input', value: `\`\`\`json\n${jsonStr.substring(0, 1000)}\n\`\`\`${jsonStr.length > 1000 ? '... (truncated)' : ''}` },
          { name: 'Output', value: `\`\`\`json\n${result.substring(0, 1000)}\n\`\`\`${result.length > 1000 ? '... (truncated)' : ''}` }
        )
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setTimestamp();
      
      // Send the result
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`Error with JSON command:`, error);
      return interaction.reply(`An error occurred: ${error.message}`);
    }
  }
}; 