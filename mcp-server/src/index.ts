import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { handleListResources, handleReadResource } from './resources.js';
import { handleCallTool, ToolSchemas, TOOLS } from './tools.js';

const server = new Server(
  {
    name: 'SemesterFlow MCP Server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return handleListResources();
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return handleReadResource(request.params.uri);
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(ToolSchemas),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return handleCallTool(request.params.name, request.params.arguments);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SemesterFlow MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
