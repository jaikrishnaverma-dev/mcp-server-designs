import axios from "axios";
import * as ts from "typescript";

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
 * Generates a JSX layout snippet based on a simple instruction.
 */
export function generateJSXLayout(instruction: string): string {
  // Simple template mapping for demo purposes
  if (/2[- ]column.*card/i.test(instruction)) {
    return `import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function TwoColumnCardLayout() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Left Card</Typography>
            <Typography>Content goes here.</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Right Card</Typography>
            <Typography>Content goes here.</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
`;
  }
  // Add more templates as needed
  return `// No template found for instruction: "${instruction}"`;
}

/**
 * Parses TypeScript interface for a component and returns prop info.
 */
export async function getComponentProps(componentName: string): Promise<Record<string, any>> {
  const srcFiles = await fetchComponentFromGitHub(componentName);
  // Pick the first file content as the source (or adjust as needed)
  const src = Object.values(srcFiles)[0] || "";
  const sourceFile = ts.createSourceFile(
    `${componentName}.tsx`,
    src,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const props: Record<string, any> = {};
  function visit(node: ts.Node) {
    if (
      ts.isInterfaceDeclaration(node) &&
      /props?/i.test(node.name.text)
    ) {
      node.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const name = (member.name as ts.Identifier).text;
          const type = member.type ? member.type.getText(sourceFile) : "any";
          let description = "";
          let defaultValue = undefined;
          const jsDocs = ts.getJSDocCommentsAndTags(member);
          if (jsDocs && jsDocs.length > 0) {
            jsDocs.forEach((doc) => {
              if (ts.isJSDoc(doc)) {
                if (doc.comment) {
                  description = doc.comment.toString();
                }
                if (doc.tags) {
                  doc.tags.forEach((tag) => {
                    if (tag.tagName.text === "default" && tag.comment) {
                      defaultValue = tag.comment.toString();
                    }
                  });
                }
              }
            });
          }
          props[name] = { type, defaultValue, description };
        }
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return props;
}

