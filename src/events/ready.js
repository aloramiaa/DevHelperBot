export const name = 'ready';
export const once = true;

export const execute = (client) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  
  // Set bot activity
  client.user.setActivity('!help | Developer Tools', { type: 'WATCHING' });
  
  console.log(`Serving ${client.guilds.cache.size} servers`);
  console.log(`Loaded ${client.commands.size} commands`);
}; 