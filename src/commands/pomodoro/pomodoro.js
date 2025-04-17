import { EmbedBuilder } from 'discord.js';
import PomodoroSession from '../../models/PomodoroSession.js';

export const data = {
  name: 'pomodoro',
  description: 'Start a Pomodoro timer for focused work sessions',
  aliases: ['pomo', 'timer'],
  usage: 'start <minutes> [break minutes] | break | cancel | status',
  args: true,
  guildOnly: true
};

// Default durations
const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

export const execute = async (message, args = []) => {
  if (!args.length) {
    return message.reply(
      'Please provide a subcommand. Use `start <minutes> [break minutes]`, `break`, `cancel`, or `status`'
    );
  }

  const subCommand = args[0].toLowerCase();
  
  try {
    switch (subCommand) {
      case 'start':
        return await startPomodoro(message, args.slice(1));
      case 'break':
        return await startBreak(message);
      case 'cancel':
        return await cancelPomodoro(message);
      case 'status':
        return await getStatus(message);
      default:
        return message.reply(
          'Invalid subcommand. Use `start <minutes> [break minutes]`, `break`, `cancel`, or `status`'
        );
    }
  } catch (error) {
    console.error('Pomodoro command error:', error);
    message.reply('An error occurred with the Pomodoro timer. Please try again later.');
  }
};

// Start a new Pomodoro session
async function startPomodoro(message, args = []) {
  // Check if user already has an active session
  const existingSession = await PomodoroSession.findOne({
    userId: message.author.id,
    serverId: message.guild.id,
    status: { $in: ['focus', 'break'] }
  });
  
  if (existingSession) {
    return message.reply('You already have an active Pomodoro session. Cancel it first with `!pomodoro cancel`');
  }
  
  // Parse duration from args or use default
  let focusDuration = DEFAULT_FOCUS_MINUTES;
  let breakDuration = DEFAULT_BREAK_MINUTES;
  
  if (args.length > 0) {
    const parsedDuration = parseInt(args[0]);
    if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 120) {
      return message.reply('Please provide a valid duration between 1 and 120 minutes.');
    }
    focusDuration = parsedDuration;
  }
  
  if (args.length > 1) {
    const parsedBreak = parseInt(args[1]);
    if (isNaN(parsedBreak) || parsedBreak < 1 || parsedBreak > 60) {
      return message.reply('Please provide a valid break duration between 1 and 60 minutes.');
    }
    breakDuration = parsedBreak;
  }
  
  // Calculate end time
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + focusDuration * 60000);
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle('🍅 Pomodoro Timer Started')
    .setColor('#ff6347') // Tomato red
    .setDescription(`Focus for **${focusDuration} minutes**, then take a **${breakDuration} minute** break.`)
    .addFields(
      { name: 'Status', value: '⏱️ Focusing...', inline: true },
      { name: 'Started At', value: formatTime(startTime), inline: true },
      { name: 'Ends At', value: formatTime(endTime), inline: true }
    )
    .setFooter({ text: `Started by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
    .setTimestamp();
  
  // Send embed
  const sentMessage = await message.channel.send({ embeds: [embed] });
  
  // Create session in database
  const session = new PomodoroSession({
    userId: message.author.id,
    serverId: message.guild.id,
    channelId: message.channel.id,
    messageId: sentMessage.id,
    status: 'focus',
    duration: focusDuration,
    breakDuration: breakDuration,
    startTime: startTime,
    endTime: endTime
  });
  
  await session.save();
  
  // Send confirmation
  return message.reply(`Pomodoro timer started for ${focusDuration} minutes. Focus time! 💪`);
}

// Start a break manually
async function startBreak(message) {
  // Find active session
  const session = await PomodoroSession.findOne({
    userId: message.author.id,
    serverId: message.guild.id,
    status: 'focus'
  });
  
  if (!session) {
    return message.reply('You don\'t have an active Pomodoro focus session. Start one with `!pomodoro start`');
  }
  
  // Calculate new end time for break
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + session.breakDuration * 60000);
  
  // Update session
  session.status = 'break';
  session.startTime = startTime;
  session.endTime = endTime;
  session.notified = false;
  await session.save();
  
  // Update embed
  try {
    const channel = await message.client.channels.fetch(session.channelId);
    const pomodoroMessage = await channel.messages.fetch(session.messageId);
    
    const embed = new EmbedBuilder()
      .setTitle('🍅 Pomodoro Break Time')
      .setColor('#4CAF50') // Green
      .setDescription(`Taking a **${session.breakDuration} minute** break after focusing for **${session.duration} minutes**.`)
      .addFields(
        { name: 'Status', value: '☕ On Break...', inline: true },
        { name: 'Started At', value: formatTime(startTime), inline: true },
        { name: 'Ends At', value: formatTime(endTime), inline: true }
      )
      .setFooter({ text: `Started by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    await pomodoroMessage.edit({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to update Pomodoro message:', error);
  }
  
  return message.reply(`Break time! Take ${session.breakDuration} minutes to relax. ☕`);
}

// Cancel an active Pomodoro session
async function cancelPomodoro(message) {
  // Find active session
  const session = await PomodoroSession.findOne({
    userId: message.author.id,
    serverId: message.guild.id,
    status: { $in: ['focus', 'break'] }
  });
  
  if (!session) {
    return message.reply('You don\'t have an active Pomodoro session to cancel.');
  }
  
  // Update session
  session.status = 'cancelled';
  await session.save();
  
  // Update embed
  try {
    const channel = await message.client.channels.fetch(session.channelId);
    const pomodoroMessage = await channel.messages.fetch(session.messageId);
    
    const embed = new EmbedBuilder()
      .setTitle('🍅 Pomodoro Session Cancelled')
      .setColor('#607D8B') // Blue grey
      .setDescription('This Pomodoro session has been cancelled.')
      .addFields(
        { name: 'Status', value: '❌ Cancelled', inline: true },
        { name: 'Started At', value: formatTime(session.startTime), inline: true },
        { name: 'Duration', value: `${session.status === 'focus' ? session.duration : session.breakDuration} minutes`, inline: true }
      )
      .setFooter({ text: `Started by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    await pomodoroMessage.edit({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to update Pomodoro message:', error);
  }
  
  return message.reply('Pomodoro session cancelled.');
}

// Get status of active Pomodoro session
async function getStatus(message) {
  // Find active session
  const session = await PomodoroSession.findOne({
    userId: message.author.id,
    serverId: message.guild.id,
    status: { $in: ['focus', 'break'] }
  });
  
  if (!session) {
    return message.reply('You don\'t have an active Pomodoro session. Start one with `!pomodoro start`');
  }
  
  // Calculate remaining time
  const now = new Date();
  const endTime = new Date(session.endTime);
  const remainingMs = endTime - now;
  
  if (remainingMs <= 0) {
    // Session should be completed but wasn't updated yet
    if (session.status === 'focus') {
      return message.reply('Your focus session is complete! Take a break with `!pomodoro break`');
    } else {
      return message.reply('Your break is complete! Start a new Pomodoro with `!pomodoro start`');
    }
  }
  
  // Calculate remaining minutes and seconds
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
  
  const status = session.status === 'focus' ? 'focusing' : 'on break';
  
  return message.reply(
    `You are currently ${status} with ${remainingMinutes}m ${remainingSeconds}s remaining.`
  );
}

// Helper function to format time
function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
} 