import jwt from 'jsonwebtoken';

class DevToolsService {
  /**
   * Base64 encode a string
   * @param {string} text - Text to encode
   * @returns {string} - Base64 encoded string
   */
  encodeBase64(text) {
    try {
      return Buffer.from(text).toString('base64');
    } catch (error) {
      throw new Error(`Failed to encode to Base64: ${error.message}`);
    }
  }
  
  /**
   * Base64 decode a string
   * @param {string} encoded - Base64 encoded string
   * @returns {string} - Decoded string
   */
  decodeBase64(encoded) {
    try {
      return Buffer.from(encoded, 'base64').toString('utf-8');
    } catch (error) {
      throw new Error(`Failed to decode from Base64: ${error.message}`);
    }
  }
  
  /**
   * Format JSON string
   * @param {string} jsonString - JSON string to format
   * @param {number} spaces - Number of spaces for indentation
   * @returns {string} - Formatted JSON string
   */
  formatJSON(jsonString, spaces = 2) {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, spaces);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }
  
  /**
   * Minify JSON string
   * @param {string} jsonString - JSON string to minify
   * @returns {string} - Minified JSON string
   */
  minifyJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }
  
  /**
   * Parse JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded JWT payload and header
   */
  decodeJWT(token) {
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format. Expected 3 parts separated by dots.');
      }
      
      // Decode header and payload (without verification)
      const header = JSON.parse(this.decodeBase64(parts[0]));
      const payload = JSON.parse(this.decodeBase64(parts[1]));
      
      // Check if token is expired
      const isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000);
      
      return {
        header,
        payload,
        isExpired
      };
    } catch (error) {
      throw new Error(`Failed to decode JWT: ${error.message}`);
    }
  }
  
  /**
   * URL encode a string
   * @param {string} text - Text to encode
   * @returns {string} - URL encoded string
   */
  encodeURL(text) {
    try {
      return encodeURIComponent(text);
    } catch (error) {
      throw new Error(`Failed to URL encode: ${error.message}`);
    }
  }
  
  /**
   * URL decode a string
   * @param {string} encoded - URL encoded string
   * @returns {string} - Decoded string
   */
  decodeURL(encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch (error) {
      throw new Error(`Failed to URL decode: ${error.message}`);
    }
  }
  
  /**
   * Convert text to lowercase
   * @param {string} text - Text to convert
   * @returns {string} - Lowercase text
   */
  toLowerCase(text) {
    return text.toLowerCase();
  }
  
  /**
   * Convert text to uppercase
   * @param {string} text - Text to convert
   * @returns {string} - Uppercase text
   */
  toUpperCase(text) {
    return text.toUpperCase();
  }
  
  /**
   * Count characters in text
   * @param {string} text - Text to analyze
   * @returns {Object} - Character count statistics
   */
  countCharacters(text) {
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const lines = text.split('\n').length;
    
    return {
      characters: chars,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words,
      lines
    };
  }
  
  /**
   * Generate a UUID v4
   * @returns {string} - UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Convert HTML to text
   * @param {string} html - HTML code
   * @returns {string} - Plain text
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  
  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} - Escaped HTML
   */
  escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Hash a string using SHA-256
   * @param {string} text - Text to hash
   * @returns {string} - SHA-256 hash
   */
  async hashSHA256(text) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convert buffer to hex string
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      throw new Error(`Failed to hash with SHA-256: ${error.message}`);
    }
  }
  
  /**
   * Convert decimal to hex
   * @param {number} decimal - Decimal number
   * @returns {string} - Hex string
   */
  decimalToHex(decimal) {
    return Number(decimal).toString(16);
  }
  
  /**
   * Convert hex to decimal
   * @param {string} hex - Hex string
   * @returns {number} - Decimal number
   */
  hexToDecimal(hex) {
    return parseInt(hex, 16);
  }
  
  /**
   * Convert string to binary
   * @param {string} text - Text to convert
   * @returns {string} - Binary representation
   */
  textToBinary(text) {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
  }
  
  /**
   * Convert binary to string
   * @param {string} binary - Binary string (space-separated bytes)
   * @returns {string} - Text
   */
  binaryToText(binary) {
    return binary.split(' ').map(byte => 
      String.fromCharCode(parseInt(byte, 2))
    ).join('');
  }
}

export default DevToolsService; 