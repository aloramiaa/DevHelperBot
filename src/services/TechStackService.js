import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { config } from '../config/config.js';

class TechStackService {
  constructor() {
    this.octokit = new Octokit({
      auth: config.github.token,
    });
    this.axios = axios.create({
      timeout: 10000,
    });
    
    // Define known tech stacks with their emoji badges
    this.techStacks = {
      // JavaScript ecosystem
      'react': { name: 'React', emoji: '⚛️' },
      'vue': { name: 'Vue.js', emoji: '🟢' },
      'angular': { name: 'Angular', emoji: '🔺' },
      'next': { name: 'Next.js', emoji: '▲' },
      'nuxt': { name: 'Nuxt.js', emoji: '🟩' },
      'svelte': { name: 'Svelte', emoji: '🔥' },
      'express': { name: 'Express', emoji: '🚂' },
      'koa': { name: 'Koa', emoji: '🏯' },
      'fastify': { name: 'Fastify', emoji: '🚀' },
      'nest': { name: 'NestJS', emoji: '🐱' },
      'graphql': { name: 'GraphQL', emoji: '📊' },
      'apollo': { name: 'Apollo', emoji: '🚀' },
      'prisma': { name: 'Prisma', emoji: '📱' },
      'sequelize': { name: 'Sequelize', emoji: '🧩' },
      'mongoose': { name: 'Mongoose', emoji: '🍃' },
      'typeorm': { name: 'TypeORM', emoji: '🧬' },
      'jest': { name: 'Jest', emoji: '🃏' },
      'mocha': { name: 'Mocha', emoji: '☕' },
      'cypress': { name: 'Cypress', emoji: '🧪' },
      'puppeteer': { name: 'Puppeteer', emoji: '🤖' },
      'webpack': { name: 'Webpack', emoji: '📦' },
      'babel': { name: 'Babel', emoji: '🔄' },
      'eslint': { name: 'ESLint', emoji: '🧹' },
      'prettier': { name: 'Prettier', emoji: '✨' },
      'typescript': { name: 'TypeScript', emoji: '🔷' },
      'electron': { name: 'Electron', emoji: '⚡' },
      'redux': { name: 'Redux', emoji: '🔄' },
      'mobx': { name: 'MobX', emoji: '🔄' },
      'tailwindcss': { name: 'Tailwind CSS', emoji: '🎨' },
      'styled-components': { name: 'styled-components', emoji: '💅' },
      'sass': { name: 'Sass', emoji: '📝' },
      'less': { name: 'Less', emoji: '📝' },
      
      // Python ecosystem
      'django': { name: 'Django', emoji: '🎸' },
      'flask': { name: 'Flask', emoji: '🧪' },
      'fastapi': { name: 'FastAPI', emoji: '⚡' },
      'pytest': { name: 'pytest', emoji: '🧪' },
      'numpy': { name: 'NumPy', emoji: '🔢' },
      'pandas': { name: 'pandas', emoji: '🐼' },
      'scikit-learn': { name: 'scikit-learn', emoji: '🧠' },
      'tensorflow': { name: 'TensorFlow', emoji: '📊' },
      'pytorch': { name: 'PyTorch', emoji: '🔥' },
      'sqlalchemy': { name: 'SQLAlchemy', emoji: '🧪' },
      'celery': { name: 'Celery', emoji: '🥬' },
      
      // Ruby ecosystem
      'rails': { name: 'Ruby on Rails', emoji: '🛤️' },
      'sinatra': { name: 'Sinatra', emoji: '🎵' },
      'rspec': { name: 'RSpec', emoji: '🧪' },
      
      // PHP ecosystem
      'laravel': { name: 'Laravel', emoji: '🔴' },
      'symfony': { name: 'Symfony', emoji: '🟣' },
      'wordpress': { name: 'WordPress', emoji: '📝' },
      
      // Go ecosystem
      'gin': { name: 'Gin', emoji: '🍸' },
      'echo': { name: 'Echo', emoji: '📢' },
      
      // Java/Kotlin ecosystem
      'spring': { name: 'Spring', emoji: '🌱' },
      'hibernate': { name: 'Hibernate', emoji: '❄️' },
      
      // Databases
      'mongodb': { name: 'MongoDB', emoji: '🍃' },
      'postgresql': { name: 'PostgreSQL', emoji: '🐘' },
      'mysql': { name: 'MySQL', emoji: '🐬' },
      'redis': { name: 'Redis', emoji: '🔴' },
      'sqlite': { name: 'SQLite', emoji: '📁' },
      
      // DevOps
      'docker': { name: 'Docker', emoji: '🐳' },
      'kubernetes': { name: 'Kubernetes', emoji: '☸️' },
      'aws': { name: 'AWS', emoji: '☁️' },
      'azure': { name: 'Azure', emoji: '☁️' },
      'gcp': { name: 'Google Cloud', emoji: '☁️' },
      'travis': { name: 'Travis CI', emoji: '👷' },
      'jenkins': { name: 'Jenkins', emoji: '👨‍🔧' },
      'circle': { name: 'CircleCI', emoji: '⭕' },
      'github-actions': { name: 'GitHub Actions', emoji: '🔄' },
      
      // Mobile
      'react-native': { name: 'React Native', emoji: '📱' },
      'flutter': { name: 'Flutter', emoji: '🦋' },
      'swift': { name: 'Swift', emoji: '🦅' },
      'kotlin': { name: 'Kotlin', emoji: '🤖' },
    };
    
    // Map file patterns to potential technologies
    this.filePatterns = {
      'package.json': { type: 'npm', parser: this.parsePackageJson },
      'requirements.txt': { type: 'python', parser: this.parseRequirementsTxt },
      'Gemfile': { type: 'ruby', parser: this.parseGemfile },
      'composer.json': { type: 'php', parser: this.parseComposerJson },
      'go.mod': { type: 'go', parser: this.parseGoMod },
      'pom.xml': { type: 'java', parser: this.parsePomXml },
      'build.gradle': { type: 'gradle', parser: this.parseBuildGradle },
      'Cargo.toml': { type: 'rust', parser: this.parseCargoToml },
      'Dockerfile': { type: 'docker', parser: this.parseDockerfile },
      '.github/workflows': { type: 'github-actions', parser: null },
      '.travis.yml': { type: 'travis', parser: null },
      'docker-compose.yml': { type: 'docker-compose', parser: null },
    };
  }

  /**
   * Analyzes a GitHub repository to identify its tech stack
   * @param {string} repoUrl - The URL of the GitHub repository (e.g. https://github.com/username/repo)
   * @returns {Promise<Object>} - Tech stack information
   */
  async analyzeTechStack(repoUrl) {
    try {
      // Extract owner and repo name from URL
      const { owner, repo } = this.parseRepoUrl(repoUrl);
      
      if (!owner || !repo) {
        throw new Error('Invalid GitHub repository URL');
      }

      // Get repository information
      const repoInfo = await this.getRepositoryInfo(owner, repo);
      
      // Get tech stack information
      const languages = await this.getLanguages(owner, repo);
      const dependencies = await this.getDependencies(owner, repo);
      const frameworks = this.identifyFrameworks(dependencies);
      const devTools = this.identifyDevTools(dependencies);
      
      return {
        repository: {
          name: repoInfo.name,
          description: repoInfo.description,
          url: repoInfo.html_url,
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          owner: {
            name: repoInfo.owner.login,
            avatarUrl: repoInfo.owner.avatar_url,
          },
        },
        languages,
        frameworks,
        devTools,
        dependencies: this.getNotableDependencies(dependencies),
      };
    } catch (error) {
      console.error('Error analyzing tech stack:', error);
      throw new Error(`Failed to analyze tech stack: ${error.message}`);
    }
  }

  /**
   * Parse a GitHub repository URL to extract owner and repo name
   * @param {string} url - GitHub repository URL
   * @returns {Object} - Repository owner and name
   */
  parseRepoUrl(url) {
    try {
      // Support various GitHub URL formats
      // https://github.com/username/repo
      // http://github.com/username/repo
      // github.com/username/repo
      // username/repo
      
      let path;
      
      if (url.includes('github.com')) {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        path = urlObj.pathname.substring(1); // Remove leading slash
      } else {
        path = url;
      }
      
      const parts = path.split('/');
      
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1].split('#')[0].split('?')[0], // Remove any hash or query params
        };
      }
      
      return { owner: null, repo: null };
    } catch (error) {
      console.error('Error parsing repo URL:', error);
      return { owner: null, repo: null };
    }
  }

  /**
   * Get repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Repository information
   */
  async getRepositoryInfo(owner, repo) {
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });
      
      return data;
    } catch (error) {
      console.error('Error getting repository info:', error);
      throw new Error(`Could not get repository info: ${error.message}`);
    }
  }

  /**
   * Get languages used in the repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Languages with their percentage
   */
  async getLanguages(owner, repo) {
    try {
      const { data } = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });
      
      // Calculate percentages
      const total = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
      const languages = {};
      
      for (const [lang, bytes] of Object.entries(data)) {
        languages[lang] = {
          bytes,
          percentage: Math.round((bytes / total) * 100),
        };
      }
      
      return languages;
    } catch (error) {
      console.error('Error getting languages:', error);
      return {};
    }
  }

  /**
   * Get dependencies from package.json, requirements.txt, etc.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} - Dependencies by type
   */
  async getDependencies(owner, repo) {
    try {
      const dependencies = {
        node: {},
        python: {},
        ruby: {},
        php: {},
        java: {},
        dotnet: {},
      };
      
      // Check for package.json (Node.js)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'package.json',
        });
        
        if (data) {
          const content = Buffer.from(data.content, 'base64').toString();
          const packageJson = JSON.parse(content);
          
          dependencies.node = {
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
          };
        }
      } catch (error) {
        // package.json not found, skip
      }
      
      // Check for requirements.txt (Python)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'requirements.txt',
        });
        
        if (data) {
          const content = Buffer.from(data.content, 'base64').toString();
          const lines = content.split('\n');
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const [name, version] = trimmed.split('==');
              dependencies.python[name.trim()] = version || '*';
            }
          }
        }
      } catch (error) {
        // requirements.txt not found, skip
      }
      
      // Check for composer.json (PHP)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'composer.json',
        });
        
        if (data) {
          const content = Buffer.from(data.content, 'base64').toString();
          const composerJson = JSON.parse(content);
          
          dependencies.php = {
            require: composerJson.require || {},
            'require-dev': composerJson['require-dev'] || {},
          };
        }
      } catch (error) {
        // composer.json not found, skip
      }
      
      // Check for pom.xml (Java)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'pom.xml',
        });
        
        if (data) {
          dependencies.java.maven = true;
        }
      } catch (error) {
        // pom.xml not found, skip
      }
      
      // Check for build.gradle (Java)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'build.gradle',
        });
        
        if (data) {
          dependencies.java.gradle = true;
        }
      } catch (error) {
        // build.gradle not found, skip
      }
      
      // Check for Gemfile (Ruby)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: 'Gemfile',
        });
        
        if (data) {
          const content = Buffer.from(data.content, 'base64').toString();
          const lines = content.split('\n');
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('gem ')) {
              const parts = trimmed.substring(4).split(',');
              const name = parts[0].replace(/['"]/g, '').trim();
              dependencies.ruby[name] = true;
            }
          }
        }
      } catch (error) {
        // Gemfile not found, skip
      }
      
      // Check for .csproj or .sln (.NET)
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: '',
        });
        
        if (Array.isArray(data)) {
          for (const file of data) {
            if (file.name.endsWith('.csproj') || file.name.endsWith('.sln')) {
              dependencies.dotnet.detected = true;
              break;
            }
          }
        }
      } catch (error) {
        // Root directory not accessible, skip
      }
      
      return dependencies;
    } catch (error) {
      console.error('Error getting dependencies:', error);
      return {};
    }
  }

  /**
   * Identify frameworks based on dependencies
   * @param {Object} dependencies - Dependencies by language
   * @returns {Object} - Frameworks used
   */
  identifyFrameworks(dependencies) {
    const frameworks = {};
    
    // Node.js frameworks
    if (dependencies.node.dependencies) {
      const nodeDeps = {
        ...dependencies.node.dependencies,
        ...dependencies.node.devDependencies,
      };
      
      // React
      if (nodeDeps.react) {
        frameworks.react = true;
        
        // Next.js
        if (nodeDeps.next) {
          frameworks.nextjs = true;
        }
        
        // Gatsby
        if (nodeDeps.gatsby) {
          frameworks.gatsby = true;
        }
      }
      
      // Vue.js
      if (nodeDeps.vue) {
        frameworks.vue = true;
        
        // Nuxt.js
        if (nodeDeps.nuxt) {
          frameworks.nuxtjs = true;
        }
      }
      
      // Angular
      if (nodeDeps['@angular/core']) {
        frameworks.angular = true;
      }
      
      // Express
      if (nodeDeps.express) {
        frameworks.express = true;
      }
      
      // Nest.js
      if (nodeDeps['@nestjs/core']) {
        frameworks.nestjs = true;
      }
      
      // Fastify
      if (nodeDeps.fastify) {
        frameworks.fastify = true;
      }
      
      // Electron
      if (nodeDeps.electron) {
        frameworks.electron = true;
      }
    }
    
    // Python frameworks
    if (Object.keys(dependencies.python).length > 0) {
      const pythonDeps = dependencies.python;
      
      // Django
      if (pythonDeps.django) {
        frameworks.django = true;
      }
      
      // Flask
      if (pythonDeps.flask) {
        frameworks.flask = true;
      }
      
      // FastAPI
      if (pythonDeps.fastapi) {
        frameworks.fastapi = true;
      }
      
      // Pyramid
      if (pythonDeps.pyramid) {
        frameworks.pyramid = true;
      }
    }
    
    // PHP frameworks
    if (dependencies.php.require) {
      const phpDeps = {
        ...dependencies.php.require,
        ...dependencies.php['require-dev'],
      };
      
      // Laravel
      if (phpDeps['laravel/framework']) {
        frameworks.laravel = true;
      }
      
      // Symfony
      if (phpDeps['symfony/symfony'] || phpDeps['symfony/framework-bundle']) {
        frameworks.symfony = true;
      }
    }
    
    // Ruby frameworks
    if (Object.keys(dependencies.ruby).length > 0) {
      const rubyDeps = dependencies.ruby;
      
      // Ruby on Rails
      if (rubyDeps.rails) {
        frameworks.rails = true;
      }
      
      // Sinatra
      if (rubyDeps.sinatra) {
        frameworks.sinatra = true;
      }
    }
    
    return frameworks;
  }

  /**
   * Identify development tools based on dependencies
   * @param {Object} dependencies - Dependencies by language
   * @returns {Object} - Development tools used
   */
  identifyDevTools(dependencies) {
    const devTools = {};
    
    // Node.js dev tools
    if (dependencies.node.devDependencies) {
      const nodeDeps = dependencies.node.devDependencies;
      
      // Testing
      if (nodeDeps.jest) devTools.jest = true;
      if (nodeDeps.mocha) devTools.mocha = true;
      if (nodeDeps.cypress) devTools.cypress = true;
      if (nodeDeps['@testing-library/react']) devTools.testingLibrary = true;
      
      // Linting
      if (nodeDeps.eslint) devTools.eslint = true;
      if (nodeDeps.prettier) devTools.prettier = true;
      
      // Build tools
      if (nodeDeps.webpack) devTools.webpack = true;
      if (nodeDeps.rollup) devTools.rollup = true;
      if (nodeDeps.parcel) devTools.parcel = true;
      if (nodeDeps.vite) devTools.vite = true;
      
      // TypeScript
      if (nodeDeps.typescript) devTools.typescript = true;
      
      // Storybook
      if (nodeDeps['@storybook/react'] || nodeDeps['@storybook/vue']) {
        devTools.storybook = true;
      }
    }
    
    // Python dev tools
    if (Object.keys(dependencies.python).length > 0) {
      const pythonDeps = dependencies.python;
      
      // Testing
      if (pythonDeps.pytest) devTools.pytest = true;
      if (pythonDeps.unittest) devTools.unittest = true;
      
      // Linting
      if (pythonDeps.pylint) devTools.pylint = true;
      if (pythonDeps.flake8) devTools.flake8 = true;
      if (pythonDeps.black) devTools.black = true;
    }
    
    return devTools;
  }

  /**
   * Get notable dependencies from all dependency lists
   * @param {Object} dependencies - Dependencies by language
   * @returns {Object} - Notable dependencies categorized
   */
  getNotableDependencies(dependencies) {
    const notable = {
      database: {},
      stateManagement: {},
      ui: {},
      api: {},
      auth: {},
      utilities: {},
    };
    
    // Node.js dependencies
    if (dependencies.node.dependencies) {
      const nodeDeps = {
        ...dependencies.node.dependencies,
        ...dependencies.node.devDependencies,
      };
      
      // Database
      if (nodeDeps.mongoose || nodeDeps.mongodb) notable.database.mongodb = true;
      if (nodeDeps.sequelize || nodeDeps.mysql || nodeDeps.mysql2) notable.database.mysql = true;
      if (nodeDeps.pg || nodeDeps.postgres || nodeDeps.postgresql) notable.database.postgresql = true;
      if (nodeDeps.prisma) notable.database.prisma = true;
      if (nodeDeps.typeorm) notable.database.typeorm = true;
      
      // State Management
      if (nodeDeps.redux) notable.stateManagement.redux = true;
      if (nodeDeps.mobx) notable.stateManagement.mobx = true;
      if (nodeDeps.zustand) notable.stateManagement.zustand = true;
      if (nodeDeps.recoil) notable.stateManagement.recoil = true;
      
      // UI
      if (nodeDeps['@mui/material'] || nodeDeps['@material-ui/core']) notable.ui.materialUI = true;
      if (nodeDeps['@chakra-ui/react']) notable.ui.chakraUI = true;
      if (nodeDeps.tailwindcss) notable.ui.tailwind = true;
      if (nodeDeps.bootstrap) notable.ui.bootstrap = true;
      if (nodeDeps['styled-components']) notable.ui.styledComponents = true;
      
      // API
      if (nodeDeps.axios) notable.api.axios = true;
      if (nodeDeps['react-query']) notable.api.reactQuery = true;
      if (nodeDeps.swr) notable.api.swr = true;
      if (nodeDeps.graphql) notable.api.graphql = true;
      if (nodeDeps.apollo || nodeDeps['@apollo/client']) notable.api.apollo = true;
      
      // Auth
      if (nodeDeps['next-auth']) notable.auth.nextAuth = true;
      if (nodeDeps['@auth0/auth0-react']) notable.auth.auth0 = true;
      if (nodeDeps.passport) notable.auth.passport = true;
      if (nodeDeps.firebase) notable.auth.firebase = true;
      
      // Utilities
      if (nodeDeps.lodash) notable.utilities.lodash = true;
      if (nodeDeps.moment || nodeDeps['date-fns']) notable.utilities.dateUtils = true;
      if (nodeDeps['react-hook-form']) notable.utilities.reactHookForm = true;
      if (nodeDeps.formik) notable.utilities.formik = true;
    }
    
    // Python dependencies
    if (Object.keys(dependencies.python).length > 0) {
      const pythonDeps = dependencies.python;
      
      // Database
      if (pythonDeps.sqlalchemy) notable.database.sqlalchemy = true;
      if (pythonDeps.pymongo) notable.database.mongodb = true;
      if (pythonDeps.psycopg2) notable.database.postgresql = true;
      
      // API
      if (pythonDeps.requests) notable.api.requests = true;
      if (pythonDeps.graphene) notable.api.graphql = true;
    }
    
    return notable;
  }

  /**
   * Parse package.json to identify npm dependencies
   * @param {Object} content - File content
   * @returns {Object} - Identified technologies
   */
  parsePackageJson(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    let data;
    if (typeof content === 'string') {
      try {
        data = JSON.parse(content);
      } catch (error) {
        console.warn('Error parsing package.json:', error.message);
        return result;
      }
    } else {
      data = content;
    }
    
    // Process dependencies
    if (data.dependencies) {
      for (const [dep] of Object.entries(data.dependencies)) {
        const tech = this.categorizeDependency(dep);
        result[tech.category].push(tech.name);
      }
    }
    
    // Process devDependencies
    if (data.devDependencies) {
      for (const [dep] of Object.entries(data.devDependencies)) {
        result.devTools.push(dep);
      }
    }
    
    // Check for specific frameworks from package.json
    if (data.dependencies) {
      if (data.dependencies.react) {
        result.frameworks.push('react');
      }
      if (data.dependencies.vue) {
        result.frameworks.push('vue');
      }
      if (data.dependencies['@angular/core']) {
        result.frameworks.push('angular');
      }
      if (data.dependencies.express) {
        result.frameworks.push('express');
      }
      if (data.dependencies.next) {
        result.frameworks.push('next');
      }
      if (data.dependencies.nuxt) {
        result.frameworks.push('nuxt');
      }
    }
    
    return result;
  }

  /**
   * Categorize npm dependency as framework, tool, or regular dependency
   * @param {string} dependency - Dependency name
   * @returns {Object} - Categorized dependency
   */
  categorizeDependency(dependency) {
    // Frameworks
    const frameworks = [
      'react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 
      'express', 'koa', 'fastify', 'nest', 'hapi',
      'meteor', 'gatsby', 'electron'
    ];
    
    // Dev tools
    const devTools = [
      'webpack', 'babel', 'eslint', 'prettier', 'jest', 'mocha',
      'chai', 'cypress', 'puppeteer', 'storybook', 'rollup', 'parcel'
    ];
    
    const lowerDep = dependency.toLowerCase();
    
    if (frameworks.some(f => lowerDep.includes(f))) {
      return { name: dependency, category: 'frameworks' };
    } else if (devTools.some(t => lowerDep.includes(t))) {
      return { name: dependency, category: 'devTools' };
    } else {
      return { name: dependency, category: 'dependencies' };
    }
  }

  /**
   * Parse requirements.txt to identify Python dependencies
   * @param {string} content - File content
   * @returns {Object} - Identified technologies
   */
  parseRequirementsTxt(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    // Common Python frameworks and their categories
    const frameworks = ['django', 'flask', 'fastapi', 'pyramid', 'tornado', 'falcon'];
    const dataScience = ['numpy', 'pandas', 'scikit-learn', 'tensorflow', 'pytorch', 'keras'];
    const devTools = ['pytest', 'nose', 'flake8', 'black', 'mypy', 'pylint'];
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) {
        continue;
      }
      
      // Extract the package name (without version)
      let packageName = line.split('==')[0].split('>=')[0].split('<=')[0].trim().toLowerCase();
      
      // Remove any extras
      packageName = packageName.split('[')[0];
      
      if (packageName) {
        if (frameworks.includes(packageName)) {
          result.frameworks.push(packageName);
        } else if (dataScience.includes(packageName)) {
          result.frameworks.push(packageName);
        } else if (devTools.includes(packageName)) {
          result.devTools.push(packageName);
        } else {
          result.dependencies.push(packageName);
        }
      }
    }
    
    return result;
  }

  /**
   * Parse Gemfile to identify Ruby dependencies
   * @param {string} content - File content
   * @returns {Object} - Identified technologies
   */
  parseGemfile(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    // Common Ruby frameworks and tools
    const frameworks = ['rails', 'sinatra', 'hanami', 'roda', 'grape', 'padrino'];
    const devTools = ['rspec', 'minitest', 'cucumber', 'rubocop', 'capybara', 'factory_bot'];
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) {
        continue;
      }
      
      // Extract the gem name
      const gemMatch = line.match(/gem ['"]([^'"]+)['"]/);
      if (gemMatch) {
        const gemName = gemMatch[1].toLowerCase();
        
        if (frameworks.includes(gemName)) {
          result.frameworks.push(gemName);
        } else if (devTools.includes(gemName)) {
          result.devTools.push(gemName);
        } else {
          result.dependencies.push(gemName);
        }
      }
    }
    
    return result;
  }

  /**
   * Parse composer.json to identify PHP dependencies
   * @param {Object} content - File content
   * @returns {Object} - Identified technologies
   */
  parseComposerJson(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    let data;
    if (typeof content === 'string') {
      try {
        data = JSON.parse(content);
      } catch (error) {
        console.warn('Error parsing composer.json:', error.message);
        return result;
      }
    } else {
      data = content;
    }
    
    // Common PHP frameworks and tools
    const frameworks = ['laravel', 'symfony', 'slim', 'lumen', 'yii', 'cakephp', 'codeigniter'];
    const devTools = ['phpunit', 'phpstan', 'psalm', 'phpcs', 'phpmd'];
    
    // Process require
    if (data.require) {
      for (const [dep] of Object.entries(data.require)) {
        // Skip php itself
        if (dep === 'php') continue;
        
        const packageName = dep.toLowerCase();
        const packageParts = packageName.split('/');
        
        if (packageParts.length > 1) {
          const vendorName = packageParts[0];
          const libName = packageParts[1];
          
          if (frameworks.includes(libName) || frameworks.includes(vendorName)) {
            result.frameworks.push(packageName);
          } else {
            result.dependencies.push(packageName);
          }
        } else {
          result.dependencies.push(packageName);
        }
      }
    }
    
    // Process require-dev
    if (data['require-dev']) {
      for (const [dep] of Object.entries(data['require-dev'])) {
        // Skip php itself
        if (dep === 'php') continue;
        
        const packageName = dep.toLowerCase();
        const packageParts = packageName.split('/');
        
        if (packageParts.length > 1) {
          const libName = packageParts[1];
          
          if (devTools.includes(libName)) {
            result.devTools.push(packageName);
          } else {
            result.devTools.push(packageName);
          }
        } else {
          result.devTools.push(packageName);
        }
      }
    }
    
    return result;
  }

  /**
   * Parse go.mod to identify Go dependencies
   * @param {string} content - File content
   * @returns {Object} - Identified technologies
   */
  parseGoMod(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    // Common Go frameworks and libraries
    const frameworks = ['gin', 'echo', 'fiber', 'buffalo', 'chi', 'beego', 'kit'];
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments, empty lines and the module declaration
      if (line.trim().startsWith('//') || !line.trim() || line.trim().startsWith('module ')) {
        continue;
      }
      
      // Extract the dependency
      const requireMatch = line.match(/^\s*require\s+([^\s]+)\s+/);
      if (requireMatch) {
        const depName = requireMatch[1].toLowerCase();
        result.dependencies.push(depName);
        
        // Check if it's a known framework
        for (const framework of frameworks) {
          if (depName.includes('/' + framework)) {
            result.frameworks.push(framework);
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Get formatted tech stack with emoji badges
   * @param {Object} stackData - Tech stack data
   * @returns {Object} - Formatted tech stack with emoji badges
   */
  getFormattedTechStack(stackData) {
    const formatted = {
      languages: [],
      frameworks: [],
      dependencies: [],
      devTools: []
    };
    
    // Format languages
    if (stackData.languages && stackData.languages.length > 0) {
      formatted.languages = stackData.languages.map(lang => {
        return {
          name: lang.name,
          emoji: this.getLanguageEmoji(lang.name),
          percentage: lang.percentage,
          formatted: `${this.getLanguageEmoji(lang.name)} ${lang.name} (${lang.percentage}%)`
        };
      });
    }
    
    // Format frameworks
    if (stackData.frameworks && stackData.frameworks.length > 0) {
      formatted.frameworks = stackData.frameworks.map(framework => {
        const tech = this.getTechInfo(framework);
        return {
          name: tech.name,
          emoji: tech.emoji,
          formatted: `${tech.emoji} ${tech.name}`
        };
      });
    }
    
    // Format dependencies (limit to avoid overwhelming)
    if (stackData.dependencies && stackData.dependencies.length > 0) {
      formatted.dependencies = stackData.dependencies
        .slice(0, 15)
        .map(dep => {
          const tech = this.getTechInfo(dep);
          return {
            name: tech.name,
            emoji: tech.emoji,
            formatted: `${tech.emoji} ${tech.name}`
          };
        });
    }
    
    // Format dev tools
    if (stackData.devTools && stackData.devTools.length > 0) {
      formatted.devTools = stackData.devTools.map(tool => {
        const tech = this.getTechInfo(tool);
        return {
          name: tech.name,
          emoji: tech.emoji,
          formatted: `${tech.emoji} ${tech.name}`
        };
      });
    }
    
    return formatted;
  }

  /**
   * Get tech info with emoji badge
   * @param {string} tech - Technology name
   * @returns {Object} - Tech info with emoji badge
   */
  getTechInfo(tech) {
    const lowerTech = tech.toLowerCase();
    
    // Check if we have a predefined tech stack
    for (const [key, value] of Object.entries(this.techStacks)) {
      if (lowerTech.includes(key)) {
        return value;
      }
    }
    
    // Default to package icon for unknown technologies
    return {
      name: tech,
      emoji: '📦'
    };
  }

  /**
   * Get emoji for a programming language
   * @param {string} language - Programming language name
   * @returns {string} - Emoji for the language
   */
  getLanguageEmoji(language) {
    const langEmojis = {
      'JavaScript': '📜',
      'TypeScript': '🔷',
      'Python': '🐍',
      'Java': '☕',
      'C#': '🔶',
      'C++': '⚡',
      'C': '⚙️',
      'Go': '🦦',
      'Ruby': '💎',
      'PHP': '🐘',
      'Swift': '🦅',
      'Kotlin': '🤖',
      'Rust': '🦀',
      'Scala': '🔥',
      'Dart': '🎯',
      'HTML': '📄',
      'CSS': '🎨',
      'Shell': '🐚',
      'PowerShell': '💙',
      'Elixir': '💧',
      'Clojure': '🔮',
      'Haskell': '🧠',
      'R': '📊',
      'MATLAB': '📈'
    };
    
    return langEmojis[language] || '💻';
  }

  /**
   * Parse pom.xml to identify Java dependencies (simplified)
   * @param {string} content - File content
   * @returns {Object} - Identified technologies
   */
  parsePomXml(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    // Common Java frameworks and tools
    const frameworks = ['spring', 'hibernate', 'quarkus', 'micronaut', 'jakarta', 'struts'];
    const devTools = ['junit', 'mockito', 'assertj', 'jacoco'];
    
    // Very simple regex-based parsing (not reliable for all pom.xml structures)
    const artifactIdRegex = /<artifactId>([^<]+)<\/artifactId>/g;
    let match;
    
    while ((match = artifactIdRegex.exec(content)) !== null) {
      const artifactId = match[1].toLowerCase();
      
      if (frameworks.some(f => artifactId.includes(f))) {
        result.frameworks.push(artifactId);
      } else if (devTools.some(t => artifactId.includes(t))) {
        result.devTools.push(artifactId);
      } else {
        result.dependencies.push(artifactId);
      }
    }
    
    return result;
  }

  /**
   * Parse build.gradle to identify dependencies (simplified)
   * @param {string} content - File content
   * @returns {Object} - Identified technologies
   */
  parseBuildGradle(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    const frameworks = ['spring', 'hibernate', 'micronaut', 'quarkus', 'ktor'];
    const devTools = ['junit', 'mockito', 'assertj', 'jacoco', 'spock'];
    
    // Simple regex to find dependencies
    const dependencyRegex = /implementation\s+['"]([\w.-]+:[\w.-]+:[\w.-]+)['"]/g;
    let match;
    
    while ((match = dependencyRegex.exec(content)) !== null) {
      const dep = match[1].toLowerCase();
      
      if (frameworks.some(f => dep.includes(f))) {
        result.frameworks.push(dep);
      } else if (devTools.some(t => dep.includes(t))) {
        result.devTools.push(dep);
      } else {
        result.dependencies.push(dep);
      }
    }
    
    return result;
  }

  /**
   * Parse Cargo.toml to identify Rust dependencies
   * @param {string} content - File content
   * @returns {Object} - Identified technologies
   */
  parseCargoToml(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: []
    };
    
    const frameworks = ['actix', 'rocket', 'warp', 'tokio', 'async-std', 'yew', 'diesel'];
    const devTools = ['criterion', 'proptest', 'mockall', 'cargo-tarpaulin'];
    
    // Parse dependencies section
    const depSection = content.match(/\[dependencies\]([\s\S]*?)(\[|\Z)/);
    
    if (depSection) {
      const depLines = depSection[1].split('\n');
      
      for (const line of depLines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Extract dependency name
        const depMatch = line.match(/^([\w-]+)/);
        if (depMatch) {
          const dep = depMatch[1].toLowerCase();
          
          if (frameworks.includes(dep)) {
            result.frameworks.push(dep);
          } else {
            result.dependencies.push(dep);
          }
        }
      }
    }
    
    // Parse dev-dependencies section
    const devDepSection = content.match(/\[dev-dependencies\]([\s\S]*?)(\[|\Z)/);
    
    if (devDepSection) {
      const devDepLines = devDepSection[1].split('\n');
      
      for (const line of devDepLines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Extract dependency name
        const depMatch = line.match(/^([\w-]+)/);
        if (depMatch) {
          result.devTools.push(depMatch[1].toLowerCase());
        }
      }
    }
    
    return result;
  }

  /**
   * Simple Dockerfile parser to identify technologies
   * @param {string} content - Dockerfile content
   * @returns {Object} - Identified technologies
   */
  parseDockerfile(content) {
    const result = {
      dependencies: [],
      frameworks: [],
      devTools: ['docker']
    };
    
    // Extract base image
    const fromMatch = content.match(/FROM\s+([^\s:]+)/i);
    if (fromMatch) {
      const baseImage = fromMatch[1].toLowerCase();
      result.dependencies.push(baseImage);
    }
    
    return result;
  }
}

export default TechStackService; 