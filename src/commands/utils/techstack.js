import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { env } from 'node:process';

/**
 * Command to analyze the tech stack of a GitHub repository
 */
export const data = new SlashCommandBuilder()
  .setName('techstack')
  .setDescription('Analyze the tech stack of a GitHub repository')
  .addStringOption(option =>
    option
      .setName('repository')
      .setDescription('GitHub repository URL or owner/repo format')
      .setRequired(true)
  );

export const execute = async (interaction, client) => {
  try {
    // Defer reply as this might take some time
    await interaction.deferReply();

    // Get repository URL from options
    const repoUrl = interaction.options.getString('repository');
    
    if (!repoUrl) {
      return interaction.editReply('Please provide a valid GitHub repository URL or owner/repo format.');
    }

    // Get tech stack service
    const techStackService = client.services.get('techStackService');
    
    if (!techStackService) {
      return interaction.editReply('Tech Stack service is not available.');
    }

    // Show loading message
    await interaction.editReply('Analyzing repository tech stack, please wait...');

    // Analyze tech stack
    const result = await techStackService.analyzeTechStack(repoUrl);

    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setTitle(`Tech Stack Analysis: ${result.repository.name}`)
      .setURL(result.repository.url)
      .setDescription(result.repository.description || 'No description available')
      .setThumbnail(result.repository.owner.avatarUrl)
      .addFields(
        { name: 'Repository Stats', value: `⭐ ${result.repository.stars} stars\n🍴 ${result.repository.forks} forks` },
      );
    
    // Add languages field
    const languagesList = Object.entries(result.languages)
      .sort(([, a], [, b]) => b.percentage - a.percentage)
      .slice(0, 8)
      .map(([name, { percentage }]) => `${name}: ${percentage}%`)
      .join('\n');
    
    if (languagesList) {
      embed.addFields({ name: 'Top Languages', value: languagesList });
    }
    
    // Add frameworks field
    const frameworksList = Object.keys(result.frameworks)
      .map(name => formatTechName(name))
      .join(', ');
    
    if (frameworksList) {
      embed.addFields({ name: 'Frameworks', value: frameworksList });
    }
    
    // Add dev tools field
    const devToolsList = Object.keys(result.devTools)
      .map(name => formatTechName(name))
      .join(', ');
    
    if (devToolsList) {
      embed.addFields({ name: 'Development Tools', value: devToolsList || 'None detected' });
    }
    
    // Add notable dependencies fields
    const { database, stateManagement, ui, api } = result.dependencies;
    
    // Database
    const databaseList = Object.keys(database)
      .map(name => formatTechName(name))
      .join(', ');
    
    if (databaseList) {
      embed.addFields({ name: 'Database Technologies', value: databaseList });
    }
    
    // UI libraries
    const uiList = Object.keys(ui)
      .map(name => formatTechName(name))
      .join(', ');
    
    if (uiList) {
      embed.addFields({ name: 'UI Libraries', value: uiList });
    }
    
    // API technologies
    const apiList = Object.keys(api)
      .map(name => formatTechName(name))
      .join(', ');
    
    if (apiList) {
      embed.addFields({ name: 'API Technologies', value: apiList });
    }
    
    // State management
    const stateList = Object.keys(stateManagement)
      .map(name => formatTechName(name))
      .join(', ');
    
    if (stateList) {
      embed.addFields({ name: 'State Management', value: stateList });
    }
    
    // Set footer
    embed.setFooter({ 
      text: `Analyzed by DevHelpBot | ${new Date().toLocaleDateString()}`,
      iconURL: client.user.displayAvatarURL()
    });
    
    // Send the embed
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in techstack command:', error);
    
    // If already replied with the loading message, edit it
    try {
      await interaction.editReply(`Failed to analyze tech stack: ${error.message}`);
    } catch (e) {
      // If not replied yet (error during deferReply), send a new reply
      await interaction.reply({ 
        content: `Failed to analyze tech stack: ${error.message}`,
        ephemeral: true 
      });
    }
  }
};

/**
 * Format a tech name for display (camelCase to Title Case)
 * @param {string} name - Tech name in camelCase or with special characters
 * @returns {string} - Formatted name
 */
export const formatTechName = (name) => {
  // Handle special cases
  const specialCases = {
    'nextjs': 'Next.js',
    'nestjs': 'Nest.js',
    'nuxtjs': 'Nuxt.js',
    'nodejs': 'Node.js',
    'reactjs': 'React',
    'vuejs': 'Vue',
    'materialui': 'Material UI',
    'chakraui': 'Chakra UI',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'nextauth': 'NextAuth.js',
    'reactquery': 'React Query',
    'styledcomponents': 'Styled Components',
    'tailwind': 'Tailwind CSS',
    'reacthookform': 'React Hook Form',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'dateutils': 'Date Utils (moment/date-fns)',
    'sqlalchemy': 'SQLAlchemy',
  };
  
  // Check if it's a special case
  if (specialCases[name.toLowerCase()]) {
    return specialCases[name.toLowerCase()];
  }
  
  // Convert camelCase to Title Case
  return name
    // Insert a space before all uppercase letters
    .replace(/([A-Z])/g, ' $1')
    // Ensure first character is uppercase
    .replace(/^./, str => str.toUpperCase())
    // Trim leading space if any
    .trim();
};