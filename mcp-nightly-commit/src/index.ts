import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GitCommitService } from "./git-service.js";

class NightlyCommitServer {
  private server: Server;
  private gitService: GitCommitService;

  constructor() {
    this.server = new Server(
      {
        name: "nightly-commit",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.gitService = new GitCommitService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "check_and_commit",
            description: "Check for changes and commit if code is valid",
            inputSchema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Custom commit message (optional)",
                },
                validate: {
                  type: "boolean",
                  description: "Run validation before commit (default: true)",
                  default: true,
                },
              },
            },
          },
          {
            name: "schedule_nightly_commit",
            description: "Enable/disable nightly commit schedule",
            inputSchema: {
              type: "object",
              properties: {
                enabled: {
                  type: "boolean",
                  description: "Enable or disable the schedule",
                },
                time: {
                  type: "string",
                  description: "Cron expression for schedule (default: 0 22 * * *)",
                  default: "0 22 * * *",
                },
              },
              required: ["enabled"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "check_and_commit":
          return await this.handleCheckAndCommit(args);
        
        case "schedule_nightly_commit":
          return await this.handleScheduleNightlyCommit(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleCheckAndCommit(args: any) {
    try {
      const result = await this.gitService.checkAndCommit({
        customMessage: args?.message,
        validate: args?.validate !== false,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleScheduleNightlyCommit(args: any) {
    try {
      const result = await this.gitService.setSchedule({
        enabled: args.enabled,
        cronTime: args.time || "0 22 * * *",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Nightly Commit MCP server running on stdio");
  }
}

const server = new NightlyCommitServer();
server.run().catch(console.error);