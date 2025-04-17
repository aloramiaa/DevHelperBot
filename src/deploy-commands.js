import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from './config/config.js';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Convert plain data object to SlashCommandBuilder
function convertToSlashCommand(data) {
  if (!data || typeof data !== 'object') return null;

  const builder = new SlashCommandBuilder()
    .setName(data.name)
    .setDescription(data.description || 'No description provided');

  // Add any custom handling for options here if needed
  return builder;
}

// Load commands
async function loadCommands() {
  try {
    const commandsPath = join(__dirname, 'commands');
    const commandFolders = await readdir(commandsPath);

    for (const folder of commandFolders) {
      const folderPath = join(commandsPath, folder);
      const commandFiles = (await readdir(folderPath)).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const filePath = join(folderPath, file);
        const command = await import(filePath);
        
        if ('data' in command) {
          try {
            if (command.data instanceof SlashCommandBuilder) {
              commands.push(command.data.toJSON());
            } else {
              // Try to convert plain object to SlashCommandBuilder
              const slashCommand = convertToSlashCommand(command.data);
              if (slashCommand) {
                commands.push(slashCommand.toJSON());
              }
            }
          } catch (error) {
            console.warn(`Warning: Could not convert command ${file} to slash command:`, error.message);
          }
        }
      }
    }

    console.log('Successfully loaded commands:', commands.map(cmd => cmd.name).join(', '));
  } catch (error) {
    console.error('Error loading commands:', error);
  }
}

// Deploy commands
async function deployCommands() {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const rest = new REST().setToken(config.token);

    // Register commands
    const data = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

// Run deployment
async function main() {
  await loadCommands();
  await deployCommands();
}

main();