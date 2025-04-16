import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'formathelp',
  description: 'Get help for the code formatter command',
  aliases: ['formatinfo', 'formatter'],
  usage: '',
  args: false,
  guildOnly: false
};

export const execute = async (message, args) => {
  try {
    // Get the formatter service
    const formatterService = message.client.codeFormatterService;
    
    if (!formatterService) {
      return message.reply('Code formatter service is not available.');
    }

    // Get supported languages
    const supportedLanguages = formatterService.getSupportedLanguages();
    
    // Group languages by their main type
    const languageGroups = {};
    supportedLanguages.forEach(lang => {
      const mainType = lang.name.split(' ')[0]; // Get first word of language name
      if (!languageGroups[mainType]) {
        languageGroups[mainType] = [];
      }
      languageGroups[mainType].push(lang.id);
    });
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🧰 Code Formatter Help')
      .setDescription(`Format your code with the \`${message.client.prefix}format\` command.`)
      .addFields({
        name: '📝 Usage',
        value: `\`${message.client.prefix}format <language> <code>\`\n` +
               `Example: \`${message.client.prefix}format js function hello() { return "world"; }\`\n\n` +
               `You can also use code blocks:\n` +
               `\`${message.client.prefix}format js \`\`\`js\nfunction hello() {\n  return "world";\n}\n\`\`\`\``
      })
      .setFooter({ 
        text: `${message.client.user.username} | Code Formatter`, 
        iconURL: message.client.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Add supported languages field
    const languageFields = [];
    for (const [group, langs] of Object.entries(languageGroups)) {
      languageFields.push({
        name: `${group} Languages`,
        value: langs.map(lang => `\`${lang}\``).join(', '),
        inline: true
      });
    }
    
    // Add the language fields in batches to not exceed field limit
    const fieldBatchSize = 3;
    for (let i = 0; i < languageFields.length; i += fieldBatchSize) {
      const batch = languageFields.slice(i, i + fieldBatchSize);
      embed.addFields(...batch);
    }
    
    // Add formatters info
    embed.addFields({
      name: '🔧 Formatters Used',
      value: '• JavaScript/TypeScript/JSX/TSX/HTML/CSS/JSON: **Prettier**\n' +
             '• Python: **Black**\n' +
             '• Java: **Google Java Format**\n' +
             '• Go: **gofmt**\n' +
             '• Ruby: **Rubocop**\n' +
             '• C/C++: **clang-format**\n' +
             '• C#: **dotnet format**\n' +
             '• Rust: **rustfmt**\n' +
             '• PHP: **PHP-CS-Fixer**'
    });
    
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error showing format help:', error);
    return message.reply(`An error occurred while showing format help: ${error.message}`);
  }
};

// Create a slash command version
export const slash = {
  data: {
    name: 'formathelp',
    description: 'Get help for the code formatter command'
  },
  async execute(interaction) {
    try {
      // Get the formatter service
      const formatterService = interaction.client.codeFormatterService;
      
      if (!formatterService) {
        return interaction.reply('Code formatter service is not available.');
      }

      // Get supported languages
      const supportedLanguages = formatterService.getSupportedLanguages();
      
      // Group languages by their main type
      const languageGroups = {};
      supportedLanguages.forEach(lang => {
        const mainType = lang.name.split(' ')[0]; // Get first word of language name
        if (!languageGroups[mainType]) {
          languageGroups[mainType] = [];
        }
        languageGroups[mainType].push(lang.id);
      });
      
      // Create embed for the response
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🧰 Code Formatter Help')
        .setDescription(`Format your code with the \`/format\` slash command or \`${interaction.client.prefix}format\` prefix command.`)
        .addFields({
          name: '📝 Usage',
          value: `**Slash Command**: \`/format language:javascript code:your_code_here\`\n\n` +
                 `**Text Command**: \`${interaction.client.prefix}format js function hello() { return "world"; }\`\n\n` +
                 `You can also use code blocks with the text command:\n` +
                 `\`${interaction.client.prefix}format js \`\`\`js\nfunction hello() {\n  return "world";\n}\n\`\`\`\``
        })
        .setFooter({ 
          text: `${interaction.client.user.username} | Code Formatter`, 
          iconURL: interaction.client.user.displayAvatarURL() 
        })
        .setTimestamp();
      
      // Add supported languages field
      const languageFields = [];
      for (const [group, langs] of Object.entries(languageGroups)) {
        languageFields.push({
          name: `${group} Languages`,
          value: langs.map(lang => `\`${lang}\``).join(', '),
          inline: true
        });
      }
      
      // Add the language fields in batches to not exceed field limit
      const fieldBatchSize = 3;
      for (let i = 0; i < languageFields.length; i += fieldBatchSize) {
        const batch = languageFields.slice(i, i + fieldBatchSize);
        embed.addFields(...batch);
      }
      
      // Add formatters info
      embed.addFields({
        name: '🔧 Formatters Used',
        value: '• JavaScript/TypeScript/JSX/TSX/HTML/CSS/JSON: **Prettier**\n' +
               '• Python: **Black**\n' +
               '• Java: **Google Java Format**\n' +
               '• Go: **gofmt**\n' +
               '• Ruby: **Rubocop**\n' +
               '• C/C++: **clang-format**\n' +
               '• C#: **dotnet format**\n' +
               '• Rust: **rustfmt**\n' +
               '• PHP: **PHP-CS-Fixer**'
      });
      
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error showing format help:', error);
      return interaction.reply(`An error occurred while showing format help: ${error.message}`);
    }
  }
}; 