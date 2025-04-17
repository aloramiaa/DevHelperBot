import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const data = new SlashCommandBuilder()
  .setName('doc')
  .setDescription('Search documentation for various technologies')
  .addStringOption(option => 
    option.setName('technology')
      .setDescription('The technology to search documentation for')
      .setRequired(true)
      .addChoices(
        { name: 'JavaScript', value: 'javascript' },
        { name: 'HTML', value: 'html' },
        { name: 'CSS', value: 'css' },
        { name: 'React', value: 'react' },
        { name: 'Node.js', value: 'node' },
        { name: 'Python', value: 'python' }
      )
  )
  .addStringOption(option => 
    option.setName('query')
      .setDescription('The search query')
      .setRequired(true)
  );

// Command metadata for legacy text commands
export const legacyData = {
  name: 'doc',
  description: 'Search documentation for various technologies',
  aliases: ['docs', 'documentation'],
  usage: '<technology> <search query>',
  args: true,
  guildOnly: false
};

export const legacyExecute = async (message, args = []) => {
  if (!args || args.length < 2) {
    return message.reply(
      'Please provide both a technology and a search query. Example: `!doc js array map`'
    );
  }

  const technology = args[0].toLowerCase();
  const query = args.slice(1).join(' ');
  
  // Set loading status
  const loadingMsg = await message.channel.send('🔍 Searching documentation...');
  
  try {
    let result;
    
    switch (technology) {
      case 'js':
      case 'javascript':
        result = await searchMDN('javascript', query);
        break;
      case 'html':
        result = await searchMDN('html', query);
        break;
      case 'css':
        result = await searchMDN('css', query);
        break;
      case 'react':
        result = await searchReactDocs(query);
        break;
      case 'node':
      case 'nodejs':
        result = await searchNodeDocs(query);
        break;
      case 'python':
        result = await searchPythonDocs(query);
        break;
      default:
        await loadingMsg.delete();
        return message.reply(
          'Unsupported technology. Currently supported: `javascript/js`, `html`, `css`, `react`, `node/nodejs`, `python`'
        );
    }
    
    // Delete loading message
    await loadingMsg.delete();
    
    if (!result) {
      return message.reply(`No documentation found for "${query}" in ${technology}.`);
    }
    
    const embed = new EmbedBuilder()
      .setTitle(result.title)
      .setURL(result.url)
      .setDescription(result.description)
      .setColor('#0099ff')
      .setFooter({ text: `${technology.toUpperCase()} Documentation`, iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Documentation search error:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while searching for documentation. Please try again later.');
  }
};

// Search MDN Web Docs (JavaScript, HTML, CSS)
async function searchMDN(technology, query) {
  try {
    const searchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(technology + ' ' + query)}`;
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    
    // Get first search result
    const firstResult = $('.result-list-item').first();
    if (!firstResult.length) return null;
    
    const title = firstResult.find('.document-title').text().trim();
    const url = 'https://developer.mozilla.org' + firstResult.find('a').attr('href');
    
    // Fetch the actual page to get a description
    const pageResponse = await axios.get(url);
    const page$ = cheerio.load(pageResponse.data);
    
    // Get the first paragraph as description
    let description = page$('#content p').first().text().trim();
    if (description.length > 250) {
      description = description.substring(0, 247) + '...';
    }
    
    return { title, url, description };
  } catch (error) {
    console.error('MDN search error:', error);
    return null;
  }
}

// Search React Documentation
async function searchReactDocs(query) {
  try {
    // React docs now has a different structure, using algolia search
    // This is a simplified version
    const searchUrl = `https://react.dev/search?q=${encodeURIComponent(query)}`;
    
    // Redirect to general docs page, as direct search is challenging to scrape
    return {
      title: `React Documentation: ${query}`,
      url: searchUrl,
      description: 'React is a JavaScript library for building user interfaces. Learn more about React and explore documentation on the official website.'
    };
  } catch (error) {
    console.error('React docs search error:', error);
    return null;
  }
}

// Search Node.js Documentation
async function searchNodeDocs(query) {
  try {
    const searchUrl = `https://nodejs.org/api/${encodeURIComponent(query.toLowerCase())}.html`;
    
    return {
      title: `Node.js Documentation: ${query}`,
      url: searchUrl,
      description: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine. The link will take you to the relevant API documentation if it exists.'
    };
  } catch (error) {
    console.error('Node.js docs search error:', error);
    return null;
  }
}

// Search Python Documentation
async function searchPythonDocs(query) {
  try {
    const searchUrl = `https://docs.python.org/3/search.html?q=${encodeURIComponent(query)}`;
    
    return {
      title: `Python Documentation: ${query}`,
      url: searchUrl,
      description: 'Python is a programming language that lets you work quickly and integrate systems more effectively. Follow the link to view search results in the official Python documentation.'
    };
  } catch (error) {
    console.error('Python docs search error:', error);
    return null;
  }
}

// Add the execute function for slash commands
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const technology = interaction.options.getString('technology');
    const query = interaction.options.getString('query');
    
    let result;
    
    switch (technology) {
      case 'javascript':
      case 'js':
        result = await searchMDN('javascript', query);
        break;
      case 'html':
        result = await searchMDN('html', query);
        break;
      case 'css':
        result = await searchMDN('css', query);
        break;
      case 'react':
        result = await searchReactDocs(query);
        break;
      case 'node':
      case 'nodejs':
        result = await searchNodeDocs(query);
        break;
      case 'python':
        result = await searchPythonDocs(query);
        break;
      default:
        return interaction.editReply(
          'Unsupported technology. Currently supported: `javascript/js`, `html`, `css`, `react`, `node/nodejs`, `python`'
        );
    }
    
    if (!result) {
      return interaction.editReply(`No documentation found for "${query}" in ${technology}.`);
    }
    
    const embed = new EmbedBuilder()
      .setTitle(result.title)
      .setURL(result.url)
      .setDescription(result.description)
      .setColor('#0099ff')
      .setFooter({ text: `${technology.toUpperCase()} Documentation`, iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Documentation search error:', error);
    return interaction.editReply('An error occurred while searching for documentation. Please try again later.');
  }
};