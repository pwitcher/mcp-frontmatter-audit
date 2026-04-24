import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs/promises";

// 1. Initialize the MCP Server
const server = new Server(
  { name: "frontmatter-auditor", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 2. Tell the LLM what tools are available
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "audit_metadata",
      description: "Checks an Astro/Starlight markdown file for title and description.",
      inputSchema: {
        type: "object",
        properties: {
          filePath: { type: "string", description: "The full path to the .md or .mdx file" },
        },
        required: ["filePath"],
      },
    },
  ],
}));

// 3. The Logic: What happens when the tool is called
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "audit_metadata") {
    let filePath = request.params.arguments?.filePath as string;

    // FIX: Normalize the path for Windows
    // This removes extra quotes and fixes slashes
    filePath = filePath.replace(/^["']|["']$/g, '').replace(/\//g, '\\');

    try {
      const content = await fs.readFile(filePath, "utf-8");
      
      const hasTitle = content.includes("title:");
      const hasDescription = content.includes("description:");

      if (hasTitle && hasDescription) {
        return {
          content: [{ type: "text", text: `✅ Success: ${filePath} has valid frontmatter.` }],
        };
      } else {
        const missing = [!hasTitle && "title", !hasDescription && "description"].filter(Boolean);
        return {
          content: [{ type: "text", text: `❌ Failure: ${filePath} is missing: ${missing.join(", ")}` }],
          isError: true,
        };
      }
    } catch (error: any) {
      // We return the error so we can see the ACTUAL path it tried to read
      return {
        content: [{ type: "text", text: `Error reading file at [${filePath}]: ${error.message}` }],
        isError: true,
      };
    }
  }
  throw new Error("Tool not found");
});

// 4. Start the server
const transport = new StdioServerTransport();
await server.connect(transport);