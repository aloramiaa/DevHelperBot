import { config } from '../config/config.js';

export const name = 'messageCreate';
export const once = false;

export const execute = async (message) => {
  try {
    // Ignore messages from bots
    if (message.author.bot) return;
    
    // Check if message starts with prefix
    if (!message.content.startsWith(config.prefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Find command by name or alias
    const command = message.client.commands.get(commandName) || 
                    message.client.commands.get(message.client.aliases.get(commandName));
    
    // Return if no command found
    if (!command) return;
    
    // Check if command can be executed in DMs
    if (command.guildOnly && message.channel.type === 'dm') {
      return message.reply('I can\'t execute that command inside DMs!');
    }
    
    // Check if args are required
    if (command.args && !args.length) {
      let reply = 'You didn\'t provide any arguments!';
      
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${config.prefix}${command.data.name} ${command.usage}\``;
      }
      
      return message.reply(reply);
    }
    
    // Execute command
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`Error executing ${command.data.name}:`, error);
      message.reply('There was an error trying to execute that command!');
    }
  } catch (error) {
    console.error('Error in messageCreate event:', error);
  }
}; 