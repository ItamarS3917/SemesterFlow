#!/usr/bin/env node

import { GitCommitService } from './git-service.js';

async function runScheduledCommit() {
  const gitService = new GitCommitService();
  
  console.log('Starting nightly commit check...');
  
  try {
    const result = await gitService.checkAndCommit({
      validate: true,
    });
    
    console.log('Commit result:', result);
    
    if (result.success && result.hasChanges) {
      console.log(`✅ Successfully committed changes: ${result.commitHash}`);
    } else if (result.success && !result.hasChanges) {
      console.log('ℹ️  No changes to commit');
    } else {
      console.error(`❌ Commit failed: ${result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during nightly commit:', error);
    process.exit(1);
  }
}

// If this file is run directly, execute the scheduled commit
if (import.meta.url === `file://${process.argv[1]}`) {
  runScheduledCommit();
}