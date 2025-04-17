import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'snippet',
  description: 'Share code snippets with syntax highlighting',
  aliases: ['code', 'share'],
  usage: '<language> <code>',
  args: true,
  guildOnly: false
};

// List of supported languages for syntax highlighting
const supportedLanguages = [
  'js', 'javascript', 'ts', 'typescript', 'java', 'python', 'py', 'cpp', 'c++', 'c',
  'csharp', 'cs', 'c#', 'php', 'html', 'css', 'ruby', 'rb', 'go', 'rust', 'rs',
  'kotlin', 'swift', 'shell', 'bash', 'sh', 'json', 'yaml', 'yml', 'xml', 'sql'
];

// Language aliases mapping
const languageAliases = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'rb': 'ruby',
  'cpp': 'cpp',
  'c++': 'cpp',
  'cs': 'csharp',
  'c#': 'csharp',
  'sh': 'bash',
  'yml': 'yaml',
  'rs': 'rust'
};

export const execute = async (message, args = []) => {
  if (!args || args.length < 2) {
    return message.reply(
      `You need to provide a language and code to share.\nUsage: \`${message.client.prefix}snippet <language> <code>\`\n` +
      `Example: \`${message.client.prefix}snippet js function hello() { return "world"; }\``
    );
  }

  const language = args[0].toLowerCase();
  let code = args.slice(1).join(' ');
  
  // Check if code is wrapped in backticks and remove them if needed
  if (code.startsWith('```') && code.endsWith('```')) {
    code = code.substring(3, code.length - 3).trim();
    
    // Handle the case where the language might be specified after the first backticks
    const firstLineBreak = code.indexOf('\n');
    if (firstLineBreak > 0) {
      code = code.substring(firstLineBreak + 1);
    }
  } else if (code.startsWith('`') && code.endsWith('`')) {
    code = code.substring(1, code.length - 1).trim();
  }
  
  // Check if language is supported
  if (!supportedLanguages.includes(language)) {
    return message.reply(
      `Unsupported language. Supported languages: ${supportedLanguages.join(', ')}`
    );
  }
  
  // Get normalized language for display
  const displayLanguage = languageAliases[language] || language;
  
  try {
    // For very long code snippets, we might need to split or truncate
    if (code.length > 4000) {
      code = code.substring(0, 4000) + '\n// ... code truncated due to length';
    }
    
    // Format the code with triple backticks for syntax highlighting
    const formattedCode = `\`\`\`${displayLanguage}\n${code}\n\`\`\``;
    
    // Create an embed for nicer display
    const embed = new EmbedBuilder()
      .setTitle(`${displayLanguage.charAt(0).toUpperCase() + displayLanguage.slice(1)} Code Snippet`)
      .setColor('#0099ff')
      .setDescription(formattedCode)
      .setFooter({ text: `Shared by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    return message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Code snippet error:', error);
    return message.reply('An error occurred while creating your code snippet. Please try again.');
  }
}; 