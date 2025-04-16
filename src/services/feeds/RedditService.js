import axios from 'axios';

export default class RedditService {
  constructor() {
    // Default programming subreddits to fetch from
    this.defaultSubreddits = [
      'programming',
      'webdev',
      'javascript',
      'reactjs',
      'node',
      'python'
    ];
  }
  
  /**
   * Get top posts from programming subreddits
   * @param {Object} options - Options for fetching posts
   * @param {number} options.limit - Maximum number of posts to fetch per subreddit
   * @param {string[]} options.subreddits - Subreddits to fetch from
   * @returns {Promise<Array>} - List of posts
   */
  async getPosts(options = {}) {
    try {
      const { 
        limit = 5, 
        subreddits = this.defaultSubreddits,
        timeframe = 'day' // 'hour', 'day', 'week', 'month', 'year', 'all'
      } = options;
      
      // Use specified subreddits or default to programming subreddits
      const subredditList = subreddits.length > 0 
        ? subreddits 
        : this.defaultSubreddits;
      
      // Fetch from all specified subreddits
      const requests = subredditList.map(subreddit => 
        this.getSubredditPosts(subreddit, { limit, timeframe })
      );
      
      const results = await Promise.allSettled(requests);
      
      // Combine all posts from different subreddits
      let allPosts = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allPosts = [...allPosts, ...result.value];
        }
      });
      
      // Sort by score (highest first)
      allPosts.sort((a, b) => b.score - a.score);
      
      // Limit the total number of results
      return allPosts.slice(0, limit);
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      return [];
    }
  }
  
  /**
   * Get top posts from a specific subreddit
   * @param {string} subreddit - Name of the subreddit
   * @param {Object} options - Options for fetching posts
   * @param {number} options.limit - Maximum number of posts to fetch
   * @param {string} options.timeframe - Timeframe for posts
   * @returns {Promise<Array>} - List of posts
   */
  async getSubredditPosts(subreddit, options = {}) {
    try {
      const { limit = 5, timeframe = 'day' } = options;
      
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/top.json`,
        {
          params: {
            limit,
            t: timeframe
          },
          headers: {
            'User-Agent': 'DevHelperBot/1.0'
          }
        }
      );
      
      // Transform the response into a standardized format
      return response.data.data.children.map(post => {
        const data = post.data;
        
        return {
          id: data.id,
          title: data.title,
          url: `https://www.reddit.com${data.permalink}`,
          externalUrl: data.url,
          date: new Date(data.created_utc * 1000).toISOString(),
          author: data.author,
          source: 'reddit',
          subreddit: data.subreddit,
          score: data.score,
          comments: data.num_comments,
          summary: data.selftext ? data.selftext.substring(0, 150) + '...' : '',
          imageUrl: data.thumbnail && data.thumbnail !== 'self' ? data.thumbnail : null,
          tags: ['reddit', data.subreddit]
        };
      });
    } catch (error) {
      console.error(`Error fetching posts from r/${subreddit}:`, error);
      return [];
    }
  }
} 