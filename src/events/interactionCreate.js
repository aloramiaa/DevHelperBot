import { Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;

export const execute = async (interaction) => {
  try {
    // Handle command interactions
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        
        // If the reply was deferred but not sent yet, edit the reply
        const replyMethod = interaction.deferred ? 'editReply' : 'reply';
        
        const replyOptions = {
          content: 'There was an error while executing this command!',
          ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply(replyOptions);
        } else {
          await interaction.reply(replyOptions);
        }
      }
    }
    
    // Handle autocomplete interactions
    else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      
      if (!command || !command.autocomplete) {
        console.error(`No autocomplete for ${interaction.commandName} was found.`);
        return;
      }
      
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(`Error with autocomplete for ${interaction.commandName}:`, error);
      }
    }
    
    // Handle button interactions
    else if (interaction.isButton()) {
      // Extract the command name and optional parameters from the custom ID
      // Format: commandName:param1:param2:...
      const [commandName, ...params] = interaction.customId.split(':');
      
      const command = interaction.client.commands.get(commandName);
      
      if (!command || !command.handleButton) {
        console.error(`No button handler for ${commandName} was found.`);
        return;
      }
      
      try {
        await command.handleButton(interaction, params);
      } catch (error) {
        console.error(`Error handling button for ${commandName}:`, error);
      }
    }
    
    // Handle select menu interactions
    else if (interaction.isStringSelectMenu()) {
      // Extract the command name from the custom ID
      // Format: commandName:param1:param2:...
      const [commandName, ...params] = interaction.customId.split(':');
      
      const command = interaction.client.commands.get(commandName);
      
      if (!command || !command.handleSelectMenu) {
        console.error(`No select menu handler for ${commandName} was found.`);
        return;
      }
      
      try {
        await command.handleSelectMenu(interaction, params);
      } catch (error) {
        console.error(`Error handling select menu for ${commandName}:`, error);
      }
    }
    
    // Handle modal submit interactions
    else if (interaction.isModalSubmit()) {
      // Extract the command name from the custom ID
      // Format: commandName:param1:param2:...
      const [commandName, ...params] = interaction.customId.split(':');
      
      const command = interaction.client.commands.get(commandName);
      
      if (!command || !command.handleModalSubmit) {
        console.error(`No modal submit handler for ${commandName} was found.`);
        return;
      }
      
      try {
        await command.handleModalSubmit(interaction, params);
      } catch (error) {
        console.error(`Error handling modal submit for ${commandName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in interactionCreate event:', error);
  }
}; 