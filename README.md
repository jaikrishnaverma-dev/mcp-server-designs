# MCP Server
## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the MCP Server

```bash
npm run build
```

This will generate the compiled server at `build/index.js`.

---

## Usage as MCP Server

After building, you can use the compiled `build/index.js` file as the entry point for your MCP server. For example, to configure your MCP client to use this server via stdio, use the following configuration:

```json
"my-design-system": {
    "type": "stdio",
    "command": "node",
    "args": [
        "E:\\MCP-Servers\\design-system-mcp\\build\\index.js"
    ]
}
```

Replace the path with the actual location of your `build/index.js` if different.

---

## Debugging with MCP Inspector Mode

You can debug or inspect the MCP server using the MCP Inspector. First, ensure you have the inspector installed:

```bash
npm install -g @modelcontextprotocol/inspector
```

Then, run the inspector in MCP inspector mode:

```bash
npx @modelcontextprotocol/inspector
```

This will help you inspect and debug the communication between your MCP client and server.

---

## Summary

1. Install dependencies: `npm install`
2. Build the server: `npm run build`
3. Copy the full path to `build/index.js` and use it in your agent configuration as shown above.
4. Use the MCP Inspector for debugging: `npx @modelcontextprotocol/inspector`
