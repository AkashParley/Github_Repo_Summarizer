// server/services/gitService.js
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildAuthenticatedGitHubUrl = (repoUrl) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return repoUrl;

    try {
        const urlObj = new URL(repoUrl);

        // Only inject token for HTTPS GitHub URLs that don't already include credentials
        if (
            urlObj.protocol !== 'https:' ||
            !urlObj.hostname.includes('github.com') ||
            urlObj.username ||
            urlObj.password
        ) {
            return repoUrl;
        }

        // GitHub supports: https://x-access-token:<TOKEN>@github.com/owner/repo.git
        urlObj.username = 'x-access-token';
        urlObj.password = token;
        return urlObj.toString();
    } catch {
        // If it's not a valid URL (or something unexpected), just use original
        return repoUrl;
    }
};

const cloneRepo = async (repoUrl) => {
    try {
        const rawName = repoUrl.split('/').pop() || 'repo';
        const repoName = rawName.replace(/\.git$/, '');

        // Create a temp directory for the clone
        const tempDir = path.join(__dirname, '..', '..', 'repos', `${repoName}-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        const git = simpleGit();

        // ⚡ Clone only the latest snapshot of the repo
        // In gitService.js
        const cloneUrl = buildAuthenticatedGitHubUrl(repoUrl);

        await git.clone(cloneUrl, tempDir, [
            '--depth', '1',
            '--single-branch',
            '--no-tags',
            '--filter=blob:none' // This filters out file contents during clone
        ]);

        return tempDir;
    } catch (error) {
        console.error('Error cloning repo:', error.message);
        
        // Provide more specific error messages
        if (error.message.includes('not found') || error.message.includes('404')) {
            throw new Error('Repository not found. Please check that the repository exists and is public.');
        } else if (error.message.includes('permission') || error.message.includes('authentication')) {
            throw new Error('Permission denied. The repository may be private or you may need authentication.');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        } else {
            throw new Error(`Failed to clone repository: ${error.message}`);
        }
    }
};

export { cloneRepo };
