/**
 * Service for testing and explaining regular expressions
 */
export default class RegexService {
  constructor() {
    // Define explanations for common regex components
    this.components = {
      // Character classes
      '.': 'Matches any character except newline',
      '\\d': 'Matches any digit (0-9)',
      '\\D': 'Matches any non-digit character',
      '\\w': 'Matches any word character (a-z, A-Z, 0-9, _)',
      '\\W': 'Matches any non-word character',
      '\\s': 'Matches any whitespace character (space, tab, newline)',
      '\\S': 'Matches any non-whitespace character',
      '\\b': 'Matches a word boundary (position between \\w and \\W)',
      '\\B': 'Matches a non-word boundary',
      '\\t': 'Matches a tab character',
      '\\n': 'Matches a newline character',
      '\\r': 'Matches a carriage return',
      
      // Quantifiers
      '*': 'Matches 0 or more of the preceding item',
      '+': 'Matches 1 or more of the preceding item',
      '?': 'Matches 0 or 1 of the preceding item (makes it optional)',
      '{n}': 'Matches exactly n of the preceding item',
      '{n,}': 'Matches n or more of the preceding item',
      '{n,m}': 'Matches between n and m of the preceding item',
      
      // Anchors
      '^': 'Matches the start of the string or line',
      '$': 'Matches the end of the string or line',
      
      // Groups and alternation
      '()': 'Creates a capturing group',
      '(?:)': 'Creates a non-capturing group',
      '|': 'Acts as an OR operator (a|b matches a or b)',
      
      // Special characters
      '[]': 'Defines a character class/set (matches any character inside)',
      '[^]': 'Defines a negated character class/set (matches any character NOT inside)',
      '-': 'Within a character class, defines a range (e.g., a-z)',
      '\\': 'Escapes a special character',
      
      // Lookaheads and lookbehinds
      '(?=)': 'Positive lookahead (matches a position followed by a pattern)',
      '(?!)': 'Negative lookahead (matches a position NOT followed by a pattern)',
      '(?<=)': 'Positive lookbehind (matches a position preceded by a pattern)',
      '(?<!)': 'Negative lookbehind (matches a position NOT preceded by a pattern)',
      
      // Flags
      'g': 'Global flag - find all matches rather than stopping at the first match',
      'i': 'Case-insensitive flag - match regardless of case',
      'm': 'Multiline flag - ^ and $ match start/end of each line, not just the string',
      's': 'Dotall flag - . matches newlines as well (ES2018+)',
      'u': 'Unicode flag - treat pattern as a sequence of Unicode code points',
      'y': 'Sticky flag - match only from the index indicated by lastIndex property'
    };
    
    // Common regex patterns explanation
    this.commonPatterns = {
      '^\\d{3}-\\d{3}-\\d{4}$': 'Matches a phone number in the format 123-456-7890',
      '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$': 'Matches an email address',
      '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$': 'Matches a password with minimum 8 characters, at least one letter and one number',
      '^https?:\\/\\/[\\w\\.-]+\\.[a-z]{2,}\\/?.*$': 'Matches a URL (http or https)',
      '^\\d{5}(-\\d{4})?$': 'Matches a US zip code with optional 4-digit extension',
      '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$': 'Matches a time in 24-hour format (hh:mm)',
      '^[a-fA-F0-9]{6}$': 'Matches a hex color code without the # prefix',
      '^[0-9]{4}-[0-9]{2}-[0-9]{2}$': 'Matches a date in YYYY-MM-DD format',
      '^([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$': 'Matches a filename with extension',
      '^\\d+\\.\\d{2}$': 'Matches a dollar amount with 2 decimal places'
    };
  }

  /**
   * Test a regex pattern against a string
   * @param {string} pattern - The regex pattern to test
   * @param {string} testString - The string to test against
   * @param {string} flags - Regex flags (e.g., 'g', 'i', 'gi')
   * @returns {Object} - The test results
   */
  testRegex(pattern, testString, flags = '') {
    try {
      // Safety checks
      if (!pattern || !testString) {
        return {
          valid: false,
          error: 'Pattern and test string are required.'
        };
      }
      
      // Validate pattern is not too complex
      if (pattern.length > 500) {
        return {
          valid: false,
          error: 'Pattern is too complex. Please use a shorter pattern.'
        };
      }
      
      // Create RegExp object
      const regex = new RegExp(pattern, flags);
      
      // Test for a match
      const isMatch = regex.test(testString);
      
      // Find all matches if global flag is set
      const matches = [];
      if (flags.includes('g')) {
        let match;
        regex.lastIndex = 0; // Reset lastIndex (in case we used regex.test)
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else if (isMatch) {
        // Find the first match
        regex.lastIndex = 0; // Reset lastIndex
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      // Build a visual representation of the matches
      let visualMatches = '';
      if (matches.length > 0) {
        // Create an array of characters with markers for matches
        const charArray = testString.split('');
        
        // Mark starts and ends of matches
        matches.forEach((match, i) => {
          if (charArray[match.index]) {
            charArray[match.index] = `[${charArray[match.index]}`;
          }
          
          if (charArray[match.index + match.match.length - 1]) {
            charArray[match.index + match.match.length - 1] = `${charArray[match.index + match.match.length - 1]}]`;
          }
        });
        
        visualMatches = charArray.join('');
      }
      
      // Return the results
      return {
        valid: true,
        pattern,
        flags,
        isMatch,
        matches,
        visualMatches,
        matchCount: matches.length
      };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid regex pattern: ${error.message}`
      };
    }
  }

  /**
   * Explain a regex pattern
   * @param {string} pattern - The regex pattern to explain
   * @returns {Object} - The explanation
   */
  explainRegex(pattern) {
    try {
      // Safety check
      if (!pattern) {
        return {
          valid: false,
          error: 'Pattern is required.'
        };
      }
      
      // Validate pattern is not too complex
      if (pattern.length > 500) {
        return {
          valid: false,
          error: 'Pattern is too complex. Please use a shorter pattern.'
        };
      }
      
      // Check if this is a common pattern we have a predefined explanation for
      if (this.commonPatterns[pattern]) {
        return {
          valid: true,
          pattern,
          explanation: this.commonPatterns[pattern],
          isCommonPattern: true
        };
      }
      
      // Parse the pattern and generate an explanation
      const explanation = this.parsePattern(pattern);
      
      return {
        valid: true,
        pattern,
        explanation,
        components: this.identifyComponents(pattern)
      };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid regex pattern: ${error.message}`
      };
    }
  }

  /**
   * Parse a regex pattern and generate a human-readable explanation
   * @param {string} pattern - The regex pattern to parse
   * @returns {string} - A human-readable explanation
   */
  parsePattern(pattern) {
    // Remove the leading and trailing slashes if they're present
    const cleanPattern = pattern.replace(/^\/|\/[gimsuxy]*$/g, '');
    
    // Extract any flags
    let flags = '';
    const flagMatch = pattern.match(/\/([gimsuxy]*)$/);
    if (flagMatch) {
      flags = flagMatch[1];
    }
    
    let explanation = `This regular expression ${flags ? `with flags "${flags}" ` : ''}matches `;
    
    // Try to create a more human-friendly explanation
    if (cleanPattern.startsWith('^') && cleanPattern.endsWith('$')) {
      explanation += `exactly a string where:`;
    } else if (cleanPattern.startsWith('^')) {
      explanation += `a string that begins with:`;
    } else if (cleanPattern.endsWith('$')) {
      explanation += `a string that ends with:`;
    } else {
      explanation += `a substring where:`;
    }
    
    // Add component-specific explanations
    const components = this.identifyComponents(cleanPattern);
    if (components.length > 0) {
      explanation += `\n\n${components.map(c => `• ${c.explanation}`).join('\n')}`;
    } else {
      explanation += `\n\n• It matches the literal text "${cleanPattern}"`;
    }
    
    // Add flag explanations
    if (flags) {
      explanation += '\n\nWith these flags:';
      for (const flag of flags) {
        if (this.components[flag]) {
          explanation += `\n• ${flag}: ${this.components[flag]}`;
        }
      }
    }
    
    return explanation;
  }

  /**
   * Identify and explain components in a regex pattern
   * @param {string} pattern - The regex pattern to analyze
   * @returns {Array} - An array of identified components and their explanations
   */
  identifyComponents(pattern) {
    const components = [];
    
    // Helper function to add a component if it's found
    const addComponent = (regex, explanation) => {
      const matches = pattern.match(regex);
      if (matches) {
        matches.forEach(match => {
          components.push({
            component: match,
            explanation
          });
        });
      }
    };
    
    // Check for various components
    // Character classes
    addComponent(/\\d/g, 'Matches any digit (0-9)');
    addComponent(/\\D/g, 'Matches any non-digit character');
    addComponent(/\\w/g, 'Matches any word character (a-z, A-Z, 0-9, _)');
    addComponent(/\\W/g, 'Matches any non-word character');
    addComponent(/\\s/g, 'Matches any whitespace character (space, tab, newline)');
    addComponent(/\\S/g, 'Matches any non-whitespace character');
    addComponent(/\\b/g, 'Matches a word boundary');
    addComponent(/\\B/g, 'Matches a non-word boundary');
    
    // Character sets
    const charSetMatches = pattern.match(/\[(.*?)\]/g);
    if (charSetMatches) {
      charSetMatches.forEach(match => {
        if (match.startsWith('[^')) {
          components.push({
            component: match,
            explanation: `Matches any character NOT in the set: ${match}`
          });
        } else {
          components.push({
            component: match,
            explanation: `Matches any character in the set: ${match}`
          });
        }
      });
    }
    
    // Quantifiers
    const starMatches = pattern.match(/[^\\]\*|\\\*/g);
    if (starMatches) {
      starMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `The preceding character or group appears 0 or more times`
        });
      });
    }
    
    const plusMatches = pattern.match(/[^\\]\+|\\\+/g);
    if (plusMatches) {
      plusMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `The preceding character or group appears 1 or more times`
        });
      });
    }
    
    const questionMatches = pattern.match(/[^\\]\?|\\\?/g);
    if (questionMatches) {
      questionMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `The preceding character or group appears 0 or 1 time (optional)`
        });
      });
    }
    
    const rangeMatches = pattern.match(/\{(\d+)(,)?(\d+)?\}/g);
    if (rangeMatches) {
      rangeMatches.forEach(match => {
        if (match.includes(',')) {
          if (match.match(/\{\d+,\d+\}/)) {
            components.push({
              component: match,
              explanation: `The preceding character or group appears between the specified number of times`
            });
          } else {
            components.push({
              component: match,
              explanation: `The preceding character or group appears at least the specified number of times`
            });
          }
        } else {
          components.push({
            component: match,
            explanation: `The preceding character or group appears exactly the specified number of times`
          });
        }
      });
    }
    
    // Groups
    const groupMatches = pattern.match(/\((?!\?:).*?\)/g);
    if (groupMatches) {
      groupMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `Captures the group: ${match}`
        });
      });
    }
    
    const nonCapturingMatches = pattern.match(/\(\?:.*?\)/g);
    if (nonCapturingMatches) {
      nonCapturingMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `Non-capturing group: ${match}`
        });
      });
    }
    
    // Anchors
    if (pattern.includes('^')) {
      components.push({
        component: '^',
        explanation: 'Matches the start of the string or line'
      });
    }
    
    if (pattern.includes('$')) {
      components.push({
        component: '$',
        explanation: 'Matches the end of the string or line'
      });
    }
    
    // Alternation
    if (pattern.includes('|')) {
      components.push({
        component: '|',
        explanation: 'Alternation (OR) operator - matches either the pattern before or after the |'
      });
    }
    
    // Lookaheads and lookbehinds
    const lookaheadMatches = pattern.match(/\(\?=.*?\)/g);
    if (lookaheadMatches) {
      lookaheadMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `Positive lookahead - matches a position followed by: ${match}`
        });
      });
    }
    
    const negativeLookaheadMatches = pattern.match(/\(\?!.*?\)/g);
    if (negativeLookaheadMatches) {
      negativeLookaheadMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `Negative lookahead - matches a position NOT followed by: ${match}`
        });
      });
    }
    
    const lookbehindMatches = pattern.match(/\(\?<=.*?\)/g);
    if (lookbehindMatches) {
      lookbehindMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `Positive lookbehind - matches a position preceded by: ${match}`
        });
      });
    }
    
    const negativeLookbehindMatches = pattern.match(/\(\?<!.*?\)/g);
    if (negativeLookbehindMatches) {
      negativeLookbehindMatches.forEach(match => {
        components.push({
          component: match,
          explanation: `Negative lookbehind - matches a position NOT preceded by: ${match}`
        });
      });
    }
    
    // Wildcard
    if (pattern.includes('.')) {
      components.push({
        component: '.',
        explanation: 'Matches any character except newline'
      });
    }
    
    return components;
  }
} 