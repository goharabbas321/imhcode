import * as fs from "fs";
import * as path from "path";

export interface ProjectScanResult {
  hasFrontend: boolean;
  hasBackend: boolean;
  frontendFramework?: string;
  backendFramework?: string;
  dependencies: Record<string, string>;
  directories: string[];
  fileCount: number;
  recentModifications: string[];
}

/**
 * Scan project structure to build context for modifications.
 */
export function scanProjectContext(cwd: string): ProjectScanResult {
  const result: ProjectScanResult = {
    hasFrontend: false,
    hasBackend: false,
    dependencies: {},
    directories: [],
    fileCount: 0,
    recentModifications: []
  };

  // 1. Detect directories
  try {
    const items = fs.readdirSync(cwd);
    for (const item of items) {
      if (item.startsWith(".") || item === "node_modules" || item === "dist") continue;
      const itemPath = path.join(cwd, item);
      try {
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          result.directories.push(item);
        }
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore
  }

  // 2. Scan frontend
  const frontendPath = path.join(cwd, "frontend");
  if (fs.existsSync(frontendPath) && fs.statSync(frontendPath).isDirectory()) {
    result.hasFrontend = true;
    const pkgJsonPath = path.join(frontendPath, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
        result.frontendFramework = pkg.dependencies?.next ? "Next.js" : pkg.dependencies?.vue ? "Vue" : "React";
        Object.assign(result.dependencies, pkg.dependencies || {});
        Object.assign(result.dependencies, pkg.devDependencies || {});
      } catch {
        // Ignore
      }
    }
  }

  // 3. Scan backend
  const backendPath = path.join(cwd, "backend");
  if (fs.existsSync(backendPath) && fs.statSync(backendPath).isDirectory()) {
    result.hasBackend = true;
    const composerJsonPath = path.join(backendPath, "composer.json");
    if (fs.existsSync(composerJsonPath)) {
      try {
        const comp = JSON.parse(fs.readFileSync(composerJsonPath, "utf-8"));
        result.backendFramework = "Laravel";
        if (comp.require) {
          Object.assign(result.dependencies, comp.require);
        }
      } catch {
        // Ignore
      }
    }
    // Also check for Python
    const reqTxtPath = path.join(backendPath, "requirements.txt");
    if (fs.existsSync(reqTxtPath)) {
      result.backendFramework = "Python/FastAPI/Django";
    }
  }

  // 4. Count files (shallow-ish recursive count for safety/perf)
  let count = 0;
  function countFiles(dir: string, depth = 0) {
    if (depth > 4 || count > 500) return; // Cap at 500 files for scanning performance
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith(".") || file === "node_modules" || file === "dist" || file === "vendor") continue;
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
          countFiles(fp, depth + 1);
        } else {
          count++;
        }
      }
    } catch {
      // Ignore
    }
  }
  countFiles(cwd);
  result.fileCount = count;

  // 5. Read recent modifications from log if exists
  const modLogPath = path.join(cwd, "docs", "modifications.md");
  if (fs.existsSync(modLogPath)) {
    try {
      const content = fs.readFileSync(modLogPath, "utf-8");
      const lines = content.split("\n").filter(l => l.trim().startsWith("|")).slice(2);
      result.recentModifications = lines.map(l => l.trim());
    } catch {
      // Ignore
    }
  }

  return result;
}

/**
 * Builds context prompt specifically for a modification task.
 */
export function buildModificationPrompt(context: ProjectScanResult, description: string): string {
  const lines = [
    `# IMH-Code Project Modification Request`,
    `You are tasked with modifying or extending an existing project.`,
    ``,
    `## Project Inventory`,
    `- Frontend Active: ${context.hasFrontend ? `Yes (${context.frontendFramework})` : "No"}`,
    `- Backend Active: ${context.hasBackend ? `Yes (${context.backendFramework})` : "No"}`,
    `- Total Directories: ${context.directories.join(", ")}`,
    `- File Count: ${context.fileCount}`,
    ``,
    `## Detected Stacks & Dependencies`,
    Object.entries(context.dependencies)
      .slice(0, 15) // Top 15 dependencies
      .map(([k, v]) => `- \`${k}\`: \`${v}\``)
      .join("\n"),
    context.recentModifications.length > 0 
      ? `\n## Recent Project Modifications\n` + context.recentModifications.join("\n")
      : "",
    ``,
    `## Modification Instructions`,
    `Task: ${description}`,
    ``,
    `CRITICAL DIRECTIONS:`,
    `1. Review the existing directories (e.g. frontend/ and backend/) to locate the relevant files.`,
    `2. Perform the edit IN-PLACE. Do NOT delete or rewrite entire directories unless necessary.`,
    `3. Adhere strictly to the existing coding style, frameworks, and packages.`,
    `4. If new dependencies are needed, install them using the appropriate package manager in the correct directory.`,
    `5. After completing, explain clearly what files were changed.`
  ];

  return lines.join("\n");
}

/**
 * Helper to auto-select best agent ID based on task description keywords.
 */
export function detectBestAgent(description: string, context: ProjectScanResult): string {
  const d = description.toLowerCase();

  // 1. Planning/Architecture
  if (d.includes("plan") || d.includes("architect") || d.includes("road map") || d.includes("sprint")) {
    return "planner";
  }

  // 2. DevOps/Infrastructure
  if (d.includes("docker") || d.includes("kubernetes") || d.includes("deploy") || d.includes("ci/cd") || d.includes("github action") || d.includes("nginx")) {
    return "devops-executor";
  }

  // 3. Testing
  if (d.includes("test") || d.includes("spec") || d.includes("audit") || d.includes("security")) {
    if (d.includes("security") || d.includes("vulnerability") || d.includes("owasp")) {
      return "security-auditor";
    }
    return "tester";
  }

  // 4. SEO
  if (d.includes("seo") || d.includes("meta tag") || d.includes("sitemap") || d.includes("robots.txt")) {
    return "seo-optimizer";
  }

  // 5. Frontend Keywords Check
  const hasFrontendKeywords = d.includes("ui") || d.includes("page") || d.includes("component") || d.includes("navbar") || d.includes("style") || d.includes("css") || d.includes("tailwind") || d.includes("button") || d.includes("layout");
  if (hasFrontendKeywords) {
    if (context.frontendFramework === "Next.js") return "nextjs-executor";
    if (context.frontendFramework === "Vue") return "vue-executor";
    return "react-executor";
  }

  // 6. Backend Keywords Check
  const hasBackendKeywords = d.includes("api") || d.includes("route") || d.includes("database") || d.includes("controller") || d.includes("migration") || d.includes("model") || d.includes("query") || d.includes("auth");
  if (hasBackendKeywords) {
    if (context.backendFramework === "Laravel") return "laravel-executor";
    if (context.backendFramework === "Python/FastAPI/Django") return "python-executor";
    return "laravel-executor";
  }

  // 7. Directory fallbacks if no keywords matched
  if (context.hasFrontend) {
    if (context.frontendFramework === "Next.js") return "nextjs-executor";
    if (context.frontendFramework === "Vue") return "vue-executor";
    return "react-executor";
  }

  if (context.hasBackend) {
    if (context.backendFramework === "Laravel") return "laravel-executor";
    if (context.backendFramework === "Python/FastAPI/Django") return "python-executor";
    return "laravel-executor";
  }

  return "laravel-executor"; // Ultimate default
}
