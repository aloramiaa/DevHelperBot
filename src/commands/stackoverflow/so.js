import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { config } from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('so')
  .setDescription('Search Stack Overflow for answers')
  .addStringOption(option => 
    option.setName('query')
      .setDescription('Your Stack Overflow search query')
      .setRequired(true)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'so',
  description: 'Search Stack Overflow for answers',
  aliases: ['stackoverflow', 'stack'],
  usage: '<search query>',
  args: true,
  guildOnly: false
};

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  const query = interaction.options.getString('query');
  
  // Validate query
  if (!query || query.trim() === '') {
    return interaction.editReply('Please provide a search query. Example: `/so query:"TypeError undefined is not a function"`');
  }
  
  try {
    const searchResults = await searchStackOverflow(query);
    
    if (!searchResults || searchResults.length === 0) {
      return interaction.editReply(`No results found on Stack Overflow for "${query}".`);
    }
    
    // Get the top result
    const topResult = searchResults[0];
    
    // Fetch answers for the top result
    const answers = await getAnswers(topResult.question_id);
    
    if (!answers || answers.length === 0) {
      return interaction.editReply(`Found a question but no answers for "${query}" on Stack Overflow.`);
    }
    
    // Get the accepted answer or the highest scored answer
    const bestAnswer = answers.find(a => a.is_accepted) || answers.sort((a, b) => b.score - a.score)[0];
    
    // Create embed for the question and answer
    const embed = new EmbedBuilder()
      .setTitle(topResult.title)
      .setURL(topResult.link)
      .setColor('#F48024') // Stack Overflow orange
      .setDescription(`${truncateText(bestAnswer.body, 1000)}\n\n[View full answer on Stack Overflow](${topResult.link}#${bestAnswer.answer_id})`)
      .addFields(
        { name: 'Score', value: `👍 ${bestAnswer.score}`, inline: true },
        { name: 'Accepted', value: bestAnswer.is_accepted ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Asked by', value: topResult.owner.display_name, inline: true }
      )
      .setFooter({ text: 'Stack Overflow', iconURL: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico' })
      .setTimestamp(new Date(bestAnswer.creation_date * 1000));
    
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Stack Overflow search error:', error);
    return interaction.editReply('An error occurred while searching Stack Overflow. Please try again later.');
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  if (!args || !args.length) {
    return message.reply('Please provide a search query. Example: `!so "TypeError undefined is not a function"`');
  }

  const query = args.join(' ');
  
  // Set loading status
  const loadingMsg = await message.channel.send('🔍 Searching Stack Overflow...');
  
  try {
    const searchResults = await searchStackOverflow(query);
    
    // Delete loading message
    await loadingMsg.delete();
    
    if (!searchResults || searchResults.length === 0) {
      return message.reply(`No results found on Stack Overflow for "${query}".`);
    }
    
    // Get the top result
    const topResult = searchResults[0];
    
    // Fetch answers for the top result
    const answers = await getAnswers(topResult.question_id);
    
    if (!answers || answers.length === 0) {
      return message.reply(`Found a question but no answers for "${query}" on Stack Overflow.`);
    }
    
    // Get the accepted answer or the highest scored answer
    const bestAnswer = answers.find(a => a.is_accepted) || answers.sort((a, b) => b.score - a.score)[0];
    
    // Create embed for the question and answer
    const embed = new EmbedBuilder()
      .setTitle(topResult.title)
      .setURL(topResult.link)
      .setColor('#F48024') // Stack Overflow orange
      .setDescription(`${truncateText(bestAnswer.body, 1000)}\n\n[View full answer on Stack Overflow](${topResult.link}#${bestAnswer.answer_id})`)
      .addFields(
        { name: 'Score', value: `👍 ${bestAnswer.score}`, inline: true },
        { name: 'Accepted', value: bestAnswer.is_accepted ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Asked by', value: topResult.owner.display_name, inline: true }
      )
      .setFooter({ text: 'Stack Overflow', iconURL: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico' })
      .setTimestamp(new Date(bestAnswer.creation_date * 1000));
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Stack Overflow search error:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while searching Stack Overflow. Please try again later.');
  }
};

// Search Stack Overflow for questions
async function searchStackOverflow(query) {
  try {
    const response = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
      params: {
        order: 'desc',
        sort: 'relevance',
        site: 'stackoverflow',
        q: query,
        filter: 'withbody',
        key: config.stackoverflowKey || undefined // Use API key if available
      }
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Stack Overflow API error:', error);
    return null;
  }
}

// Get answers for a specific question
async function getAnswers(questionId) {
  try {
    const response = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}/answers`, {
      params: {
        order: 'desc',
        sort: 'votes',
        site: 'stackoverflow',
        filter: 'withbody',
        key: config.stackoverflowKey || undefined // Use API key if available
      }
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Stack Overflow API error:', error);
    return null;
  }
}

// Helper function to truncate and clean HTML text
function truncateText(html, maxLength) {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  
  // Truncate if needed
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }
  
  return text;
} 