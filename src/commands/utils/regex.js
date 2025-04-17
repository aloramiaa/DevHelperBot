import { EmbedBuilder } from 'discord.js';
import RegexService from '../../services/RegexService.js';

export const data = {
  name: 'regex',
  description: 'Test or explain regular expressions',
  aliases: ['re', 'regexp'],
  usage: 'test <pattern> <test string> [flags] | explain <pattern>',
  args: true,
  guildOnly: false
};

// Initialize regex service
const regexService = new RegexService();

export const execute = async (message, args = []) => {
  if (!args || args.length < 2) {
    return message.reply(
      'Not enough arguments. Please use one of these formats:\n' +
      '`!regex test <pattern> <test string> [flags]` - Test a regex pattern against a string\n' +
      '`!regex explain <pattern>` - Get an explanation of a regex pattern\n\n' +
      'Example: `!regex test "\\d+" "abc123def" g` - Find all numbers in the string'
    );
  }
  
  const subCommand = args[0].toLowerCase();
  
  if (subCommand === 'test') {
    await handleTestCommand(message, args.slice(1));
  } else if (subCommand === 'explain') {
    await handleExplainCommand(message, args.slice(1));
  } else {
    return message.reply(
      'Invalid subcommand. Use `test` or `explain`.\n' +
      'Example: `!regex test "\\d+" "abc123def"` or `!regex explain "\\d+"`'
    );
  }
};

/**
 * Handle the regex test command
 * @param {Object} message - Discord message object
 * @param {Array} args - Command arguments
 */
async function handleTestCommand(message, args = []) {
  // We need at least 2 args: pattern and test string
  if (!args || args.length < 2) {
    return message.reply(
      'Not enough arguments for the test command. Format: `!regex test <pattern> <test string> [flags]`\n' +
      'Example: `!regex test "\\d+" "abc123def" g`'
    );
  }
  
  // Get pattern, test string, and optional flags
  const pattern = parseArgument(args[0]);
  const testString = parseArgument(args[1]);
  const flags = args.length > 2 ? args[2] : '';
  
  // Test the regex
  const result = regexService.testRegex(pattern, testString, flags);
  
  if (!result.valid) {
    return message.reply(`❌ Error: ${result.error}`);
  }
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('Regex Test Results')
    .setColor(result.isMatch ? '#4CAF50' : '#F44336')
    .addFields(
      { name: 'Pattern', value: `\`${result.pattern}\`` },
      { name: 'Test String', value: `\`${testString}\`` },
      { name: 'Flags', value: result.flags || 'None', inline: true },
      { name: 'Match?', value: result.isMatch ? '✅ Yes' : '❌ No', inline: true },
      { name: 'Match Count', value: result.matchCount.toString(), inline: true }
    );
  
  // Add visual representation of matches
  if (result.visualMatches) {
    embed.addFields({ name: 'Matches', value: `\`${result.visualMatches}\`` });
  }
  
  // Add detailed match information if available
  if (result.matches && result.matches.length > 0) {
    const matchDetails = result.matches.map((match, i) => {
      let matchText = `Match ${i + 1}: \`${match.match}\` at index ${match.index}`;
      
      if (match.groups && match.groups.length > 0) {
        matchText += `\nGroups: ${match.groups.map((g, j) => `Group ${j + 1}: \`${g || 'empty'}\``).join(', ')}`;
      }
      
      return matchText;
    }).join('\n\n');
    
    // Add match details if they don't exceed Discord's limit
    if (matchDetails.length <= 1024) {
      embed.addFields({ name: 'Match Details', value: matchDetails });
    } else {
      embed.addFields({ name: 'Match Details', value: 'Too many matches to display details' });
    }
  }
  
  // Add explanation for common patterns
  try {
    const explanation = regexService.explainRegex(pattern);
    if (explanation.valid && explanation.explanation) {
      embed.setFooter({ text: 'Use !regex explain <pattern> for a detailed explanation' });
    }
  } catch (error) {
    // Ignore errors in explanation
  }
  
  return message.reply({ embeds: [embed] });
}

/**
 * Handle the regex explain command
 * @param {Object} message - Discord message object
 * @param {Array} args - Command arguments
 */
async function handleExplainCommand(message, args = []) {
  // We need at least 1 arg: pattern
  if (!args || args.length < 1) {
    return message.reply(
      'Please provide a regex pattern to explain. Format: `!regex explain <pattern>`\n' +
      'Example: `!regex explain "\\d+"`'
    );
  }
  
  // Get pattern
  const pattern = parseArgument(args[0]);
  
  // Get explanation
  const result = regexService.explainRegex(pattern);
  
  if (!result.valid) {
    return message.reply(`❌ Error: ${result.error}`);
  }
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('Regex Explanation')
    .setColor('#3498DB')
    .addFields(
      { name: 'Pattern', value: `\`${result.pattern}\`` },
      { name: 'Explanation', value: result.explanation }
    );
  
  // Add component breakdown if available and not a common pattern
  if (!result.isCommonPattern && result.components && result.components.length > 0) {
    const componentDetails = result.components
      .filter((c, i, arr) => arr.findIndex(x => x.component === c.component) === i) // Remove duplicates
      .map(c => `**${c.component}**: ${c.explanation}`)
      .join('\n\n');
    
    // Add component details if they don't exceed Discord's limit
    if (componentDetails.length <= 1024) {
      embed.addFields({ name: 'Component Breakdown', value: componentDetails });
    }
  }
  
  // Add examples section
  embed.addFields({
    name: 'Try it out',
    value: `Use \`!regex test "${pattern}" "your test string" [flags]\` to test this pattern`
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Parse a command argument, handling quoted strings
 * @param {string} arg - The argument to parse
 * @returns {string} - The parsed argument
 */
function parseArgument(arg) {
  // If the argument is quoted, remove the quotes
  if ((arg.startsWith('"') && arg.endsWith('"')) || 
      (arg.startsWith("'") && arg.endsWith("'"))) {
    return arg.substring(1, arg.length - 1);
  }
  return arg;
} 