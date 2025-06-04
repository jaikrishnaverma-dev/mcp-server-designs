import axios from "axios";

const GITHUB_REPO_OWNER = "jaikrishnaverma-dev";
const GITHUB_REPO_NAME = "mcp-context-server";
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_BRANCH = "master"; 

/**
 * Fetches the raw content of a component file from GitHub by component name.
 */
export async function fetchComponentFromGitHub(componentName: string): Promise<Record<string, string>> {
    const possiblePaths = [
        `mui-design-system-docs/docs/components/${componentName}/description.md`,
        `mui-design-system-docs/docs/components/${componentName}/props.md`,
        `mui-design-system-docs/docs/components/${componentName}/examples/basic-usage.md`,
        `mui-design-system-docs/docs/layouts/${componentName}/description.md`,
        `mui-design-system-docs/docs/layouts/${componentName}/props.md`,
        `mui-design-system-docs/docs/layouts/${componentName}/examples/basic-usage.md`
    ];
    const results: Record<string, string> = {};
    for (const path of possiblePaths) {
        const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}?ref=${GITHUB_BRANCH}`;
        try {
            const res = await axios.get(url, {
                headers: {
                    "Accept": "application/vnd.github.v3.raw",
                    "User-Agent": "design-system-mcp",
                },
                responseType: "text",
                validateStatus: () => true,
            });
            if (res.status === 200 && typeof res.data === "string") {
                results[path] = res.data;
            }
        } catch {
            // Ignore errors and continue
        }
    }
    if (Object.keys(results).length === 0) {
        throw new Error(`Component "${componentName}" not found in GitHub repository.`);
    }
    return results;
}



/**
 * Parses TypeScript interface for a component and returns prop info.
 */
export async function getComponentProps(componentName: string): Promise<Record<string, any>> {
    const paths = [
        `mui-design-system-docs/docs/components/${componentName}/props.md`,
        `mui-design-system-docs/docs/layouts/${componentName}/props.md`
    ];
    const results: Record<string, string> = {};
    for (const path of paths) {
        const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}?ref=${GITHUB_BRANCH}`;
        try {
            const res = await axios.get(url, {
                headers: {
                    "Accept": "application/vnd.github.v3.raw",
                    "User-Agent": "design-system-mcp",
                },
                responseType: "text",
                validateStatus: () => true,
            });
            // Log the response in color (cyan) and show the response status and data
       
            if (res.status === 200 && typeof res.data === "string") {
                results[path] = res.data;
            }
        } catch {
            // Ignore errors and continue
        }
    }
    // Use the first found props.md file
    const src = Object.values(results)[0] || "";
    if (!src) return {};

    // Simple Markdown table parser for props.md
    // Assumes table format: | Name | Type | Default | Description |
    const lines = src.split("\n").map(line => line.trim());
    const tableStart = lines.findIndex(line => line.startsWith("|"));
    if (tableStart === -1) return {};

    const props: Record<string, any> = {};
    for (let i = tableStart + 2; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith("|")) break;
        const cells = line.split("|").map(cell => cell.trim());
        if (cells.length < 5) continue;
        const [ , name, type, defaultValue, description ] = cells;
        if (name) {
            props[name] = {
                type,
                defaultValue: defaultValue || undefined,
                description: description || ""
            };
        }
    }
    return props;
}

