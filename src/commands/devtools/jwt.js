import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('jwt')
  .setDescription('Decode JWT tokens')
  .addStringOption(option =>
    option.setName('token')
      .setDescription('JWT token to decode')
      .setRequired(true)
  );

// Legacy data for text commands
export const legacyData = {
  name: 'jwt',
  description: 'Decode JWT tokens',
  aliases: ['jwtdecode', 'decodejwt'],
  usage: '<token>',
  args: true,
  guildOnly: false,
  cooldown: 3
};

// Slash command handler
export const execute = async (interaction) => {
  await interaction.deferReply();
  
  try {
    const token = interaction.options.getString('token');
    
    // Validate inputs
    if (!token) {
      return interaction.editReply('A JWT token is required.');
    }
    
    // Get the DevTools service
    const devToolsService = interaction.client.devToolsService;
    
    if (!devToolsService) {
      return interaction.editReply('DevTools service is not available.');
    }

    // Decode the JWT token
    const decoded = devToolsService.decodeJWT(token);
    
    // Format the output
    const headerJson = JSON.stringify(decoded.header, null, 2);
    const payloadJson = JSON.stringify(decoded.payload, null, 2);
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor(decoded.isExpired ? '#e74c3c' : '#3498db')
      .setTitle('🔑 JWT Decode')
      .setDescription(decoded.isExpired ? '⚠️ This token is expired!' : '')
      .addFields(
        { name: 'Header', value: `\`\`\`json\n${headerJson}\n\`\`\`` },
        { name: 'Payload', value: `\`\`\`json\n${payloadJson}\n\`\`\`` }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Add expiration info if available
    if (decoded.payload.exp) {
      const expDate = new Date(decoded.payload.exp * 1000);
      embed.addFields({ 
        name: 'Expiration', 
        value: `${expDate.toLocaleString()} (${decoded.isExpired ? 'Expired' : 'Valid'})` 
      });
    }
    
    // Add issued at info if available
    if (decoded.payload.iat) {
      const iatDate = new Date(decoded.payload.iat * 1000);
      embed.addFields({ name: 'Issued At', value: iatDate.toLocaleString() });
    }
    
    // Add not before info if available
    if (decoded.payload.nbf) {
      const nbfDate = new Date(decoded.payload.nbf * 1000);
      embed.addFields({ name: 'Not Before', value: nbfDate.toLocaleString() });
    }
    
    // Send the result
    return interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return interaction.editReply(`An error occurred: ${error.message}`);
  }
};

// Legacy text command handler
export const legacyExecute = async (message, args = []) => {
  // Check if we have a token
  if (!args || args.length < 1) {
    return message.reply(
      `You need to provide a JWT token.\nUsage: \`${message.client.prefix}${legacyData.name} ${legacyData.usage}\`\n` +
      `Example: \`${message.client.prefix}${legacyData.name} eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\``
    );
  }

  // Get the token
  const token = args[0];
  
  try {
    // Get the DevTools service
    const devToolsService = message.client.devToolsService;
    
    if (!devToolsService) {
      return message.reply('DevTools service is not available.');
    }

    // Decode the JWT token
    const decoded = devToolsService.decodeJWT(token);
    
    // Format the output
    const headerJson = JSON.stringify(decoded.header, null, 2);
    const payloadJson = JSON.stringify(decoded.payload, null, 2);
    
    // Create embed for the response
    const embed = new EmbedBuilder()
      .setColor(decoded.isExpired ? '#e74c3c' : '#3498db')
      .setTitle('🔑 JWT Decode')
      .setDescription(decoded.isExpired ? '⚠️ This token is expired!' : '')
      .addFields(
        { name: 'Header', value: `\`\`\`json\n${headerJson}\n\`\`\`` },
        { name: 'Payload', value: `\`\`\`json\n${payloadJson}\n\`\`\`` }
      )
      .setFooter({ 
        text: `Requested by ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();
    
    // Add expiration info if available
    if (decoded.payload.exp) {
      const expDate = new Date(decoded.payload.exp * 1000);
      embed.addFields({ 
        name: 'Expiration', 
        value: `${expDate.toLocaleString()} (${decoded.isExpired ? 'Expired' : 'Valid'})` 
      });
    }
    
    // Add issued at info if available
    if (decoded.payload.iat) {
      const iatDate = new Date(decoded.payload.iat * 1000);
      embed.addFields({ name: 'Issued At', value: iatDate.toLocaleString() });
    }
    
    // Add not before info if available
    if (decoded.payload.nbf) {
      const nbfDate = new Date(decoded.payload.nbf * 1000);
      embed.addFields({ name: 'Not Before', value: nbfDate.toLocaleString() });
    }
    
    // Send the result
    return message.reply({ embeds: [embed] });
    
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return message.reply(`An error occurred: ${error.message}`);
  }
}; 