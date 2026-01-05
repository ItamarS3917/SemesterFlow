import { simpleGit, SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as cron from 'node-cron';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface CommitOptions {
  customMessage?: string;
  validate?: boolean;
}

export interface ScheduleOptions {
  enabled: boolean;
  cronTime?: string;
}

export interface CommitResult {
  success: boolean;
  hasChanges: boolean;
  validationPassed?: boolean;
  commitHash?: string;
  message: string;
}

export class GitCommitService {
  private git: SimpleGit;
  private scheduledTask?: cron.ScheduledTask;
  private configPath: string;

  constructor(repoPath?: string) {
    this.git = simpleGit(repoPath || process.cwd());
    this.configPath = path.join(process.cwd(), '.nightly-commit.json');
    this.loadScheduleFromConfig();
  }

  async checkAndCommit(options: CommitOptions = {}): Promise<CommitResult> {
    try {
      // Check if we're in a git repository
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Not in a git repository');
      }

      // Check for changes
      const status = await this.git.status();
      const hasChanges = status.files.length > 0 || status.ahead > 0;

      if (!hasChanges) {
        return {
          success: true,
          hasChanges: false,
          message: 'No changes to commit',
        };
      }

      // Run validation if requested
      let validationPassed = true;
      if (options.validate !== false) {
        validationPassed = await this.validateCode();
        if (!validationPassed) {
          return {
            success: false,
            hasChanges: true,
            validationPassed: false,
            message: 'Code validation failed, commit aborted',
          };
        }
      }

      // Stage all changes
      await this.git.add('.');

      // Create commit message
      const commitMessage = options.customMessage || this.generateCommitMessage(status);

      // Commit changes
      const commitResult = await this.git.commit(commitMessage);

      return {
        success: true,
        hasChanges: true,
        validationPassed: true,
        commitHash: commitResult.commit,
        message: `Successfully committed: ${commitMessage}`,
      };
    } catch (error) {
      return {
        success: false,
        hasChanges: true,
        message: `Commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async validateCode(): Promise<boolean> {
    try {
      // Check if package.json exists and has scripts
      const packageJsonPath = path.join(process.cwd(), 'package.json');

      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        const scripts = packageJson.scripts || {};

        // Run available validation scripts
        const validationCommands = [];

        if (scripts.lint) {
          validationCommands.push('npm run lint');
        }
        if (scripts.typecheck) {
          validationCommands.push('npm run typecheck');
        }
        if (scripts.test) {
          validationCommands.push('npm run test');
        }
        if (scripts.build) {
          validationCommands.push('npm run build');
        }

        // If no validation scripts, try basic TypeScript check
        if (validationCommands.length === 0) {
          const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
          try {
            await fs.access(tsConfigPath);
            validationCommands.push('npx tsc --noEmit');
          } catch {
            // No TypeScript config, assume validation passed
            return true;
          }
        }

        // Run validation commands
        for (const command of validationCommands) {
          try {
            await execAsync(command);
          } catch (error) {
            console.error(`Validation failed for: ${command}`);
            console.error(error);
            return false;
          }
        }

        return true;
      } catch (error) {
        // No package.json or invalid JSON, assume validation passed
        console.warn('Could not read package.json, skipping script-based validation');
        return true;
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  private generateCommitMessage(status: any): string {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    const fileCount = status.files.length;
    const modifiedFiles = status.files.filter((f: any) => f.working_dir === 'M').length;
    const newFiles = status.files.filter((f: any) => f.working_dir === '?').length;
    const deletedFiles = status.files.filter((f: any) => f.working_dir === 'D').length;

    let summary = `Nightly commit ${timestamp}`;

    if (fileCount > 0) {
      const changes = [];
      if (newFiles > 0) changes.push(`${newFiles} new`);
      if (modifiedFiles > 0) changes.push(`${modifiedFiles} modified`);
      if (deletedFiles > 0) changes.push(`${deletedFiles} deleted`);

      summary += ` - ${changes.join(', ')} files`;
    }

    return summary;
  }

  async setSchedule(options: ScheduleOptions): Promise<{ success: boolean; message: string }> {
    try {
      // Stop existing schedule
      if (this.scheduledTask) {
        this.scheduledTask.stop();
        this.scheduledTask = undefined;
      }

      if (options.enabled) {
        const cronTime = options.cronTime || '0 22 * * *'; // 10 PM daily

        // Validate cron expression
        if (!cron.validate(cronTime)) {
          throw new Error(`Invalid cron expression: ${cronTime}`);
        }

        // Create scheduled task
        this.scheduledTask = cron.schedule(
          cronTime,
          async () => {
            console.log('Running nightly commit...');
            const result = await this.checkAndCommit({ validate: true });
            console.log('Nightly commit result:', result);
          },
          {
            scheduled: false, // Don't start immediately
            timezone: 'America/New_York', // Adjust timezone as needed
          }
        );

        this.scheduledTask.start();

        // Save config
        await this.saveConfig({
          enabled: true,
          cronTime,
        });

        return {
          success: true,
          message: `Nightly commit scheduled for ${cronTime}`,
        };
      } else {
        // Save disabled config
        await this.saveConfig({
          enabled: false,
        });

        return {
          success: true,
          message: 'Nightly commit schedule disabled',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to set schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async saveConfig(config: any): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  private async loadScheduleFromConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configData);

      if (config.enabled && config.cronTime) {
        await this.setSchedule({
          enabled: true,
          cronTime: config.cronTime,
        });
      }
    } catch (error) {
      // Config file doesn't exist or is invalid, that's fine
    }
  }
}
