import { EmbedBuilder } from 'discord.js';
import NewsSubscription from '../models/NewsSubscription.js';
import FeedService from './feeds/FeedService.js';

export default class NewsDigestService {
  constructor(client) {
    this.client = client;
    this.feedService = new FeedService();
    this.checkInterval = null;
    this.isRunning = false;
    
    // Check interval in ms (15 minutes)
    this.CHECK_INTERVAL = 15 * 60 * 1000;
  }
  
  /**
   * Start the digest service
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkInterval = setInterval(() => this.checkScheduledDigests(), this.CHECK_INTERVAL);
    console.log('News digest service started');
  }
  
  /**
   * Stop the digest service
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.checkInterval);
    this.isRunning = false;
    console.log('News digest service stopped');
  }
  
  /**
   * Check for scheduled digests
   */
  async checkScheduledDigests() {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Find active daily subscriptions that haven't been sent today
      const dailySubscriptions = await NewsSubscription.find({
        active: true,
        frequency: 'daily',
        $or: [
          { lastSent: { $lt: yesterday } },
          { lastSent: null }
        ]
      });
      
      // Find active weekly subscriptions that haven't been sent this week
      const weeklySubscriptions = await NewsSubscription.find({
        active: true,
        frequency: 'weekly',
        $or: [
          { lastSent: { $lt: lastWeek } },
          { lastSent: null }
        ]
      });
      
      // Combine all subscriptions that need to be sent
      const subscriptions = [...dailySubscriptions, ...weeklySubscriptions];
      
      // Process each subscription
      for (const subscription of subscriptions) {
        await this.sendDigest(subscription);
      }
    } catch (error) {
      console.error('Error checking scheduled digests:', error);
    }
  }
  
  /**
   * Send digest for a specific subscription
   * @param {Object} subscription - Subscription document from MongoDB
   */
  async sendDigest(subscription) {
    try {
      // Get channel
      const channel = await this.client.channels.fetch(subscription.channelId).catch(() => null);
      if (!channel) {
        console.warn(`Channel ${subscription.channelId} not found for news digest`);
        return;
      }
      
      // Get news based on subscription preferences
      const news = await this.feedService.getNews({
        sources: subscription.sources,
        tags: subscription.tags,
        limit: 5
      });
      
      if (news.length === 0) {
        console.log(`No news found for subscription ${subscription._id}`);
        
        // Update lastSent to prevent constant retries
        subscription.lastSent = new Date();
        await subscription.save();
        return;
      }
      
      // Create embed for the digest
      const embed = new EmbedBuilder()
        .setTitle(`🗞️ ${subscription.frequency === 'daily' ? 'Daily' : 'Weekly'} Dev News Digest`)
        .setColor('#0099ff')
        .setDescription('Here\'s your curated development news:')
        .setFooter({ text: 'DevHelper Bot News Digest', iconURL: this.client.user.displayAvatarURL() })
        .setTimestamp();
      
      // Add news items to the embed
      news.forEach((item, index) => {
        let sourceEmoji = '📰';
        if (item.source === 'devto') sourceEmoji = '👩‍💻';
        if (item.source === 'hackernews') sourceEmoji = '🔥';
        if (item.source === 'reddit') sourceEmoji = '🤖';
        
        const value = item.summary 
          ? `${item.summary.substring(0, 100)}${item.summary.length > 100 ? '...' : ''}\n[Read more](${item.url})`
          : `[Read more](${item.url})`;
          
        embed.addFields({
          name: `${index + 1}. ${sourceEmoji} ${item.title}`,
          value
        });
      });
      
      // Send the digest
      await channel.send({ 
        content: `<@${subscription.userId}> Here's your ${subscription.frequency} dev news digest!`,
        embeds: [embed]
      });
      
      // Update lastSent timestamp
      subscription.lastSent = new Date();
      await subscription.save();
      
      console.log(`Sent digest for subscription ${subscription._id}`);
    } catch (error) {
      console.error(`Error sending digest for subscription ${subscription._id}:`, error);
    }
  }
  
  /**
   * Subscribe a user to news digest
   * @param {Object} options - Subscription options
   * @param {string} options.userId - User ID
   * @param {string} options.serverId - Server ID
   * @param {string} options.channelId - Channel ID
   * @param {string} options.frequency - Digest frequency ('daily' or 'weekly')
   * @param {string[]} options.sources - News sources
   * @param {string[]} options.tags - Tags to filter by
   * @returns {Promise<Object>} - Created subscription
   */
  async subscribe(options) {
    const {
      userId,
      serverId,
      channelId,
      frequency = 'daily',
      sources = ['devto', 'hackernews', 'reddit'],
      tags = []
    } = options;
    
    // Check if user already has a subscription
    const existingSubscription = await NewsSubscription.findOne({
      userId,
      serverId,
      active: true
    });
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.channelId = channelId;
      existingSubscription.frequency = frequency;
      existingSubscription.sources = sources;
      existingSubscription.tags = tags;
      existingSubscription.active = true;
      
      await existingSubscription.save();
      return existingSubscription;
    }
    
    // Create new subscription
    const subscription = new NewsSubscription({
      userId,
      serverId,
      channelId,
      frequency,
      sources,
      tags
    });
    
    await subscription.save();
    return subscription;
  }
  
  /**
   * Unsubscribe a user from news digest
   * @param {string} userId - User ID
   * @param {string} serverId - Server ID
   * @returns {Promise<boolean>} - True if unsubscribed successfully
   */
  async unsubscribe(userId, serverId) {
    const result = await NewsSubscription.updateOne(
      { userId, serverId, active: true },
      { active: false }
    );
    
    return result.modifiedCount > 0;
  }
  
  /**
   * Get user's subscription
   * @param {string} userId - User ID
   * @param {string} serverId - Server ID
   * @returns {Promise<Object|null>} - Subscription or null if not found
   */
  async getSubscription(userId, serverId) {
    return NewsSubscription.findOne({
      userId,
      serverId,
      active: true
    });
  }
} 