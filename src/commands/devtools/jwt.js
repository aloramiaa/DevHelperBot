import { EmbedBuilder } from 'discord.js';

export const data = {
  name: 'jwt',
  description: 'Decode JWT tokens',
  aliases: ['jwtdecode', 'decodejwt'],
  usage: '<token>',
  args: true,
  guildOnly: false,
  cooldown: 3
};

export const execute = async (message, args) => {
  // Check if we have a token
  if (args.length < 1) {
    return message.reply(
      `You need to provide a JWT token.\nUsage: \`${message.client.prefix}${data.name} ${data.usage}\`\n` +
      `Example: \`${message.client.prefix}${data.name} eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\``
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

// Create a slash command version
export const slash = {
  data: {
    name: 'jwt',
    description: 'Decode JWT tokens',
    options: [
      {
        name: 'token',
        description: 'JWT token to decode',
        type: 3, // STRING type
        required: true
      }
    ]
  },
  async execute(interaction) {
    try {
      const token = interaction.options.getString('token');
      
      // Get the DevTools service
      const devToolsService = interaction.client.devToolsService;
      
      if (!devToolsService) {
        return interaction.reply('DevTools service is not available.');
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
      return interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return interaction.reply(`An error occurred: ${error.message}`);
    }
  }
}; 