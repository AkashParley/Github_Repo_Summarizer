// server/services/gitService.js
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        await git.clone(repoUrl, tempDir, [
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
