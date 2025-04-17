import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import axios from 'axios';
import { config } from '../../config/config.js';
import JSZip from 'jszip';

export const data = {
  name: 'generate',
  description: 'Generate project boilerplate templates',
  aliases: ['boilerplate', 'template'],
  usage: '<template> <project-name>',
  args: true,
  guildOnly: false
};

// Supported templates
const templates = {
  'react-app': {
    name: 'React App',
    description: 'Simple React application with create-react-app structure',
    repoUrl: 'https://api.github.com/repos/facebook/create-react-app/contents/packages/cra-template/template',
    icon: '⚛️',
    files: {
      'package.json': {
        content: `{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
      },
      'README.md': {
        content: `# {{projectName}}

This project was bootstrapped with DevHelper Bot's React App boilerplate.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
`
      },
      'public/index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web site created using DevHelper Bot" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`
      },
      'src/index.js': {
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      },
      'src/App.js': {
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to {{projectName}}</h1>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;`
      },
      'src/App.css': {
        content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}`
      },
      'src/index.css': {
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`
      }
    }
  },
  'express-api': {
    name: 'Express API',
    description: 'Express.js API boilerplate with structured routes and middleware',
    icon: '🚀',
    files: {
      'package.json': {
        content: `{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "Express API created with DevHelper bot",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "type": "module"
}`
      },
      'README.md': {
        content: `# {{projectName}}

Express API boilerplate generated with DevHelper Bot.

## Setup

\`\`\`
npm install
\`\`\`

## Development

\`\`\`
npm run dev
\`\`\`

## Production

\`\`\`
npm start
\`\`\`

## API Endpoints

- GET /api/health - Health check
- GET /api/items - Get all items
- GET /api/items/:id - Get item by ID
- POST /api/items - Create new item
- PUT /api/items/:id - Update item by ID
- DELETE /api/items/:id - Delete item by ID
`
      },
      '.env': {
        content: `# Server configuration
PORT=3000
NODE_ENV=development

# Add your environment variables here
# DATABASE_URL=your_database_url`
      },
      'src/index.js': {
        content: `import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import itemRoutes from './routes/items.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

app.use('/api/items', itemRoutes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`
      },
      'src/routes/items.js': {
        content: `import express from 'express';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/itemController.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;`
      },
      'src/controllers/itemController.js': {
        content: `// In-memory data store (replace with database in production)
let items = [
  { id: '1', name: 'Item 1', description: 'This is item 1' },
  { id: '2', name: 'Item 2', description: 'This is item 2' }
];

export const getItems = (req, res) => {
  res.status(200).json(items);
};

export const getItemById = (req, res) => {
  const item = items.find(item => item.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  res.status(200).json(item);
};

export const createItem = (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newItem = {
    id: (items.length + 1).toString(),
    name,
    description: description || ''
  };
  
  items.push(newItem);
  res.status(201).json(newItem);
};

export const updateItem = (req, res) => {
  const { name, description } = req.body;
  const itemIndex = items.findIndex(item => item.id === req.params.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  items[itemIndex] = {
    ...items[itemIndex],
    name: name || items[itemIndex].name,
    description: description !== undefined ? description : items[itemIndex].description
  };
  
  res.status(200).json(items[itemIndex]);
};

export const deleteItem = (req, res) => {
  const itemIndex = items.findIndex(item => item.id === req.params.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const deletedItem = items[itemIndex];
  items = items.filter(item => item.id !== req.params.id);
  
  res.status(200).json({ message: 'Item deleted', item: deletedItem });
};`
      }
    }
  },
  'flask-app': {
    name: 'Flask Application',
    description: 'Python Flask web application structure',
    icon: '🐍',
    files: {
      'requirements.txt': {
        content: `flask==2.3.2
python-dotenv==1.0.0
flask-cors==4.0.0`
      },
      'README.md': {
        content: `# {{projectName}}

A Flask web application generated with DevHelper Bot.

## Setup

Create a virtual environment:
\`\`\`
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

Install dependencies:
\`\`\`
pip install -r requirements.txt
\`\`\`

## Running the app

Development:
\`\`\`
flask run --debug
\`\`\`

Production:
\`\`\`
gunicorn app:app
\`\`\`
`
      },
      '.env': {
        content: `FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production
`
      },
      'app.py': {
        content: `from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Set configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-for-{{projectName}}')

# Sample data
items = [
    {'id': 1, 'name': 'Item 1', 'description': 'This is item 1'},
    {'id': 2, 'name': 'Item 2', 'description': 'This is item 2'}
]

@app.route('/')
def home():
    return render_template('index.html', title='{{projectName}}')

@app.route('/api/health')
def health():
    return jsonify({'status': 'OK', 'message': 'API is healthy'})

@app.route('/api/items', methods=['GET'])
def get_items():
    return jsonify(items)

@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = next((item for item in items if item['id'] == item_id), None)
    if item:
        return jsonify(item)
    return jsonify({'message': 'Item not found'}), 404

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'message': 'Name is required'}), 400
    
    new_id = max(item['id'] for item in items) + 1 if items else 1
    new_item = {
        'id': new_id,
        'name': data['name'],
        'description': data.get('description', '')
    }
    
    items.append(new_item)
    return jsonify(new_item), 201

if __name__ == '__main__':
    app.run(debug=True)
`
      },
      'templates/index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="container">
        <h1>Welcome to {{ title }}</h1>
        <p>A Flask application generated with DevHelper Bot</p>
        
        <h2>API Endpoints:</h2>
        <ul>
            <li><code>GET /api/health</code> - Health check</li>
            <li><code>GET /api/items</code> - Get all items</li>
            <li><code>GET /api/items/:id</code> - Get item by ID</li>
            <li><code>POST /api/items</code> - Create new item</li>
        </ul>
    </div>
    
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>`
      },
      'static/css/style.css': {
        content: `body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
}

.container {
    width: 80%;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #333;
}

code {
    background-color: #eee;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: monospace;
}`
      },
      'static/js/main.js': {
        content: `// Main JavaScript file for {{projectName}}
console.log('{{projectName}} is running!');

// Example of fetching items from the API
async function fetchItems() {
    try {
        const response = await fetch('/api/items');
        const data = await response.json();
        console.log('Items:', data);
        return data;
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchItems);`
      }
    }
  }
};

export const execute = async (message, args = []) => {
  if (!args || args.length < 2) {
    const templateList = Object.entries(templates)
      .map(([key, template]) => `\`${key}\` - ${template.icon} ${template.name}: ${template.description}`)
      .join('\n');
    
    return message.reply(
      `Please provide a template and project name. Example: \`!generate react-app my-app\`\n\n**Available Templates:**\n${templateList}`
    );
  }

  const templateName = args[0].toLowerCase();
  const projectName = args[1];
  
  // Validate project name (alphanumeric, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9-_]+$/;
  if (!validNameRegex.test(projectName)) {
    return message.reply('Project name must contain only letters, numbers, hyphens, and underscores.');
  }
  
  // Check if template exists
  if (!templates[templateName]) {
    const templateList = Object.keys(templates).join(', ');
    return message.reply(`Unknown template \`${templateName}\`. Available templates: ${templateList}`);
  }
  
  // Set loading status
  const loadingMsg = await message.channel.send(`🔧 Generating ${templates[templateName].name} boilerplate...`);
  
  try {
    // Get template data
    const template = templates[templateName];
    
    // Create a new ZIP file
    const zip = new JSZip();
    
    // Add files to the ZIP
    const rootFolder = zip.folder(projectName);
    
    Object.entries(template.files).forEach(([path, file]) => {
      // Replace template variables in content
      let content = file.content.replace(/\{\{projectName\}\}/g, projectName);
      
      // Split path to handle directories
      const pathParts = path.split('/');
      const fileName = pathParts.pop();
      let currentFolder = rootFolder;
      
      // Create nested folders if needed
      if (pathParts.length > 0) {
        pathParts.forEach(folder => {
          currentFolder = currentFolder.folder(folder);
        });
      }
      
      // Add file to the ZIP
      currentFolder.file(fileName, content);
    });
    
    // Generate the ZIP file
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Create attachment
    const attachment = new AttachmentBuilder(zipContent, { name: `${projectName}.zip` });
    
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`${template.icon} ${template.name} Boilerplate Generated`)
      .setColor('#4CAF50')
      .setDescription(`Your project **${projectName}** has been generated successfully!`)
      .addFields(
        { name: 'Template', value: template.name, inline: true },
        { name: 'Files', value: Object.keys(template.files).length.toString(), inline: true }
      )
      .setFooter({ text: 'Generated with DevHelper Bot', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Delete loading message
    await loadingMsg.delete();
    
    // Send the ZIP file
    return message.reply({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error('Project generation error:', error);
    await loadingMsg.delete();
    return message.reply('An error occurred while generating the project template. Please try again later.');
  }
}; 