import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for managing and exploring public APIs
 */
class APIExplorerService {
  static #apiData = null;
  static #initialized = false;
  static #apiFilePath = join(__dirname, '../../data/apis.json');

  /**
   * Initialize the API Explorer service by loading the API data
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  static async initialize() {
    if (this.#initialized) {
      return true;
    }

    try {
      const data = await readFile(this.#apiFilePath, 'utf8');
      this.#apiData = JSON.parse(data);
      this.#initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize API Explorer service:', error);
      return false;
    }
  }

  /**
   * Ensure the service is initialized before using it
   * @returns {Promise<boolean>}
   */
  static async ensureInitialized() {
    if (!this.#initialized) {
      return await this.initialize();
    }
    return true;
  }

  /**
   * Get all available API categories
   * @returns {Promise<string[]>} - List of all categories
   */
  static async getCategories() {
    await this.ensureInitialized();
    
    if (!this.#apiData) {
      return [];
    }
    
    // Get unique categories
    const categories = new Set(this.#apiData.map(api => api.category));
    return [...categories].sort();
  }

  /**
   * Get all APIs
   * @returns {Promise<Array>} - List of all APIs
   */
  static async getAllAPIs() {
    await this.ensureInitialized();
    
    if (!this.#apiData) {
      return [];
    }
    
    return this.#apiData.map(api => this.formatAPIEntry(api));
  }

  /**
   * Get APIs by category
   * @param {string} category - The category to filter by
   * @returns {Promise<Array>} - List of APIs in the category
   */
  static async getAPIsByCategory(category) {
    await this.ensureInitialized();
    
    if (!this.#apiData) {
      return [];
    }
    
    const filteredAPIs = this.#apiData.filter(
      api => api.category.toLowerCase() === category.toLowerCase()
    );
    
    return filteredAPIs.map(api => this.formatAPIEntry(api));
  }

  /**
   * Get a random API
   * @returns {Promise<Object|null>} - A random API or null if none available
   */
  static async getRandomAPI() {
    await this.ensureInitialized();
    
    if (!this.#apiData || this.#apiData.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * this.#apiData.length);
    return this.formatAPIEntry(this.#apiData[randomIndex]);
  }

  /**
   * Search APIs by name or description
   * @param {string} query - The search query
   * @returns {Promise<Array>} - List of matching APIs
   */
  static async searchAPIs(query) {
    await this.ensureInitialized();
    
    if (!this.#apiData || !query) {
      return [];
    }
    
    const lowercaseQuery = query.toLowerCase();
    
    const matchingAPIs = this.#apiData.filter(api => 
      api.name.toLowerCase().includes(lowercaseQuery) || 
      (api.description && api.description.toLowerCase().includes(lowercaseQuery))
    );
    
    return matchingAPIs.map(api => this.formatAPIEntry(api));
  }

  /**
   * Format an API entry to a standardized object
   * @param {Object} apiEntry - The raw API entry from the data file
   * @returns {Object} - Formatted API object
   */
  static formatAPIEntry(apiEntry) {
    return {
      name: apiEntry.name,
      description: apiEntry.description || 'No description available',
      url: apiEntry.url,
      category: apiEntry.category,
      requiresAuth: apiEntry.requiresAuth,
      https: apiEntry.https,
      cors: apiEntry.cors || 'Unknown'
    };
  }
}

export default APIExplorerService;