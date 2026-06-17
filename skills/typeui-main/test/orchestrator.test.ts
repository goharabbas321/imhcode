import { describe, expect, it } from "vitest";
import { getRoleKeyForAgent } from "../../../src/orchestrator/index";

describe("orchestrator getRoleKeyForAgent", () => {
  it("resolves security roles correctly", () => {
    expect(getRoleKeyForAgent("hamid-security", "Audit the authentication code")).toBe("primary_security_reviewer");
    expect(getRoleKeyForAgent("hamid-security", "Laravel security fallback audit")).toBe("security_fallback");
  });

  it("resolves debugger roles correctly", () => {
    expect(getRoleKeyForAgent("sajjad-debugger", "Fix login bug")).toBe("fast_bug_fixing");
  });

  it("resolves designer roles correctly", () => {
    expect(getRoleKeyForAgent("mustafa-visual", "Create hero section")).toBe("primary_design_brain");
    expect(getRoleKeyForAgent("mahdi-designer", "Polish the UX layout")).toBe("design_polish_ux_review");
  });

  it("resolves frontend roles correctly", () => {
    expect(getRoleKeyForAgent("karar-frontend", "Build button component")).toBe("frontend_builder");
    expect(getRoleKeyForAgent("karar-frontend", "Verify and review final frontend")).toBe("frontend_final_review");
  });

  it("resolves backend roles correctly", () => {
    expect(getRoleKeyForAgent("tariq-backend", "Write DB migration")).toBe("primary_backend_builder");
    expect(getRoleKeyForAgent("tariq-backend", "Refactor multiple files in Laravel")).toBe("backend_multi_file_builder");
  });
});
