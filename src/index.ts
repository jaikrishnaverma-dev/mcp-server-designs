import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
    fetchComponentFromGitHub,
    generateJSXLayout,
    getComponentProps,
    launchPlayground,
} from "./helpers.js";

// Create server instance
const server = new McpServer({
    name: "mui-design-system-demo",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Correct tool registration
server.tool(
    "fetchComponentFromGitHub",
    {
        componentName: z.string().describe("Component name (e.g. Button, CardLayout)"),
    },
    async ({ componentName }, _extra) => {
        const content = await fetchComponentFromGitHub(componentName);
        return {
            content: [{ type: "text", text: JSON.stringify(content) }]
        };
    }
);

server.tool(
    "generateJSXLayout",
    {
        instruction: z.string().describe("Layout instruction (e.g. 2-column card layout)"),
    },
    async ({ instruction }) => {
        const code = generateJSXLayout(instruction);
        return {
            content: [{ type: "text", text: code }]
        };
    }
);

server.tool(
    "getComponentProps",
    {
        componentName: z.string().describe("Component name (e.g. Button)"),
    },
    async ({ componentName }) => {
        const props = await getComponentProps(componentName);
        return {
            content: [{ type: "text", text: JSON.stringify(props) }]
        };
    }
);

server.tool(
    "launchPlayground",
    {
        code: z.string().describe("JSX code to preload in the playground"),
    },
    async ({ code }) => {
        const url = launchPlayground(code);
        return {
            content: [{ type: "text", text: url }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Design MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
