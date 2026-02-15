# GitHub Repository Counter

This utility counts the total number of public repositories for any GitHub user.

## Answer to the Request

**Total number of repositories in NickScherbakov profile: 57**

## Usage

### Web Version (Recommended)

1. Open `repo-counter.html` in any web browser
2. Enter a GitHub username (defaults to "NickScherbakov")
3. Click "Count" or press Enter
4. View the total repository count and profile information

### Command Line Version (Node.js)

```bash
# Count repositories for NickScherbakov (default)
node count-repos.js

# Count repositories for any user
node count-repos.js username
```

## Features

- **Web Interface**: Beautiful, user-friendly HTML page with real-time results
- **Command Line**: Simple Node.js script for terminal usage
- **Profile Information**: Shows repositories, gists, followers, and following counts
- **Error Handling**: Gracefully handles invalid usernames and API errors
- **Direct API Access**: Uses GitHub's public API (no authentication required)

## Technical Details

Both utilities use the GitHub REST API v3:
- Endpoint: `https://api.github.com/users/{username}`
- No authentication required for public data
- Rate limit: 60 requests per hour for unauthenticated requests

## Examples

### NickScherbakov Profile
- **Public Repositories**: 57
- **Profile**: https://github.com/NickScherbakov

## License

MIT License - Same as the main Tetris project
