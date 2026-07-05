import { describe, expect, it, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { loadMemoryFiles } from "../../../src/orchestrator/loader";
import { getRoleKeyForAgent, resolveAgentIdAlias } from "../../../src/orchestrator/index";
import { scanProjectContext, detectBestAgent } from "../../../src/orchestrator/context-scanner";
import { scanProject, ScanResult } from "../../../src/orchestrator/project-scanner";
import { importProject } from "../../../src/orchestrator/import-engine";

describe("orchestrator resolveAgentIdAlias", () => {
  it("resolves generic agent aliases correctly", () => {
    expect(resolveAgentIdAlias("nextjs")).toBe("nextjs-executor");
    expect(resolveAgentIdAlias("laravel")).toBe("laravel-executor");
    expect(resolveAgentIdAlias("qa")).toBe("tester");
    expect(resolveAgentIdAlias("security")).toBe("security-auditor");
    expect(resolveAgentIdAlias("seo")).toBe("seo-optimizer");
    expect(resolveAgentIdAlias("debug")).toBe("debugger");
  });

  it("returns canonical ID unchanged", () => {
    expect(resolveAgentIdAlias("laravel-executor")).toBe("laravel-executor");
  });
});

describe("orchestrator getRoleKeyForAgent", () => {
  it("resolves generic executor roles correctly", () => {
    expect(getRoleKeyForAgent("nextjs-executor", "Build a dashboard")).toBe("frontend");
    expect(getRoleKeyForAgent("laravel-executor", "Create API route")).toBe("backend");
    expect(getRoleKeyForAgent("planner", "Define architecture")).toBe("planning");
    expect(getRoleKeyForAgent("tester", "Run E2E tests")).toBe("testing");
    expect(getRoleKeyForAgent("debugger", "Fix authentication issue")).toBe("review");
  });
});

describe("project scanners and imports", () => {
  const tempDir = path.join(process.cwd(), ".tmp-tests", `import-test-${Date.now()}`);

  it("scans and imports project structures correctly", () => {
    // 1. Create a dummy Next.js + Laravel project layout
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(path.join(tempDir, "frontend"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "backend"), { recursive: true });

    // Write package.json
    fs.writeFileSync(
      path.join(tempDir, "frontend", "package.json"),
      JSON.stringify({
        name: "test-frontend",
        dependencies: {
          next: "^15.0.0",
          react: "^19.0.0"
        }
      })
    );

    // Write composer.json
    fs.writeFileSync(
      path.join(tempDir, "backend", "composer.json"),
      JSON.stringify({
        name: "laravel/laravel",
        require: {
          "laravel/framework": "^11.0"
        }
      })
    );

    // Write .env with pgsql database config
    fs.writeFileSync(
      path.join(tempDir, ".env"),
      "DB_CONNECTION=pgsql\nDATABASE_URL=postgresql://localhost:5432/test"
    );

    // 2. Test project scanner
    const scanResult = scanProject(tempDir);
    expect(scanResult.detectedFrontend).toBe("Next.js");
    expect(scanResult.detectedBackend).toBe("Laravel");
    expect(scanResult.frontendPath).toBe("frontend");
    expect(scanResult.backendPath).toBe("backend");
    expect(scanResult.database).toBe("PostgreSQL");

    // 3. Test context scanner
    const contextScan = scanProjectContext(tempDir);
    expect(contextScan.hasFrontend).toBe(true);
    expect(contextScan.hasBackend).toBe(true);
    expect(contextScan.frontendFramework).toBe("Next.js");
    expect(contextScan.backendFramework).toBe("Laravel");

    // 4. Test best agent detection
    expect(detectBestAgent("fix a bug in navbar component", contextScan)).toBe("nextjs-executor");
    expect(detectBestAgent("create a database migration for comments table", contextScan)).toBe("laravel-executor");

    // 5. Test import execution
    const importResult = importProject(tempDir);
    expect(importResult.success).toBe(true);
    expect(importResult.importMap.frontend).toBe("frontend");
    expect(importResult.importMap.backend).toBe("backend");

    // Check generated files exist
    expect(fs.existsSync(path.join(tempDir, ".imhcode", "import-map.json"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "PROJECT_BRIEF.md"))).toBe(true);
  });

  // Clean up
  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("loadMemoryFiles exclusions and limits", () => {
  const tempDir = path.join(process.cwd(), ".tmp-tests", `mem-test-${Date.now()}`);

  it("filters out binary files, lockfiles, excluded directories, and large files", async () => {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(path.join(tempDir, "docs"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "node_modules"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "frontend", ".next"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "backend", "build"), { recursive: true });

    fs.writeFileSync(path.join(tempDir, "docs", "test.md"), "hello docs");
    fs.writeFileSync(path.join(tempDir, "docs", "info.txt"), "hello info");
    fs.writeFileSync(path.join(tempDir, "node_modules", "bad.js"), "console.log('bad')");
    fs.writeFileSync(path.join(tempDir, "frontend", ".next", "cache.json"), "{}");
    fs.writeFileSync(path.join(tempDir, "backend", "build", "bundle.js"), "const a = 1;");
    fs.writeFileSync(path.join(tempDir, "frontend", "image.png"), "binary png contents");
    fs.writeFileSync(path.join(tempDir, "package-lock.json"), "{}");

    const largeFilePath = path.join(tempDir, "docs", "large.txt");
    const largeContent = "a".repeat(1024 * 1024 + 10);
    fs.writeFileSync(largeFilePath, largeContent);

    const mockManifest: any = {
      memory: {
        readable: ["**/*"]
      }
    };

    const files = await loadMemoryFiles(mockManifest, tempDir);

    const relativePaths = files.map(f => path.relative(tempDir, f.path).replace(/\\/g, "/"));
    expect(relativePaths).toContain("docs/test.md");
    expect(relativePaths).toContain("docs/info.txt");
    expect(relativePaths).not.toContain("node_modules/bad.js");
    expect(relativePaths).not.toContain("frontend/.next/cache.json");
    expect(relativePaths).not.toContain("backend/build/bundle.js");
    expect(relativePaths).not.toContain("frontend/image.png");
    expect(relativePaths).not.toContain("package-lock.json");
    expect(relativePaths).not.toContain("docs/large.txt");

    expect(files.find(f => f.path.endsWith("test.md"))?.content).toBe("hello docs");
    expect(files.find(f => f.path.endsWith("info.txt"))?.content).toBe("hello info");
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
