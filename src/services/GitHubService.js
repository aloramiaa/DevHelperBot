import axios from 'axios';
import { config } from '../config/config.js';

export default class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(config.githubToken ? { 'Authorization': `token ${config.githubToken}` } : {})
      }
    });
  }

  /**
   * Get basic user information
   * @param {string} username - GitHub username
   * @returns {Promise<Object>} - User information
   */
  async getUserInfo(username) {
    try {
      const response = await this.client.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching GitHub user info for ${username}:`, error);
      throw new Error(`Could not fetch GitHub user information: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get user repositories
   * @param {string} username - GitHub username
   * @param {Object} options - Options for fetching repositories
   * @param {number} options.per_page - Number of repos per page
   * @param {number} options.page - Page number
   * @returns {Promise<Array>} - List of repositories
   */
  async getUserRepos(username, options = {}) {
    const { per_page = 100, page = 1 } = options;
    
    try {
      const response = await this.client.get(`/users/${username}/repos`, {
        params: { per_page, page, sort: 'updated' }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching GitHub repositories for ${username}:`, error);
      throw new Error(`Could not fetch GitHub repositories: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get user's contribution stats
   * @param {string} username - GitHub username
   * @returns {Promise<Object>} - User contribution stats
   */
  async getUserContributions(username) {
    try {
      // Get user's repositories
      const repos = await this.getUserRepos(username);
      
      // Count repositories
      const repoCount = repos.length;
      
      // Get top languages
      const languages = {};
      let totalSize = 0;
      
      for (const repo of repos) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + repo.size;
          totalSize += repo.size;
        }
      }
      
      // Convert to percentage and sort
      const topLanguages = Object.entries(languages).map(([name, size]) => ({
        name,
        percentage: Math.round((size / totalSize) * 1000) / 10, // Round to 1 decimal
        size
      })).sort((a, b) => b.size - a.size);
      
      // Get commit activity (we can only get this for individual repos)
      // For simplicity, we'll use the 5 most recently updated repos
      const recentRepos = repos.slice(0, 5);
      const commitActivity = await this.getCommitActivity(username, recentRepos);
      
      return {
        username,
        repoCount,
        topLanguages: topLanguages.slice(0, 10), // Top 10 languages
        commitActivity,
        mostActiveDay: this.getMostActiveDay(commitActivity),
        mostActiveTime: this.getMostActiveTime(commitActivity)
      };
    } catch (error) {
      console.error(`Error analyzing GitHub contributions for ${username}:`, error);
      throw new Error(`Could not analyze GitHub contributions: ${error.message}`);
    }
  }

  /**
   * Get commit activity for repositories
   * @param {string} username - GitHub username
   * @param {Array} repos - List of repositories
   * @returns {Promise<Object>} - Commit activity data
   */
  async getCommitActivity(username, repos) {
    const commitData = {
      total: 0,
      byDay: [0, 0, 0, 0, 0, 0, 0], // Sun, Mon, Tue, Wed, Thu, Fri, Sat
      byHour: Array(24).fill(0),
      byRepo: {}
    };
    
    try {
      for (const repo of repos) {
        if (repo.fork) continue; // Skip forked repositories
        
        // Get commit stats for this repo
        try {
          const stats = await this.client.get(
            `/repos/${repo.owner.login}/${repo.name}/stats/punch_card`
          );
          
          // Stats format is [day, hour, commits]
          for (const [day, hour, commits] of stats.data) {
            commitData.total += commits;
            commitData.byDay[day] += commits;
            commitData.byHour[hour] += commits;
            
            // Store by repo as well
            if (!commitData.byRepo[repo.name]) {
              commitData.byRepo[repo.name] = 0;
            }
            commitData.byRepo[repo.name] += commits;
          }
        } catch (err) {
          console.warn(`Could not get commit stats for ${repo.name}:`, err.message);
        }
      }
      
      return commitData;
    } catch (error) {
      console.error(`Error fetching commit activity for ${username}:`, error);
      return commitData;
    }
  }

  /**
   * Get the most active day of the week
   * @param {Object} commitActivity - Commit activity data
   * @returns {Object} - Most active day info
   */
  getMostActiveDay(commitActivity) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let maxCommits = 0;
    let mostActiveDay = 0;
    
    commitActivity.byDay.forEach((commits, day) => {
      if (commits > maxCommits) {
        maxCommits = commits;
        mostActiveDay = day;
      }
    });
    
    return {
      day: days[mostActiveDay],
      dayIndex: mostActiveDay,
      commits: maxCommits
    };
  }

  /**
   * Get the most active time of day
   * @param {Object} commitActivity - Commit activity data
   * @returns {Object} - Most active time info
   */
  getMostActiveTime(commitActivity) {
    let maxCommits = 0;
    let mostActiveHour = 0;
    
    commitActivity.byHour.forEach((commits, hour) => {
      if (commits > maxCommits) {
        maxCommits = commits;
        mostActiveHour = hour;
      }
    });
    
    // Format hour as 12-hour time
    const hour12 = mostActiveHour % 12 || 12;
    const period = mostActiveHour < 12 ? 'AM' : 'PM';
    
    return {
      hour: mostActiveHour,
      formatted: `${hour12}:00 ${period}`,
      commits: maxCommits
    };
  }

  /**
   * Find good first issues for a specific project or topic
   * @param {Object} options - Search options
   * @param {string} options.query - The search query (repo name, topic, etc.)
   * @param {number} options.limit - Maximum number of issues to return
   * @param {string[]} options.labels - Labels to filter by (defaults to beginner-friendly labels)
   * @returns {Promise<Array>} - List of good first issues
   */
  async findGoodFirstIssues(options = {}) {
    const { 
      query, 
      limit = 10, 
      labels = ['good first issue', 'good-first-issue', 'beginner friendly', 'beginner', 'easy', 'starter']
    } = options;
    
    if (!query) {
      throw new Error('Search query is required');
    }
    
    try {
      // Construct the GitHub search query
      // Format: "repo:owner/repo label:good-first-issue state:open" OR "topic:javascript label:good-first-issue state:open"
      let searchQuery = '';
      
      // Check if query is a repo name (contains /)
      if (query.includes('/')) {
        searchQuery = `repo:${query}`;
      } 
      // Otherwise treat it as a topic
      else {
        searchQuery = `topic:${query}`;
      }
      
      // Add labels to the search query
      const labelQuery = labels.map(label => `label:"${label}"`).join(' OR ');
      searchQuery += ` (${labelQuery})`;
      
      // Add state:open to only get open issues
      searchQuery += ' state:open';
      
      // Call the GitHub search API
      const response = await this.client.get('/search/issues', {
        params: {
          q: searchQuery,
          per_page: limit,
          sort: 'created',
          order: 'desc'
        }
      });
      
      // Process the issues
      const issues = response.data.items.map(item => {
        // Extract the repository name from the repository_url
        const repoUrl = item.repository_url;
        const repoName = repoUrl.replace('https://api.github.com/repos/', '');
        
        // Calculate how long ago the issue was created
        const createdAt = new Date(item.created_at);
        const now = new Date();
        const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        
        let timeAgo;
        if (diffDays === 0) {
          timeAgo = 'today';
        } else if (diffDays === 1) {
          timeAgo = 'yesterday';
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          timeAgo = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
          const months = Math.floor(diffDays / 30);
          timeAgo = `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
        
        return {
          title: item.title,
          number: item.number,
          url: item.html_url,
          repoName,
          repoUrl: `https://github.com/${repoName}`,
          createdAt: item.created_at,
          timeAgo,
          labels: item.labels.map(label => ({
            name: label.name,
            color: label.color
          })),
          commentsCount: item.comments
        };
      });
      
      return {
        totalCount: response.data.total_count,
        issues
      };
      
    } catch (error) {
      console.error(`Error finding good first issues for '${query}':`, error);
      throw new Error(`Could not find good first issues: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate a URL for a chart showing top languages
   * @param {Array} topLanguages - Top languages data
   * @returns {string} - QuickChart.io URL
   */
  generateLanguagesChartUrl(topLanguages) {
    // Limit to top 6 languages for readability
    const displayLanguages = topLanguages.slice(0, 6);
    
    // Add "Other" category if needed
    if (topLanguages.length > 6) {
      const otherPercentage = topLanguages.slice(6).reduce((sum, lang) => sum + lang.percentage, 0);
      displayLanguages.push({ name: 'Other', percentage: otherPercentage });
    }
    
    const chartData = {
      type: 'doughnut',
      data: {
        labels: displayLanguages.map(lang => lang.name),
        datasets: [{
          data: displayLanguages.map(lang => lang.percentage),
          backgroundColor: [
            '#2ecc71',
            '#3498db',
            '#9b59b6',
            '#e74c3c',
            '#f1c40f',
            '#1abc9c',
            '#95a5a6'
          ]
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Top Languages (%)'
          },
          doughnutlabel: {
            labels: [{
              text: 'Languages',
              font: { size: 20 }
            }]
          }
        }
      }
    };
    
    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  }

  /**
   * Generate a URL for a chart showing commit activity by day
   * @param {Object} commitActivity - Commit activity data
   * @returns {string} - QuickChart.io URL
   */
  generateCommitActivityChartUrl(commitActivity) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const chartData = {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Commits',
          data: commitActivity.byDay,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Commit Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Day of Week'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Commit Activity by Day'
          }
        }
      }
    };
    
    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  }

  /**
   * Generate a URL for a chart showing commit activity by hour
   * @param {Object} commitActivity - Commit activity data
   * @returns {string} - QuickChart.io URL
   */
  generateHourlyCommitChartUrl(commitActivity) {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour12 = i % 12 || 12;
      const period = i < 12 ? 'AM' : 'PM';
      return `${hour12}${period}`;
    });
    
    const chartData = {
      type: 'line',
      data: {
        labels: hours,
        datasets: [{
          label: 'Commits',
          data: commitActivity.byHour,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Commit Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Hour of Day'
            },
            ticks: {
              maxRotation: 90,
              minRotation: 45
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Commit Activity by Hour'
          }
        }
      }
    };
    
    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  }
} 