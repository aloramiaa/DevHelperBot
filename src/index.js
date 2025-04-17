import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from './config/config.js';
import { connectDatabase } from './config/database.js';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import PomodoroChecker from './services/pomodoroChecker.js';
import NewsDigestService from './services/NewsDigestService.js';
import MarkdownService from './services/MarkdownService.js';
import TechStackService from './services/TechStackService.js';
import CodeFormatterService from './services/CodeFormatterService.js';
import DevToolsService from './services/DevToolsService.js';
import APIExplorerService from './services/APIExplorerService.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Initialize collections for commands
client.commands = new Collection();
client.aliases = new Collection();

// Make prefix available on client for command usage
client.prefix = config.prefix;

// Database connection
connectDatabase();

// Initialize services
let pomodoroChecker;
let newsDigestService;
let markdownService;
let techStackService;
let codeFormatterService;
let devToolsService;
let apiExplorerService;

// Load commands
const loadCommands = async () => {
  const commandsPath = join(__dirname, 'commands');
  const commandFolders = await readdir(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = (await readdir(folderPath)).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const command = await import(filePath);
      
      // Set a new item in the Collection with the command name as the key and the exported module as the value
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
        
        // Set aliases if they exist
        if (command.data.aliases && Array.isArray(command.data.aliases)) {
          command.data.aliases.forEach(alias => {
            client.aliases.set(alias, command.data.name);
          });
        }
      } else {
        console.warn(`Command at ${filePath} is missing required "data" or "execute" property.`);
      }
    }
  }
};

// Load events
const loadEvents = async () => {
  const eventsPath = join(__dirname, 'events');
  const eventFiles = (await readdir(eventsPath)).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    
    console.log(`Loaded event: ${event.name}`);
  }
};

// Initialize the bot
const init = async () => {
  try {
    // Load commands and events
    await loadCommands();
    await loadEvents();
    
    // Login to Discord with token
    await client.login(config.token);
    
    // Initialize services after login
    initializeServices();
  } catch (error) {
    console.error('Failed to initialize the bot:', error);
  }
};

// Initialize background services
const initializeServices = () => {
  pomodoroChecker = new PomodoroChecker(client);
  newsDigestService = new NewsDigestService();
  markdownService = new MarkdownService();
  techStackService = new TechStackService();
  codeFormatterService = new CodeFormatterService();
  devToolsService = new DevToolsService();
  apiExplorerService = new APIExplorerService();
  
  // Make services available on client
  client.pomodoroChecker = pomodoroChecker;
  client.newsDigestService = newsDigestService;
  client.markdownService = markdownService;
  client.techStackService = techStackService;
  client.codeFormatterService = codeFormatterService;
  client.devToolsService = devToolsService;
  client.apiExplorerService = apiExplorerService;
  
  console.log('Services initialized');
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down bot gracefully...');
  if (pomodoroChecker) {
    pomodoroChecker.stop();
  }
  if (newsDigestService) {
    newsDigestService.stop();
  }
  if (markdownService) {
    markdownService.shutdown()
      .then(() => console.log('Markdown service shut down'))
      .catch(error => console.error('Error shutting down Markdown service:', error));
  }
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down bot gracefully...');
  if (pomodoroChecker) {
    pomodoroChecker.stop();
  }
  if (newsDigestService) {
    newsDigestService.stop();
  }
  if (markdownService) {
    markdownService.shutdown()
      .then(() => console.log('Markdown service shut down'))
      .catch(error => console.error('Error shutting down Markdown service:', error));
  }
  client.destroy();
  process.exit(0);
});

// Start the bot
init();