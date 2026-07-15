import { describe, expect, it } from "vitest";
import {
  buildExamplesGallery,
  buildExamplesHtmlGallery,
  EXAMPLE_TEMPLATE_PRESETS,
} from "./examples.js";

describe("buildExamplesGallery", () => {
  it("renders one preview row per preset", () => {
    const output = buildExamplesGallery({
      username: "urmzd",
      configPath: "../urmzd/github-insights.yml",
      generatedAt: "2026-07-15",
      presets: EXAMPLE_TEMPLATE_PRESETS.map((name) => ({
        name,
        sections: ["velocity", "rhythm"],
      })),
    });

    expect(output).toContain("# GitHub Insights Examples");
    expect(output).toContain("[@urmzd](https://github.com/urmzd)");
    expect(output).toContain("`../urmzd/github-insights.yml`");
    expect(output).toContain("Last generated: 2026-07-15");
    expect(output).toContain("[Showcase](./showcase/README.md)");
    expect(output).toContain("./ecosystem/index.svg");
    expect(output).toContain("velocity, rhythm");
  });
});

describe("buildExamplesHtmlGallery", () => {
  it("renders a browser-friendly preview page", () => {
    const output = buildExamplesHtmlGallery({
      username: "urmzd",
      configPath: "../urmzd/github-insights.yml",
      generatedAt: "2026-07-15",
      presets: EXAMPLE_TEMPLATE_PRESETS.map((name) => ({
        name,
        sections: ["velocity", "rhythm"],
      })),
    });

    expect(output).toContain("<!doctype html>");
    expect(output).toContain("GitHub Insights Examples");
    expect(output).toContain("https://github.com/urmzd");
    expect(output).toContain("./showcase/index.svg");
    expect(output).toContain("./minimal/README.md");
    expect(output).toContain("<span>velocity</span>");
  });
});
