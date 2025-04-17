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
      if (command.legacyExecute) {
        await command.legacyExecute(message, args);
      } else if (command.execute) {
        // Create a simplified interaction-like object for commands without a legacyExecute function
        const mockInteraction = {
          client: message.client,
          guild: message.guild,
          channel: message.channel,
          user: message.author,
          member: message.member,
          options: {
            getString: () => null,
            getInteger: () => null,
            getBoolean: () => null,
            getUser: () => null,
            getChannel: () => null,
            getRole: () => null,
            getMentionable: () => null,
            getNumber: () => null,
            getFocused: () => ''
          },
          reply: async (options) => {
            if (typeof options === 'string') {
              return message.reply(options);
            } else {
              return message.reply(options);
            }
          },
          deferReply: async () => Promise.resolve(message.channel.sendTyping()),
          editReply: async (options) => {
            if (typeof options === 'string') {
              return message.reply(options);
            } else {
              return message.reply(options);
            }
          },
          followUp: async (options) => {
            if (typeof options === 'string') {
              return message.reply(options);
            } else {
              return message.reply(options);
            }
          }
        };
        
        try {
          await command.execute(mockInteraction);
        } catch (error) {
          // If we get deferReply error, show a helpful error message
          if (error.message && error.message.includes('deferReply is not a function')) {
            console.error(`Command ${command.data.name} doesn't have a legacyExecute function and isn't compatible with text commands.`);
            message.reply(`Sorry, the command \`${command.data.name}\` only works with slash commands. Please use it as a slash command instead.`);
          } else {
            throw error; // Re-throw other errors
          }
        }
      } else {
        console.error(`Command ${command.data.name} is missing both execute and legacyExecute methods`);
        message.reply('Sorry, this command is not properly implemented.');
      }
    } catch (error) {
      console.error(`Error executing ${command.data.name}:`, error);
      message.reply('There was an error trying to execute that command!');
    }
  } catch (error) {
    console.error('Error in messageCreate event:', error);
  }
}; 