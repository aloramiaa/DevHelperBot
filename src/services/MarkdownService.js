import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MarkdownService {
  constructor() {
    this.browser = null;
    this.initialized = false;
    this.outputDir = join(__dirname, '../../temp');
    this.template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292e;
            background-color: #fff;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
          }
          h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
          h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
          h3 { font-size: 1.25em; }
          h4 { font-size: 1em; }
          h5 { font-size: 0.875em; }
          h6 { font-size: 0.85em; color: #6a737d; }
          
          pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 16px;
            overflow: auto;
          }
          
          code {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
          }
          
          pre code {
            background-color: transparent;
            padding: 0;
          }
          
          blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            margin: 0;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
          }
          
          table th, table td {
            padding: 6px 13px;
            border: 1px solid #dfe2e5;
          }
          
          table tr {
            background-color: #fff;
            border-top: 1px solid #c6cbd1;
          }
          
          table tr:nth-child(2n) {
            background-color: #f6f8fa;
          }
          
          img {
            max-width: 100%;
          }
          
          hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #e1e4e8;
            border: 0;
          }
          
          ul, ol {
            padding-left: 2em;
          }
          
          a {
            color: #0366d6;
            text-decoration: none;
          }
          
          a:hover {
            text-decoration: underline;
          }
          
          .task-list-item {
            list-style-type: none;
          }
          
          .task-list-item-checkbox {
            margin-right: 0.5em;
          }
          
          .content {
            background: white;
            padding: 20px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          }
        </style>
      </head>
      <body>
        <div class="content">
          {{content}}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Initialize the Puppeteer browser
   */
  async initialize() {
    if (!this.initialized) {
      try {
        // Ensure output directory exists
        await mkdir(this.outputDir, { recursive: true });
        
        this.browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: 'new',
        });
        
        this.initialized = true;
        console.log('Markdown service initialized with Puppeteer');
      } catch (error) {
        console.error('Error initializing markdown service:', error);
        throw error;
      }
    }
  }

  /**
   * Shutdown the Puppeteer browser
   */
  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.initialized = false;
      console.log('Markdown service shut down');
    }
  }

  /**
   * Render markdown to HTML
   * @param {string} markdown - The markdown text to render
   * @returns {string} - The HTML content
   */
  renderToHtml(markdown) {
    try {
      // Convert markdown to HTML using marked
      const html = marked.parse(markdown);
      
      // Insert HTML into the template
      return this.template.replace('{{content}}', html);
    } catch (error) {
      console.error('Error rendering markdown to HTML:', error);
      throw error;
    }
  }

  /**
   * Generate a screenshot of rendered markdown
   * @param {string} markdown - The markdown text to render
   * @param {Object} options - Screenshot options
   * @param {number} options.width - Width of the viewport
   * @param {number} options.height - Height of the viewport
   * @param {string} options.format - Image format (png or jpeg)
   * @returns {Promise<string>} - Path to the generated screenshot
   */
  async generateScreenshot(markdown, options = {}) {
    // Default options
    const { 
      width = 800, 
      height = 600, 
      format = 'png'
    } = options;
    
    // Ensure browser is initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Convert markdown to HTML
      const html = this.renderToHtml(markdown);
      
      // Create a new page
      const page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport({ width, height });
      
      // Set content
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for rendering
      await page.waitForSelector('.content');
      
      // Get the content element
      const element = await page.$('.content');
      
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `markdown_${timestamp}.${format}`;
      const outputPath = join(this.outputDir, filename);
      
      // Take a screenshot of just the content
      await element.screenshot({
        path: outputPath,
        type: format,
        omitBackground: format === 'png',
        quality: format === 'jpeg' ? 90 : undefined
      });
      
      // Close the page
      await page.close();
      
      return outputPath;
    } catch (error) {
      console.error('Error generating markdown screenshot:', error);
      throw error;
    }
  }

  /**
   * Clean up old screenshots
   * @param {number} maxAge - Maximum age in milliseconds
   */
  async cleanupOldScreenshots(maxAge = 3600000) { // Default: 1 hour
    try {
      const files = await readdir(this.outputDir);
      const now = Date.now();
      
      for (const file of files) {
        if (file.startsWith('markdown_') && (file.endsWith('.png') || file.endsWith('.jpeg'))) {
          const filePath = join(this.outputDir, file);
          const stats = await stat(filePath);
          
          // If file is older than maxAge, delete it
          if (now - stats.mtimeMs > maxAge) {
            await unlink(filePath);
            console.log(`Deleted old screenshot: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old screenshots:', error);
    }
  }
}

export default MarkdownService;