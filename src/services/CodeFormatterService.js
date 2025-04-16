import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

class CodeFormatterService {
  constructor() {
    this.formatters = {
      js: this.formatJavaScript,
      javascript: this.formatJavaScript,
      ts: this.formatTypeScript,
      typescript: this.formatTypeScript,
      jsx: this.formatJSX,
      tsx: this.formatTSX,
      css: this.formatCSS,
      html: this.formatHTML,
      json: this.formatJSON,
      py: this.formatPython,
      python: this.formatPython,
      java: this.formatJava,
      go: this.formatGo,
      ruby: this.formatRuby,
      rb: this.formatRuby,
      php: this.formatPHP,
      c: this.formatC,
      cpp: this.formatCPP,
      cs: this.formatCSharp,
      rust: this.formatRust,
      rs: this.formatRust,
    };
    
    // Map file extensions to language names for better UX
    this.languageNames = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      jsx: 'React JSX',
      tsx: 'React TSX',
      css: 'CSS',
      html: 'HTML',
      json: 'JSON',
      py: 'Python',
      python: 'Python',
      java: 'Java',
      go: 'Go',
      ruby: 'Ruby',
      rb: 'Ruby',
      php: 'PHP',
      c: 'C',
      cpp: 'C++',
      cs: 'C#',
      rust: 'Rust',
      rs: 'Rust',
    };
  }

  /**
   * Format code based on language
   * @param {string} language - Programming language identifier
   * @param {string} code - Code to format
   * @returns {Promise<Object>} - Formatted code and metadata
   */
  async formatCode(language, code) {
    const lang = language.toLowerCase();
    
    if (this.formatters[lang]) {
      try {
        // Get the appropriate formatter
        const formatter = this.formatters[lang].bind(this);
        const result = await formatter(code);
        
        return {
          success: true,
          language: this.languageNames[lang] || lang,
          original: code,
          formatted: result,
          message: 'Formatting successful'
        };
      } catch (error) {
        console.error(`Error formatting ${lang} code:`, error);
        return {
          success: false,
          language: this.languageNames[lang] || lang,
          original: code,
          formatted: code,
          message: `Error formatting code: ${error.message}`
        };
      }
    } else {
      return {
        success: false,
        language: lang,
        original: code,
        formatted: code,
        message: `No formatter available for ${lang}`
      };
    }
  }

  /**
   * Get a temporary file path
   * @param {string} extension - File extension
   * @returns {string} - Temporary file path
   */
  getTempFilePath(extension) {
    return path.join(os.tmpdir(), `${uuidv4()}.${extension}`);
  }

  /**
   * Run a command and return its output
   * @param {string} command - Command to run
   * @param {Array} args - Command arguments
   * @param {string} input - Input to pipe to the command
   * @returns {Promise<string>} - Command output
   */
  runCommand(command, args, input = null) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args);
      let stdout = '';
      let stderr = '';
      
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', (err) => {
        reject(new Error(`Failed to start command: ${err.message}`));
      });
    });
  }

  /**
   * Format JavaScript code using Prettier
   * @param {string} code - JavaScript code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatJavaScript(code) {
    try {
      const filePath = this.getTempFilePath('js');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      // If Prettier fails, return the original code
      console.error('Error formatting JavaScript:', error);
      throw error;
    }
  }

  /**
   * Format TypeScript code using Prettier
   * @param {string} code - TypeScript code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatTypeScript(code) {
    try {
      const filePath = this.getTempFilePath('ts');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      // If Prettier fails, return the original code
      console.error('Error formatting TypeScript:', error);
      throw error;
    }
  }
  
  /**
   * Format JSX code using Prettier
   * @param {string} code - JSX code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatJSX(code) {
    try {
      const filePath = this.getTempFilePath('jsx');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting JSX:', error);
      throw error;
    }
  }
  
  /**
   * Format TSX code using Prettier
   * @param {string} code - TSX code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatTSX(code) {
    try {
      const filePath = this.getTempFilePath('tsx');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting TSX:', error);
      throw error;
    }
  }
  
  /**
   * Format CSS code using Prettier
   * @param {string} code - CSS code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatCSS(code) {
    try {
      const filePath = this.getTempFilePath('css');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting CSS:', error);
      throw error;
    }
  }

  /**
   * Format HTML code using Prettier
   * @param {string} code - HTML code to format
   * @returns {Promise<string>} - Formatted code
   */  
  async formatHTML(code) {
    try {
      const filePath = this.getTempFilePath('html');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting HTML:', error);
      throw error;
    }
  }

  /**
   * Format JSON code using Prettier
   * @param {string} code - JSON code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatJSON(code) {
    try {
      const filePath = this.getTempFilePath('json');
      await fs.writeFile(filePath, code);
      
      const formatted = await this.runCommand('npx', ['prettier', '--write', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting JSON:', error);
      throw error;
    }
  }

  /**
   * Format Python code using Black
   * @param {string} code - Python code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatPython(code) {
    try {
      const filePath = this.getTempFilePath('py');
      await fs.writeFile(filePath, code);
      
      // Run black formatter
      await this.runCommand('python', ['-m', 'black', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting Python:', error);
      throw error;
    }
  }

  /**
   * Format Java code using Google Java Format
   * @param {string} code - Java code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatJava(code) {
    try {
      const filePath = this.getTempFilePath('java');
      await fs.writeFile(filePath, code);
      
      // Assume google-java-format is installed or available via java -jar
      await this.runCommand('java', ['-jar', 'google-java-format.jar', '--replace', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting Java:', error);
      throw error;
    }
  }

  /**
   * Format Go code using gofmt
   * @param {string} code - Go code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatGo(code) {
    try {
      const filePath = this.getTempFilePath('go');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('gofmt', ['-w', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting Go:', error);
      throw error;
    }
  }

  /**
   * Format Ruby code using Rubocop
   * @param {string} code - Ruby code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatRuby(code) {
    try {
      const filePath = this.getTempFilePath('rb');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('rubocop', ['--auto-correct', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting Ruby:', error);
      throw error;
    }
  }

  /**
   * Format PHP code using PHP-CS-Fixer
   * @param {string} code - PHP code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatPHP(code) {
    try {
      const filePath = this.getTempFilePath('php');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('php-cs-fixer', ['fix', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting PHP:', error);
      throw error;
    }
  }

  /**
   * Format C code using clang-format
   * @param {string} code - C code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatC(code) {
    try {
      const filePath = this.getTempFilePath('c');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('clang-format', ['-i', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting C:', error);
      throw error;
    }
  }

  /**
   * Format C++ code using clang-format
   * @param {string} code - C++ code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatCPP(code) {
    try {
      const filePath = this.getTempFilePath('cpp');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('clang-format', ['-i', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting C++:', error);
      throw error;
    }
  }

  /**
   * Format C# code using dotnet format
   * @param {string} code - C# code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatCSharp(code) {
    try {
      const filePath = this.getTempFilePath('cs');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('dotnet', ['format', filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting C#:', error);
      throw error;
    }
  }

  /**
   * Format Rust code using rustfmt
   * @param {string} code - Rust code to format
   * @returns {Promise<string>} - Formatted code
   */
  async formatRust(code) {
    try {
      const filePath = this.getTempFilePath('rs');
      await fs.writeFile(filePath, code);
      
      await this.runCommand('rustfmt', [filePath]);
      const result = await fs.readFile(filePath, 'utf-8');
      
      // Clean up
      await fs.unlink(filePath).catch(() => {});
      
      return result;
    } catch (error) {
      console.error('Error formatting Rust:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   * @returns {Array} - List of supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.languageNames)
      .filter((key, index, self) => 
        // Remove duplicates from the list
        self.indexOf(key) === index
      )
      .map(key => ({ 
        id: key, 
        name: this.languageNames[key]
      }));
  }
}

export default CodeFormatterService;