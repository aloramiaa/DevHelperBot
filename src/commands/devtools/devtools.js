import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'devtools',
  description: 'List available developer tools',
  aliases: ['tools', 'devhelp'],
  usage: '',
  args: false,
  guildOnly: false,
  cooldown: 5
};

export const execute = async (message, args = []) => {
  try {
    const prefix = message.client.prefix;
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('🛠️ Developer Tools')
      .setDescription('Here are the available developer tools:')
      .addFields(
        { 
          name: '🔡 Text Utilities',
          value: `\`${prefix}base64 encode|decode <text>\` - Encode/decode Base64 strings\n` +
                 `\`${prefix}url encode|decode <text>\` - Encode/decode URL strings`
        },
        { 
          name: '📄 Data Formatting',
          value: `\`${prefix}json format|minify <json>\` - Format/minify JSON strings\n` + 
                 `\`${prefix}html extract <html>\` - Extract text from HTML`
        },
        { 
          name: '🔐 Security Tools',
          value: `\`${prefix}jwt <token>\` - Decode JWT tokens\n` +
                 `\`${prefix}hash sha256 <text>\` - Generate SHA-256 hash`
        },
        { 
          name: '🧮 Conversion Tools',
          value: `\`${prefix}hex2dec <hex>\` - Convert hex to decimal\n` +
                 `\`${prefix}dec2hex <decimal>\` - Convert decimal to hex\n` +
                 `\`${prefix}text2bin <text>\` - Convert text to binary\n` +
                 `\`${prefix}bin2text <binary>\` - Convert binary to text`
        },
        {
          name: '🧩 Misc Tools',
          value: `\`${prefix}uuid\` - Generate a UUID v4\n` +
                 `\`${prefix}charcount <text>\` - Count characters in text`
        }
      )
      .setFooter({ 
        text: `Type ${prefix}help <command> for more information on a specific command`, 
        iconURL: message.client.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Send the embed
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error displaying DevTools help:', error);
    return message.reply(`An error occurred: ${error.message}`);
  }
};

// Create a slash command version
export const slash = {
  data: {
    name: 'devtools',
    description: 'List available developer tools'
  },
  async execute(interaction) {
    try {
      const prefix = interaction.client.prefix;
      
      // Create embed for the response
      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('🛠️ Developer Tools')
        .setDescription('Here are the available developer tools:')
        .addFields(
          { 
            name: '🔡 Text Utilities',
            value: `\`/base64 operation:encode text:your_text\` - Encode text to Base64\n` +
                   `\`/base64 operation:decode text:your_base64\` - Decode Base64 to text\n` +
                   `\`${prefix}url encode|decode <text>\` - Encode/decode URL strings`
          },
          { 
            name: '📄 Data Formatting',
            value: `\`/json operation:format json:your_json\` - Format JSON string\n` +
                   `\`/json operation:minify json:your_json\` - Minify JSON string\n` +
                   `\`${prefix}html extract <html>\` - Extract text from HTML`
          },
          { 
            name: '🔐 Security Tools',
            value: `\`/jwt token:your_token\` - Decode JWT token\n` +
                   `\`${prefix}hash sha256 <text>\` - Generate SHA-256 hash`
          },
          { 
            name: '🧮 Conversion Tools',
            value: `\`${prefix}hex2dec <hex>\` - Convert hex to decimal\n` +
                   `\`${prefix}dec2hex <decimal>\` - Convert decimal to hex\n` +
                   `\`${prefix}text2bin <text>\` - Convert text to binary\n` +
                   `\`${prefix}bin2text <binary>\` - Convert binary to text`
          },
          {
            name: '🧩 Misc Tools',
            value: `\`${prefix}uuid\` - Generate a UUID v4\n` +
                   `\`${prefix}charcount <text>\` - Count characters in text`
          }
        )
        .setFooter({ 
          text: `Both slash commands and text commands are available`, 
          iconURL: interaction.client.user.displayAvatarURL() 
        })
        .setTimestamp();
      
      // Send the embed
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error displaying DevTools help:', error);
      return interaction.reply(`An error occurred: ${error.message}`);
    }
  }
}; 