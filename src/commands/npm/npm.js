import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

export const data = new SlashCommandBuilder()
  .setName('npm')
  .setDescription('Get information about NPM packages')
  .addStringOption(option => 
    option.setName('package')
      .setDescription('The name of the NPM package to look up')
      .setRequired(true)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'npm',
  description: 'Get information about NPM packages',
  aliases: ['package', 'pkg'],
  usage: '<package-name>',
  args: true,
  guildOnly: false
};

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const packageName = interaction.options.getString('package').toLowerCase();
  
  // Validate package name
  if (!packageName || packageName.trim() === '') {
    return interaction.editReply('Please provide a package name. Example: `/npm package:express`');
  }
  
  try {
    const packageInfo = await getPackageInfo(packageName);
    
    if (!packageInfo) {
      return interaction.editReply(`Package "${packageName}" not found in the NPM registry.`);
    }
    
    // Create a rich embed with package details
    const embed = new EmbedBuilder()
      .setTitle(`📦 ${packageInfo.name}`)
      .setURL(`https://www.npmjs.com/package/${packageInfo.name}`)
      .setColor('#CB3837') // NPM red
      .setDescription(truncateText(packageInfo.description || 'No description available', 200))
      .addFields(
        { name: 'Version', value: packageInfo.version || 'Unknown', inline: true },
        { name: 'License', value: packageInfo.license || 'Unknown', inline: true },
        { name: 'Last Updated', value: packageInfo.date ? formatDate(packageInfo.date) : 'Unknown', inline: true },
        { name: 'Author', value: formatAuthor(packageInfo.author), inline: true },
        { name: 'Weekly Downloads', value: formatNumber(packageInfo.downloads) || 'Unknown', inline: true },
        { name: 'Repository', value: packageInfo.repository ? `[GitHub](${packageInfo.repository})` : 'Not specified', inline: true }
      )
      .setFooter({ text: 'NPM Registry', iconURL: 'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png' })
      .setTimestamp();
    
    // Add keywords if available
    if (packageInfo.keywords && packageInfo.keywords.length) {
      embed.addFields({ 
        name: 'Keywords', 
        value: packageInfo.keywords.slice(0, 5).join(', ') + (packageInfo.keywords.length > 5 ? '...' : '')
      });
    }
    
    // Add dependencies if available
    if (packageInfo.dependencies && Object.keys(packageInfo.dependencies).length) {
      const deps = Object.keys(packageInfo.dependencies).slice(0, 10);
      embed.addFields({
        name: `Dependencies (${Object.keys(packageInfo.dependencies).length})`,
        value: deps.join(', ') + (Object.keys(packageInfo.dependencies).length > 10 ? '...' : '')
      });
    }
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('NPM package search error:', error);
    return interaction.editReply('An error occurred while fetching package information. Please try again later.');
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  if (!args || !args.length) {
    return message.reply('Please provide a package name. Example: `!npm express`');
  }

  const packageName = args[0].toLowerCase();
  
  // Set loading status
  const loadingMsg = await message.channel.send('🔍 Searching NPM registry...');
  
  try {
    const packageInfo = await getPackageInfo(packageName);
    
    // Delete loading message
    await loadingMsg.delete();
    
    if (!packageInfo) {
      return message.reply(`Package "${packageName}" not found in the NPM registry.`);
    }
    
    // Create a rich embed with package details
    const embed = new EmbedBuilder()
      .setTitle(`📦 ${packageInfo.name}`)
      .setURL(`https://www.npmjs.com/package/${packageInfo.name}`)
      .setColor('#CB3837') // NPM red
      .setDescription(truncateText(packageInfo.description || 'No description available', 200))
      .addFields(
        { name: 'Version', value: packageInfo.version || 'Unknown', inline: true },
        { name: 'License', value: packageInfo.license || 'Unknown', inline: true },
        { name: 'Last Updated', value: packageInfo.date ? formatDate(packageInfo.date) : 'Unknown', inline: true },
        { name: 'Author', value: formatAuthor(packageInfo.author), inline: true },
        { name: 'Weekly Downloads', value: formatNumber(packageInfo.downloads) || 'Unknown', inline: true },
        { name: 'Repository', value: packageInfo.repository ? `[GitHub](${packageInfo.repository})` : 'Not specified', inline: true }
      )
      .setFooter({ text: 'NPM Registry', iconURL: 'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png' })
      .setTimestamp();
    
    // Add keywords if available
    if (packageInfo.keywords && packageInfo.keywords.length) {
      embed.addFields({ 
        name: 'Keywords', 
        value: packageInfo.keywords.slice(0, 5).join(', ') + (packageInfo.keywords.length > 5 ? '...' : '')
      });
    }
    
    // Add dependencies if available
    if (packageInfo.dependencies && Object.keys(packageInfo.dependencies).length) {
      const deps = Object.keys(packageInfo.dependencies).slice(0, 10);
      embed.addFields({
        name: `Dependencies (${Object.keys(packageInfo.dependencies).length})`,
        value: deps.join(', ') + (Object.keys(packageInfo.dependencies).length > 10 ? '...' : '')
      });
    }
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('NPM package search error:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while fetching package information. Please try again later.');
  }
};

// Fetch package information from NPM registry
async function getPackageInfo(packageName) {
  try {
    // Fetch basic package info
    const packageResponse = await axios.get(`https://registry.npmjs.org/${packageName}`);
    const latestVersion = packageResponse.data['dist-tags'].latest;
    const packageData = packageResponse.data.versions[latestVersion];
    
    // Fetch download counts
    const downloadsResponse = await axios.get(`https://api.npmjs.org/downloads/point/last-week/${packageName}`);
    
    return {
      name: packageData.name,
      version: latestVersion,
      description: packageData.description,
      author: packageData.author,
      license: packageData.license,
      date: packageResponse.data.time[latestVersion],
      keywords: packageData.keywords,
      dependencies: packageData.dependencies,
      downloads: downloadsResponse.data.downloads,
      repository: packageData.repository ? formatRepository(packageData.repository) : null
    };
  } catch (error) {
    console.error('NPM API error:', error);
    
    // If the package is not found (404), return null
    if (error.response && error.response.status === 404) {
      return null;
    }
    
    throw error;
  }
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

// Format date to readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Format author object or string
function formatAuthor(author) {
  if (!author) return 'Unknown';
  if (typeof author === 'string') return author;
  return author.name || 'Unknown';
}

// Format repository URL
function formatRepository(repository) {
  if (typeof repository === 'string') {
    return repository.startsWith('http') ? repository : `https://github.com/${repository}`;
  }
  
  if (repository.url) {
    // Clean up git URLs
    let url = repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
    // Convert SSH URLs to HTTPS
    url = url.replace(/^git@github\.com:/, 'https://github.com/');
    return url;
  }
  
  return null;
}

// Format number with commas
function formatNumber(num) {
  if (!num && num !== 0) return null;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
} 