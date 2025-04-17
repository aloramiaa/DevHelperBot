import { AttachmentBuilder } from 'discord.js';
import MarkdownService from '../../services/MarkdownService.js';

export const data = {
  name: 'markdown',
  description: 'Render markdown as a beautiful HTML preview image',
  aliases: ['md', 'mdpreview'],
  usage: '<markdown text> or reply to a message containing markdown',
  args: false,
  guildOnly: false
};

// Initialize markdown service
let markdownService = null;
let markdownServiceFailed = false;

export const legacyExecute = async (message, args = []) => {
  // Initialize service if not already initialized
  if (!markdownService && !markdownServiceFailed) {
    try {
      markdownService = new MarkdownService();
      await markdownService.initialize();
      
      // Clean up old screenshots periodically
      setInterval(() => {
        markdownService.cleanupOldScreenshots();
      }, 3600000); // Clean up every hour
    } catch (error) {
      console.error('Failed to initialize Markdown service:', error);
      markdownServiceFailed = true;
      return message.reply('Sorry, the markdown rendering service is unavailable. This feature requires additional system dependencies to run.');
    }
  }
  
  // If markdown service previously failed to initialize, show a message
  if (markdownServiceFailed) {
    return message.reply('Sorry, the markdown rendering service is unavailable. This feature requires additional system dependencies to run.');
  }
  
  try {
    // Get markdown content from args or referenced message
    let markdownContent = '';
    
    // If message is a reply, check the referenced message for content
    if (message.reference && message.reference.messageId) {
      try {
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (referencedMessage.content) {
          markdownContent = referencedMessage.content;
        }
      } catch (error) {
        console.error('Error fetching referenced message:', error);
      }
    }
    
    // If no markdown content from reference, use the command arguments
    if (!markdownContent && args && args.length > 0) {
      markdownContent = args.join(' ');
    }
    
    // If still no content, show usage instructions
    if (!markdownContent) {
      return message.reply(
        'Please provide markdown text to render, or reply to a message containing markdown.\n' +
        'Example: `!markdown # Hello World\n\nThis is a **markdown** preview.`'
      );
    }
    
    // Send loading message
    const loadingMsg = await message.channel.send('🖌️ Rendering markdown preview...');
    
    // Generate screenshot
    const screenshotPath = await markdownService.generateScreenshot(markdownContent, {
      width: 800,
      format: 'png'
    });
    
    // Create attachment
    const attachment = new AttachmentBuilder(screenshotPath, { name: 'markdown-preview.png' });
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send the rendered markdown image
    return message.reply({ 
      content: '📄 Here\'s your rendered markdown:',
      files: [attachment]
    });
    
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return message.reply('An error occurred while rendering the markdown. Please try again with valid markdown content.');
  }
};

// For backward compatibility
export const execute = legacyExecute; 