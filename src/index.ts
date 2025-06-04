import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
    fetchComponentFromGitHub,
    getComponentProps,
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
    "createJSXLayout",
    `Provides a raw, standalone example of a specific MUI component ( Button, Card, TextField, Grid, Stack).
It includes default props, prop definitions, and a clean usage snippet.
Useful as a starting point for creating any custom layout or design.
Use this tool when the user asks for a base version of a component to extend or modify.`,
    {
        componentName: z.string().describe("Component name (e.g. Button, CardLayout)."),
        hint: z.string().optional().describe("create component or layout or design based on a simple instruction."),
    },
    async ({ componentName }, _extra) => {
        const content = await fetchComponentFromGitHub(componentName);
        return {
            content: [{ type: "text", text: JSON.stringify(content) }]
        };
    }
);

server.tool(
    "getComponentProps",
    "This tool provides detailed information about the props, usage, and examples of a specific MUI (Material UI) component. It supports both UI elements like Button, Card, TextField, and layout components like Grid, Stack",
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


async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Design MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
