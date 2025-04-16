import DevToService from './DevToService.js';
import HackerNewsService from './HackerNewsService.js';
import RedditService from './RedditService.js';

export default class FeedService {
  constructor() {
    this.devtoService = new DevToService();
    this.hackerNewsService = new HackerNewsService();
    this.redditService = new RedditService();
  }

  /**
   * Get news from all sources
   * @param {Object} options - Options for fetching news
   * @param {number} options.limit - Maximum number of items per source
   * @param {string[]} options.sources - Sources to fetch from
   * @param {string[]} options.tags - Tags to filter by
   * @returns {Promise<Array>} - Combined news from all sources
   */
  async getNews(options = {}) {
    const { 
      limit = 5, 
      sources = ['devto', 'hackernews', 'reddit'],
      tags = [] 
    } = options;
    
    const fetchPromises = [];
    
    if (sources.includes('devto')) {
      fetchPromises.push(this.devtoService.getArticles({ limit, tags }));
    }
    
    if (sources.includes('hackernews')) {
      fetchPromises.push(this.hackerNewsService.getTopStories({ limit }));
    }
    
    if (sources.includes('reddit')) {
      fetchPromises.push(this.redditService.getPosts({ limit, tags }));
    }
    
    const results = await Promise.allSettled(fetchPromises);
    
    // Combine and mix results from different sources
    let allNews = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allNews = [...allNews, ...result.value];
      }
    });
    
    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit the total number of results
    const totalLimit = limit * sources.length;
    return allNews.slice(0, totalLimit);
  }
  
  /**
   * Get top news from Hacker News
   * @param {Object} options - Options for fetching news
   * @param {number} options.limit - Maximum number of items
   * @returns {Promise<Array>} - Top Hacker News stories
   */
  async getHackerNewsTop(options = {}) {
    const { limit = 10 } = options;
    return this.hackerNewsService.getTopStories({ limit });
  }
  
  /**
   * Get latest articles from Dev.to
   * @param {Object} options - Options for fetching articles
   * @param {number} options.limit - Maximum number of items
   * @param {string[]} options.tags - Tags to filter by
   * @returns {Promise<Array>} - Latest Dev.to articles
   */
  async getDevToLatest(options = {}) {
    const { limit = 10, tags = [] } = options;
    return this.devtoService.getArticles({ limit, tags });
  }
  
  /**
   * Get top posts from programming subreddits
   * @param {Object} options - Options for fetching posts
   * @param {number} options.limit - Maximum number of items
   * @param {string[]} options.subreddits - Subreddits to fetch from
   * @returns {Promise<Array>} - Top Reddit posts
   */
  async getRedditTop(options = {}) {
    const { limit = 10, subreddits = [] } = options;
    return this.redditService.getPosts({ limit, subreddits });
  }
} 