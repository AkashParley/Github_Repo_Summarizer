import { cloneRepo } from '../services/gitService.js';
import readFilesRecursively from '../utils/readFile.js';
import batchFiles from '../utils/batchFile.js';
import redis from '../utils/redis.js';
import dotenv from 'dotenv';
import { buildFileTree } from '../utils/fileTree.js';
import { summarizeBatch, summarizeBatches, generateReadme } from '../utils/analyzeWithLLM.js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const isValidGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Normalize the URL: remove trailing slashes, query params, fragments
    let normalizedUrl = url.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Parse URL to extract clean path
    const urlObj = new URL(normalizedUrl);
    
    // Check if it's a GitHub domain
    if (!urlObj.hostname.includes('github.com')) {
      return false;
    }
    
    // Extract path parts (remove empty strings)
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Must have at least owner and repo (2 parts)
    if (pathParts.length < 2) {
      return false;
    }
    
    // Check owner and repo names (allow alphanumeric, hyphens, underscores, dots)
    const owner = pathParts[0];
    const repo = pathParts[1].replace(/\.git$/, ''); // Remove .git if present
    
    const validNamePattern = /^[\w.-]+$/;
    
    return validNamePattern.test(owner) && validNamePattern.test(repo);
  } catch (error) {
    return false;
  }
};

// Helper function to normalize GitHub URL for cloning
const normalizeGitHubUrl = (url) => {
  try {
    let normalizedUrl = url.trim();
    
    // Add protocol if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    const urlObj = new URL(normalizedUrl);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const owner = pathParts[0];
      const repo = pathParts[1].replace(/\.git$/, '');
      return `https://github.com/${owner}/${repo}.git`;
    }
    
    return normalizedUrl;
  } catch (error) {
    return url;
  }
};

const cloneRepoHandler = async (req, res) => {
  const { repoUrl } = req.body;
  let localPath = null;

  if (!repoUrl || !isValidGitHubUrl(repoUrl)) {
    return res.status(400).json({ 
      error: 'Invalid GitHub repository URL. Please provide a valid URL like: https://github.com/owner/repo' 
    });
  }

  // Normalize the URL for cloning
  const normalizedUrl = normalizeGitHubUrl(repoUrl);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  try {
    // Use normalized URL for cache key
    const cacheKey = normalizedUrl;
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.write(JSON.stringify({ step: 'cache', message: 'Results served from cache' }) + '\n');
      res.write(JSON.stringify({ result: JSON.parse(cached) }) + '\n');
      return res.end();
    }

    localPath = await cloneRepo(normalizedUrl);
    res.write(JSON.stringify({ step: 'clone', message: 'Cloning complete' }) + '\n');

    const fileTreePromise = buildFileTree(localPath);

    const files = await readFilesRecursively(localPath);
    res.write(JSON.stringify({ step: 'read', message: 'Files read successfully' }) + '\n');
    
    const batches = batchFiles(files, 8000);
    const batchSummaries = [];
    const concurrencyLimit = 10;

    for (let i = 0; i < batches.length; i += concurrencyLimit) {
      const chunk = batches.slice(i, i + concurrencyLimit);

      const chunkSummaries = await Promise.all(
        chunk.map(batch => summarizeBatch(batch))
      );

      batchSummaries.push(...chunkSummaries);

      res.write(JSON.stringify({
        step: 'analyze',
        progress: `Batch ${Math.min(i + concurrencyLimit, batches.length)}/${batches.length}`
      }) + '\n');
    }

    const { finalSummary } = await summarizeBatches(batches);
    const fileTree = await fileTreePromise;

    res.write(JSON.stringify({ step: 'readme', message: 'Generating README.md' }) + '\n');
    const readme = await generateReadme(fileTree, finalSummary, batchSummaries);

    const finalResult = {
      fileTree,
      summary: finalSummary,
      readme
    };

    await redis.setex(cacheKey, 600, JSON.stringify(finalResult));

    res.write(JSON.stringify({ result: finalResult }) + '\n');
    res.end();

  } catch (err) {
    console.error(err);
    res.write(JSON.stringify({ error: err.message }) + '\n');
    res.end();
  } finally {
    // Clean up cloned repo folder if it exists
    if (localPath) {
      try {
        await fs.rm(localPath, { recursive: true, force: true });
        console.log(`Deleted cloned repo at ${localPath}`);
      } catch (cleanupErr) {
        console.error(`Failed to delete ${localPath}:`, cleanupErr.message);
      }
    }
  }

};

export { cloneRepoHandler };
