import { EmbedBuilder } from 'discord.js';
import PomodoroSession from '../models/PomodoroSession.js';

// Check interval in ms (1 minute)
const CHECK_INTERVAL = 60 * 1000;

export default class PomodoroChecker {
  constructor(client) {
    this.client = client;
    this.isRunning = false;
    this.checkInterval = null;
  }
  
  // Start the checker
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkInterval = setInterval(() => this.checkSessions(), CHECK_INTERVAL);
    console.log('Pomodoro checker service started');
  }
  
  // Stop the checker
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.checkInterval);
    this.isRunning = false;
    console.log('Pomodoro checker service stopped');
  }
  
  // Check active sessions
  async checkSessions() {
    try {
      const now = new Date();
      
      // Find active sessions that have ended but not been notified
      const completedSessions = await PomodoroSession.find({
        status: { $in: ['focus', 'break'] },
        endTime: { $lte: now },
        notified: false
      });
      
      for (const session of completedSessions) {
        await this.notifySession(session);
      }
    } catch (error) {
      console.error('Error checking Pomodoro sessions:', error);
    }
  }
  
  // Notify user about completed session
  async notifySession(session) {
    try {
      // Get channel
      const channel = await this.client.channels.fetch(session.channelId).catch(() => null);
      if (!channel) {
        console.warn(`Channel ${session.channelId} not found for Pomodoro notification`);
        return;
      }
      
      // Get user
      const user = await this.client.users.fetch(session.userId).catch(() => null);
      if (!user) {
        console.warn(`User ${session.userId} not found for Pomodoro notification`);
        return;
      }
      
      let embed;
      let content;
      
      if (session.status === 'focus') {
        // Focus session completed
        content = `<@${session.userId}> Your ${session.duration} minute Pomodoro focus session is complete! Take a break with \`!pomodoro break\` or start a new session with \`!pomodoro start\`.`;
        
        embed = new EmbedBuilder()
          .setTitle('🍅 Pomodoro Focus Session Complete!')
          .setColor('#4CAF50') // Green
          .setDescription(`Your ${session.duration} minute focus session is complete. Time for a break!`)
          .addFields(
            { name: 'Status', value: '✅ Completed', inline: true },
            { name: 'Duration', value: `${session.duration} minutes`, inline: true },
            { name: 'Suggested Break', value: `${session.breakDuration} minutes`, inline: true }
          )
          .setFooter({ text: `Session for ${user.tag}`, iconURL: user.displayAvatarURL() })
          .setTimestamp();
      } else {
        // Break session completed
        content = `<@${session.userId}> Your ${session.breakDuration} minute break is complete! Start a new Pomodoro focus session with \`!pomodoro start\`.`;
        
        embed = new EmbedBuilder()
          .setTitle('☕ Pomodoro Break Complete!')
          .setColor('#FFC107') // Amber
          .setDescription(`Your ${session.breakDuration} minute break is complete. Ready for another focus session?`)
          .addFields(
            { name: 'Status', value: '✅ Completed', inline: true },
            { name: 'Break Duration', value: `${session.breakDuration} minutes`, inline: true },
            { name: 'Previous Focus', value: `${session.duration} minutes`, inline: true }
          )
          .setFooter({ text: `Session for ${user.tag}`, iconURL: user.displayAvatarURL() })
          .setTimestamp();
      }
      
      // Try to update the original message
      try {
        const pomodoroMessage = await channel.messages.fetch(session.messageId);
        await pomodoroMessage.edit({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to update original Pomodoro message:', error);
      }
      
      // Send notification
      await channel.send({ content, embeds: [embed] });
      
      // Mark as notified
      if (session.status === 'focus') {
        // For focus sessions, keep session active but mark as notified
        session.notified = true;
        await session.save();
      } else {
        // For break sessions, mark as completed
        session.status = 'completed';
        session.notified = true;
        await session.save();
      }
    } catch (error) {
      console.error('Error sending Pomodoro notification:', error);
    }
  }
} 