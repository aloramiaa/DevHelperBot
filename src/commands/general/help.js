import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { config } from '../../config/config.js';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows all available commands or info about a specific command')
  .addStringOption(option => 
    option.setName('command')
      .setDescription('Get detailed info about a specific command')
      .setRequired(false)
  );

export const execute = async (interaction) => {
  const { commands } = interaction.client;
  const prefix = config.prefix;
  
  // If no command specified, show all commands
  const commandName = interaction.options.getString('command');
  if (!commandName) {
    // Get all command categories (folders)
    const commandsPath = join(__dirname, '../');
    const categories = readdirSync(commandsPath);
    
    const embed = new EmbedBuilder()
      .setTitle('📚 DevHelper Bot Commands')
      .setDescription(`Use \`/help command:<command-name>\` for more info on a specific command.`)
      .setColor('#0099ff')
      .setFooter({ text: 'DevHelper Bot', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add fields for each category
    for (const category of categories) {
      // Skip hidden folders/files
      if (category.startsWith('.')) continue;
      
      const categoryPath = join(commandsPath, category);
      
      // Skip if not a directory
      try {
        if (!readdirSync(categoryPath).length) continue;
      } catch (e) {
        continue;
      }
      
      // Get all commands in this category
      const categoryCommands = [];
      const commandFiles = readdirSync(categoryPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        try {
          const commandPath = join(categoryPath, file);
          const command = await import(commandPath);
          
          if (command.data?.name) {
            // For slash commands, show as /command-name
            categoryCommands.push(`${command.data instanceof SlashCommandBuilder ? '/' : prefix}${command.data.name}`);
          }
        } catch (error) {
          console.error(`Error loading command from ${file}:`, error);
        }
      }
      
      if (categoryCommands.length) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        embed.addFields({
          name: `${getEmoji(category)} ${categoryName}`,
          value: categoryCommands.join(', ')
        });
      }
    }
    
    return interaction.reply({ embeds: [embed] });
  }
  
  // Show info about specific command
  const command = commands.get(commandName.toLowerCase()) 
    || commands.get(interaction.client.aliases?.get(commandName.toLowerCase()));
  
  if (!command) {
    return interaction.reply({ content: 'That\'s not a valid command!', ephemeral: true });
  }
  
  const embed = new EmbedBuilder()
    .setTitle(`Command: ${command.data instanceof SlashCommandBuilder ? '/' : prefix}${command.data.name}`)
    .setColor('#0099ff')
    .setFooter({ text: 'DevHelper Bot', iconURL: interaction.client.user.displayAvatarURL() });
  
  if (command.data.description) embed.setDescription(command.data.description);
  if (command.data.aliases) embed.addFields({ name: 'Aliases', value: command.data.aliases.map(a => `${prefix}${a}`).join(', ') });
  if (command.usage) embed.addFields({ name: 'Usage', value: `${prefix}${command.data.name} ${command.usage}` });
  
  return interaction.reply({ embeds: [embed] });
};

// Keep the legacy command handler for backward compatibility
export const legacyExecute = async (message, args) => {
  const { commands } = message.client;
  const prefix = config.prefix;
  
  // If no args, show all commands
  if (!args.length) {
    // Get all command categories (folders)
    const commandsPath = join(__dirname, '../');
    const categories = readdirSync(commandsPath);
    
    const embed = new EmbedBuilder()
      .setTitle('📚 DevHelper Bot Commands')
      .setDescription(`Use \`${prefix}help [command]\` for more info on a specific command.`)
      .setColor('#0099ff')
      .setFooter({ text: 'DevHelper Bot', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Add fields for each category
    for (const category of categories) {
      // Skip hidden folders/files
      if (category.startsWith('.')) continue;
      
      const categoryPath = join(commandsPath, category);
      
      // Skip if not a directory
      try {
        if (!readdirSync(categoryPath).length) continue;
      } catch (e) {
        continue;
      }
      
      // Get all commands in this category
      const categoryCommands = [];
      const commandFiles = readdirSync(categoryPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        try {
          const commandPath = join(categoryPath, file);
          const command = await import(commandPath);
          
          if (command.data?.name) {
            categoryCommands.push(`\`${prefix}${command.data.name}\``);
          }
        } catch (error) {
          console.error(`Error loading command from ${file}:`, error);
        }
      }
      
      if (categoryCommands.length) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        embed.addFields({
          name: `${getEmoji(category)} ${categoryName}`,
          value: categoryCommands.join(', ')
        });
      }
    }
    
    return message.reply({ embeds: [embed] });
  }
  
  // Show info about specific command
  const commandName = args[0].toLowerCase();
  const command = commands.get(commandName) 
    || commands.get(message.client.aliases.get(commandName));
  
  if (!command) {
    return message.reply('That\'s not a valid command!');
  }
  
  const embed = new EmbedBuilder()
    .setTitle(`Command: ${prefix}${command.data.name}`)
    .setColor('#0099ff')
    .setFooter({ text: 'DevHelper Bot', iconURL: message.client.user.displayAvatarURL() });
  
  if (command.data.description) embed.setDescription(command.data.description);
  if (command.data.aliases) embed.addFields({ name: 'Aliases', value: command.data.aliases.map(a => `\`${prefix}${a}\``).join(', ') });
  if (command.usage) embed.addFields({ name: 'Usage', value: `\`${prefix}${command.data.name} ${command.usage}\`` });
  
  return message.reply({ embeds: [embed] });
};

// Helper function to get emoji for category
function getEmoji(category) {
  const emojis = {
    api: '🌐',
    boilerplates: '📁',
    devnews: '📰',
    devto: '👩‍💻',
    devtools: '🔧',
    docs: '📚',
    general: '🎮',
    github: '🐙',
    npm: '📦',
    pomodoro: '⏱️',
    snippets: '📝',
    stackoverflow: '❓',
    todos: '✅',
    utils: '🛠️'
  };
  
  return emojis[category] || '📌';
}