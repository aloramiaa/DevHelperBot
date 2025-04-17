import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'format',
  description: 'Format code using various code formatters',
  aliases: ['beautify', 'prettier'],
  usage: '<language> <code>',
  args: true,
  guildOnly: false,
  cooldown: 5
};

export const execute = async (message, args = []) => {
  // Check if we have enough arguments
  if (!args || args.length < 2) {
    return message.reply(
      `You need to provide a language and code to format.\nUsage: \`${message.client.prefix}format <language> <code>\`\n` +
      `Example: \`${message.client.prefix}format js function hello() { return "world"; }\``
    );
  }

  // Get the language and code
  const language = args[0].toLowerCase();
  
  // Get all but the first argument (the language) and join them with spaces
  const code = args.slice(1).join(' ');
  
  // Remove code block markdown if present
  let cleanCode = code;
  if (code.startsWith('```') && code.endsWith('```')) {
    // Remove the first line (which might contain the language) and the last line
    const lines = code.split('\n');
    cleanCode = lines.slice(1, lines.length - 1).join('\n');
  } else if (code.startsWith('`') && code.endsWith('`')) {
    cleanCode = code.substring(1, code.length - 1);
  }
  
  try {
    // Get the formatter service
    const formatterService = message.client.codeFormatterService;
    
    if (!formatterService) {
      return message.reply('Code formatter service is not available.');
    }

    // Send a loading message
    const loadingMsg = await message.channel.send('🔄 Formatting code, please wait...');
    
    // Format the code
    const result = await formatterService.formatCode(language, cleanCode);
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor(result.success ? '#4CAF50' : '#F44336')
      .setTitle(`${result.success ? '✅' : '❌'} ${result.language} Code Formatting`)
      .setDescription(result.message)
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Add formatted code field
    if (result.formatted && result.formatted.trim() !== '') {
      embed.addFields({
        name: 'Formatted Code',
        value: `\`\`\`${language}\n${result.formatted.substring(0, 1000)}\n\`\`\`${result.formatted.length > 1000 ? '... (truncated)' : ''}`
      });
    }
    
    // Delete loading message and send result
    await loadingMsg.delete();
    
    // Send the formatted code
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error formatting code:', error);
    return message.reply(`An error occurred while formatting the code: ${error.message}`);
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  // Check if we have enough arguments
  if (!args || args.length < 2) {
    return message.reply(
      `You need to provide a language and code to format.\nUsage: \`${message.client.prefix}${data.name} <language> <code>\`\n` +
      `Example: \`${message.client.prefix}${data.name} js function hello() { return "world"; }\``
    );
  }

  // Get the language and code
  const language = args[0].toLowerCase();
  
  // Get all but the first argument (the language) and join them with spaces
  const code = args.slice(1).join(' ');
  
  // Remove code block markdown if present
  let cleanCode = code;
  if (code.startsWith('```') && code.endsWith('```')) {
    // Remove the first line (which might contain the language) and the last line
    const lines = code.split('\n');
    cleanCode = lines.slice(1, lines.length - 1).join('\n');
  } else if (code.startsWith('`') && code.endsWith('`')) {
    cleanCode = code.substring(1, code.length - 1);
  }
  
  try {
    // Get the formatter service
    const formatterService = message.client.codeFormatterService;
    
    if (!formatterService) {
      return message.reply('Code formatter service is not available.');
    }

    // Send a loading message
    const loadingMsg = await message.channel.send('🔄 Formatting code, please wait...');
    
    // Format the code
    const result = await formatterService.formatCode(language, cleanCode);
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor(result.success ? '#4CAF50' : '#F44336')
      .setTitle(`${result.success ? '✅' : '❌'} ${result.language} Code Formatting`)
      .setDescription(result.message)
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Add formatted code field
    if (result.formatted && result.formatted.trim() !== '') {
      embed.addFields({
        name: 'Formatted Code',
        value: `\`\`\`${language}\n${result.formatted.substring(0, 1000)}\n\`\`\`${result.formatted.length > 1000 ? '... (truncated)' : ''}`
      });
    }
    
    // Delete loading message and send result
    await loadingMsg.delete();
    
    // Send the formatted code
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error formatting code:', error);
    return message.reply(`An error occurred while formatting the code: ${error.message}`);
  }
};

// Create a slash command version
export const slash = {
  data: {
    name: 'format',
    description: 'Format code using various code formatters',
    options: [
      {
        name: 'language',
        description: 'The programming language of the code',
        type: 3, // STRING type
        required: true,
        choices: [
          { name: 'JavaScript', value: 'js' },
          { name: 'TypeScript', value: 'ts' },
          { name: 'Python', value: 'py' },
          { name: 'HTML', value: 'html' },
          { name: 'CSS', value: 'css' },
          { name: 'JSON', value: 'json' },
          { name: 'JSX', value: 'jsx' },
          { name: 'TSX', value: 'tsx' },
          { name: 'Java', value: 'java' },
          { name: 'C', value: 'c' },
          { name: 'C++', value: 'cpp' },
          { name: 'C#', value: 'cs' },
          { name: 'Go', value: 'go' },
          { name: 'Ruby', value: 'ruby' },
          { name: 'Rust', value: 'rust' },
          { name: 'PHP', value: 'php' }
        ]
      },
      {
        name: 'code',
        description: 'The code to format',
        type: 3, // STRING type
        required: true
      }
    ]
  },
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const language = interaction.options.getString('language');
      let code = interaction.options.getString('code');
      
      // Remove code block markdown if present
      if (code.startsWith('```') && code.endsWith('```')) {
        // Remove the first line (which might contain the language) and the last line
        const lines = code.split('\n');
        code = lines.slice(1, lines.length - 1).join('\n');
      } else if (code.startsWith('`') && code.endsWith('`')) {
        code = code.substring(1, code.length - 1);
      }
      
      // Get the formatter service
      const formatterService = interaction.client.codeFormatterService;
      
      if (!formatterService) {
        return interaction.editReply('Code formatter service is not available.');
      }
      
      // Format the code
      const result = await formatterService.formatCode(language, code);
      
      // Create embed for the response
      const embed = new EmbedBuilder()
        .setColor(result.success ? '#4CAF50' : '#F44336')
        .setTitle(`${result.success ? '✅' : '❌'} ${result.language} Code Formatting`)
        .setDescription(result.message)
        .setFooter({ 
          text: `Requested by ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setTimestamp();
      
      // Add formatted code field
      if (result.formatted && result.formatted.trim() !== '') {
        embed.addFields({
          name: 'Formatted Code',
          value: `\`\`\`${language}\n${result.formatted.substring(0, 1000)}\n\`\`\`${result.formatted.length > 1000 ? '... (truncated)' : ''}`
        });
      }
      
      // Send the formatted code
      return interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error formatting code:', error);
      return interaction.editReply(`An error occurred while formatting the code: ${error.message}`);
    }
  }
}; 