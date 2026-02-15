#!/usr/bin/env node

/**
 * GitHub Repository Counter
 * 
 * This script counts the total number of repositories for a GitHub user.
 * 
 * Usage: node count-repos.js [username]
 * If no username is provided, defaults to 'NickScherbakov'
 */

async function countGitHubRepositories(username) {
    try {
        const url = `https://api.github.com/users/${username}`;
        
        console.log(`Fetching repository count for user: ${username}...`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'GitHub-Repo-Counter',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`User '${username}' not found`);
            }
            throw new Error(`GitHub API returned status ${response.status}`);
        }
        
        const userData = await response.json();
        
        console.log('\n=== GitHub Profile Summary ===');
        console.log(`User: ${userData.login}`);
        console.log(`Name: ${userData.name || 'N/A'}`);
        console.log(`Public Repositories: ${userData.public_repos}`);
        console.log(`Public Gists: ${userData.public_gists}`);
        console.log(`Followers: ${userData.followers}`);
        console.log(`Following: ${userData.following}`);
        console.log(`Profile: ${userData.html_url}`);
        console.log('==============================\n');
        
        return userData.public_repos;
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Main execution
const username = process.argv[2] || 'NickScherbakov';
countGitHubRepositories(username)
    .then(count => {
        console.log(`✓ Total public repositories: ${count}`);
    })
    .catch(error => {
        console.error('Failed to count repositories:', error);
        process.exit(1);
    });
