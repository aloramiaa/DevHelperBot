import axios from 'axios';

class DevToService {
  constructor() {
    this.baseUrl = 'https://dev.to/api';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  /**
   * Fetch articles from Dev.to
   * @param {number} limit - Number of articles to fetch
   * @param {string} tag - Optional tag to filter articles
   * @returns {Promise<Array>} - Array of article objects
   */
  async getArticles(limit = 5, tag = null) {
    try {
      const params = {
        per_page: limit,
      };

      if (tag) {
        params.tag = tag;
      }

      const response = await this.client.get('/articles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Dev.to articles:', error);
      return [];
    }
  }

  /**
   * Fetch top articles from Dev.to based on reactions count
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} - Array of article objects
   */
  async getTopArticles(limit = 5) {
    try {
      const params = {
        per_page: limit * 2, // Fetch more to sort by reactions
        top: 7 // Top articles from the last week
      };

      const response = await this.client.get('/articles', { params });
      
      // Sort by reactions count and limit
      return response.data
        .sort((a, b) => b.positive_reactions_count - a.positive_reactions_count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top Dev.to articles:', error);
      return [];
    }
  }

  /**
   * Fetch latest articles from Dev.to
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} - Array of article objects
   */
  async getLatestArticles(limit = 5) {
    return this.getArticles(limit);
  }

  /**
   * Fetch articles by tag from Dev.to
   * @param {string} tag - Tag to filter articles
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} - Array of article objects
   */
  async getArticlesByTag(tag, limit = 5) {
    return this.getArticles(limit, tag);
  }

  /**
   * Fetch articles by a specific Dev.to username
   * @param {string} username - Dev.to username
   * @param {number} limit - Number of articles to fetch
   * @returns {Promise<Array>} - Array of article objects
   */
  async getArticlesByUsername(username, limit = 5) {
    try {
      const params = {
        username,
        per_page: limit
      };

      const response = await this.client.get('/articles', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching Dev.to articles for user ${username}:`, error);
      return [];
    }
  }
}

export default DevToService; 