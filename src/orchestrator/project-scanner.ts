import * as fs from "fs";
import * as path from "path";

export interface ScanResult {
  detectedFrontend: string | null;
  detectedBackend: string | null;
  frontendPath: string | null;
  backendPath: string | null;
  database: string | null;
  dockerized: boolean;
  hasCICD: boolean;
  packageJson?: any;
  composerJson?: any;
}

/**
 * Deep scan an existing codebase to detect stack and structure.
 */
export function scanProject(cwd: string): ScanResult {
  const result: ScanResult = {
    detectedFrontend: null,
    detectedBackend: null,
    frontendPath: null,
    backendPath: null,
    database: null,
    dockerized: false,
    hasCICD: false,
  };

  // 1. Helper to search for files recursively with limits
  function findFile(dir: string, name: string, depth = 0): string | null {
    if (depth > 3) return null;
    try {
      const files = fs.readdirSync(dir);
      if (files.includes(name)) {
        return path.join(dir, name);
      }
      for (const file of files) {
        if (file.startsWith(".") || file === "node_modules" || file === "dist" || file === "vendor") continue;
        const fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) {
          const found = findFile(fp, name, depth + 1);
          if (found) return found;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }

  // 2. Scan for package.json (Frontend detection)
  const pkgJsonPath = findFile(cwd, "package.json");
  if (pkgJsonPath) {
    try {
      const content = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
      result.packageJson = content;
      const deps = { ...(content.dependencies || {}), ...(content.devDependencies || {}) };
      
      if (deps.next) result.detectedFrontend = "Next.js";
      else if (deps.nuxt || deps.nuxt3 || deps.nuxt4) result.detectedFrontend = "Nuxt/Vue";
      else if (deps.react) result.detectedFrontend = "React SPA";
      else if (deps.vue) result.detectedFrontend = "Vue SPA";
      else if (deps.svelte) result.detectedFrontend = "Svelte";
      else result.detectedFrontend = "Node/JS";

      // If package.json is in a subdirectory, use that subdirectory
      const relative = path.relative(cwd, path.dirname(pkgJsonPath));
      result.frontendPath = relative === "" ? "." : relative;
    } catch {
      // Ignore
    }
  }

  // 3. Scan for composer.json, requirements.txt, or pom.xml (Backend detection)
  const composerPath = findFile(cwd, "composer.json");
  if (composerPath) {
    try {
      const content = JSON.parse(fs.readFileSync(composerPath, "utf-8"));
      result.composerJson = content;
      if (content.require && (content.require["laravel/framework"] || content.require["laravel/lumen-framework"])) {
        result.detectedBackend = "Laravel";
      } else {
        result.detectedBackend = "PHP";
      }
      const relative = path.relative(cwd, path.dirname(composerPath));
      result.backendPath = relative === "" ? "." : relative;
    } catch {
      // Ignore
    }
  }

  if (!result.detectedBackend) {
    const reqsTxtPath = findFile(cwd, "requirements.txt");
    const pyprojectPath = findFile(cwd, "pyproject.toml");
    if (reqsTxtPath || pyprojectPath) {
      result.detectedBackend = "Python (Django/FastAPI)";
      const matchedPath = reqsTxtPath || pyprojectPath || "";
      const relative = path.relative(cwd, path.dirname(matchedPath));
      result.backendPath = relative === "" ? "." : relative;
    }
  }

  // 4. Database Detection from env or configs
  const envPath = findFile(cwd, ".env") || findFile(cwd, ".env.example");
  if (envPath) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      if (content.includes("DB_CONNECTION=pgsql") || content.includes("postgresql://")) {
        result.database = "PostgreSQL";
      } else if (content.includes("DB_CONNECTION=mysql") || content.includes("mysql://")) {
        result.database = "MySQL";
      } else if (content.includes("DB_CONNECTION=sqlite") || content.includes("sqlite3")) {
        result.database = "SQLite";
      }
    } catch {
      // Ignore
    }
  }

  // 5. Infrastructure detection
  const dockerCompose = findFile(cwd, "docker-compose.yml");
  const dockerfile = findFile(cwd, "Dockerfile");
  if (dockerCompose || dockerfile) {
    result.dockerized = true;
  }

  const githubWorkflows = findFile(cwd, ".github/workflows");
  if (githubWorkflows) {
    result.hasCICD = true;
  }

  return result;
}
