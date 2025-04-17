// ESM Loader for Windows compatibility
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mainFile = pathToFileURL(resolve(__dirname, './src/index.js')).href;

// Use dynamic import to load the main file
import(mainFile).catch(error => {
  console.error('Failed to load application:', error);
  process.exit(1);
}); 