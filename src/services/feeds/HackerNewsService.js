import axios from 'axios';

export default class HackerNewsService {
  constructor() {
    this.baseUrl = 'https://hacker-news.firebaseio.com/v0';
  }
  
  /**
   * Get top stories from Hacker News
   * @param {Object} options - Options for fetching stories
   * @param {number} options.limit - Maximum number of stories to fetch
   * @returns {Promise<Array>} - List of top stories
   */
  async getTopStories(options = {}) {
    try {
      const { limit = 5 } = options;
      
      // Get top story IDs
      const topStoryIds = await axios.get(`${this.baseUrl}/topstories.json`);
      
      // Get details for each story (limited to the specified number)
      const storyPromises = topStoryIds.data
        .slice(0, limit)
        .map(id => this.getStory(id));
      
      const stories = await Promise.all(storyPromises);
      
      // Transform and filter out any null values
      return stories
        .filter(story => story !== null)
        .map(story => ({
          id: story.id,
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          date: new Date(story.time * 1000).toISOString(),
          author: story.by,
          source: 'hackernews',
          comments: story.descendants,
          score: story.score,
          summary: '',
          tags: ['hackernews']
        }));
    } catch (error) {
      console.error('Error fetching Hacker News top stories:', error);
      return [];
    }
  }
  
  /**
   * Get new stories from Hacker News
   * @param {Object} options - Options for fetching stories
   * @param {number} options.limit - Maximum number of stories to fetch
   * @returns {Promise<Array>} - List of new stories
   */
  async getNewStories(options = {}) {
    try {
      const { limit = 5 } = options;
      
      // Get new story IDs
      const newStoryIds = await axios.get(`${this.baseUrl}/newstories.json`);
      
      // Get details for each story (limited to the specified number)
      const storyPromises = newStoryIds.data
        .slice(0, limit)
        .map(id => this.getStory(id));
      
      const stories = await Promise.all(storyPromises);
      
      // Transform and filter out any null values
      return stories
        .filter(story => story !== null)
        .map(story => ({
          id: story.id,
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          date: new Date(story.time * 1000).toISOString(),
          author: story.by,
          source: 'hackernews',
          comments: story.descendants,
          score: story.score,
          summary: '',
          tags: ['hackernews']
        }));
    } catch (error) {
      console.error('Error fetching Hacker News new stories:', error);
      return [];
    }
  }
  
  /**
   * Get details for a specific story
   * @param {number} id - The story ID
   * @returns {Promise<Object|null>} - Story details or null if not found
   */
  async getStory(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/item/${id}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Hacker News story ${id}:`, error);
      return null;
    }
  }
} 