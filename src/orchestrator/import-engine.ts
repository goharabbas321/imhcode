import * as fs from "fs";
import * as path from "path";
import { scanProject } from "./project-scanner";

export interface ImportResult {
  success: boolean;
  scanResult: any;
  importMap: {
    frontend: string;
    backend: string;
    database: string;
    detectedStack: {
      frontend: string | null;
      backend: string | null;
    };
  };
}

/**
 * Import an existing codebase into the IMH-Code orchestration framework.
 */
export function importProject(cwd: string): ImportResult {
  const scanResult = scanProject(cwd);

  const imhDir = path.join(cwd, ".imhcode");
  if (!fs.existsSync(imhDir)) {
    fs.mkdirSync(imhDir, { recursive: true });
  }

  const cmdDir = path.join(imhDir, "commands");
  if (!fs.existsSync(cmdDir)) {
    fs.mkdirSync(cmdDir, { recursive: true });
  }

  const sessionsDir = path.join(imhDir, "sessions");
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  // Map paths. If it scanned to ".", default to empty or standard string
  const importMap = {
    frontend: scanResult.frontendPath || "frontend",
    backend: scanResult.backendPath || "backend",
    database: scanResult.database || "PostgreSQL",
    detectedStack: {
      frontend: scanResult.detectedFrontend,
      backend: scanResult.detectedBackend
    }
  };

  fs.writeFileSync(
    path.join(imhDir, "import-map.json"),
    JSON.stringify(importMap, null, 2),
    "utf-8"
  );

  // PROJECT_BRIEF.md
  const briefPath = path.join(cwd, "PROJECT_BRIEF.md");
  const briefContent = `# PROJECT_BRIEF.md (Imported Project)

> **IMH-Code — Imam Hussain Coding Harness Platform**
> Centralized memory for this imported project.

## Project Summary

*(Imported project. Add a description of your project here to guide the agents.)*

## Status

- **Imported**: ${new Date().toLocaleDateString()}
- **Current Sprint**: Sprint 1 (Modifications Mode)

## Design Specification

- **Design Style**: Modern SaaS
- **Color Palette**: Dark Premium

## Scope

- **Frontend Path**: \`${importMap.frontend}\` (${scanResult.detectedFrontend || "None"})
- **Backend Path**: \`${importMap.backend}\` (${scanResult.detectedBackend || "None"})
- **Database**: ${importMap.database}
`;
  fs.writeFileSync(briefPath, briefContent, "utf-8");

  // context.md
  const contextPath = path.join(imhDir, "context.md");
  const contextContent = `# IMH-Code Project Context (Imported)

Generated: ${new Date().toLocaleDateString()}
Project Path: ${cwd}
Frontend Framework: ${scanResult.detectedFrontend || "None"} (Path: ${importMap.frontend})
Backend Framework: ${scanResult.detectedBackend || "None"} (Path: ${importMap.backend})

## Directory Structure Mappings
- Frontend: \`${importMap.frontend}\`
- Backend: \`${importMap.backend}\`
`;
  fs.writeFileSync(contextPath, contextContent, "utf-8");

  return {
    success: true,
    scanResult,
    importMap
  };
}
