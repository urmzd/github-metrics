import type { ShowcaseSection, TemplateName } from "./types.js";

export const EXAMPLE_TEMPLATE_PRESETS = [
  "showcase",
  "ecosystem",
  "modern",
  "classic",
  "minimal",
] as const satisfies readonly TemplateName[];

const PRESET_LABELS: Record<TemplateName, string> = {
  showcase: "Showcase",
  ecosystem: "Ecosystem",
  modern: "Modern",
  classic: "Classic",
  minimal: "Minimal",
};

const PRESET_DESCRIPTIONS: Record<TemplateName, string> = {
  showcase:
    "Full profile story with project spotlight, metric visuals, portfolio, and impact.",
  ecosystem:
    "Portfolio-first view organized by stack layers and project categories.",
  modern:
    "Focused profile layout with spotlight projects and the core visual metrics.",
  classic:
    "Metrics-only presentation for profile READMEs that already have narrative copy.",
  minimal:
    "Compact language and rhythm snapshot for a restrained profile section.",
};

export interface ExamplePresetSummary {
  name: TemplateName;
  sections: ShowcaseSection[];
}

export interface ExamplesGalleryOptions {
  username: string;
  configPath?: string;
  generatedAt?: string;
  presets: ExamplePresetSummary[];
}

export function buildExamplesGallery({
  username,
  configPath,
  generatedAt = new Date().toISOString().split("T")[0],
  presets,
}: ExamplesGalleryOptions): string {
  const source = configPath ? ` using \`${configPath}\`` : "";
  const rows = presets
    .map((preset) => {
      const label = PRESET_LABELS[preset.name];
      const sections = preset.sections.join(", ");
      return `| [${label}](./${preset.name}/README.md) | <img src="./${preset.name}/index.svg" width="360" alt="${label} preset preview for @${username}"> | ${sections} |`;
    })
    .join("\n");

  return [
    "# GitHub Insights Examples",
    "",
    `Generated for [@${username}](https://github.com/${username})${source}.`,
    "",
    `Last generated: ${generatedAt}`,
    "",
    "| Preset | Preview | Sections |",
    "|--------|---------|----------|",
    rows,
    "",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildExamplesHtmlGallery({
  username,
  configPath,
  generatedAt = new Date().toISOString().split("T")[0],
  presets,
}: ExamplesGalleryOptions): string {
  const source = configPath
    ? ` using <code>${escapeHtml(configPath)}</code>`
    : "";
  const [featured, ...secondaryPresets] = presets;
  const renderCard = (
    preset: ExamplePresetSummary,
    variant: "featured" | "compact",
  ): string => {
    const label = PRESET_LABELS[preset.name];
    const sections = preset.sections
      .map((section) => `<span>${escapeHtml(section)}</span>`)
      .join("");

    return `<article class="example-card ${variant}">
  <header>
    <div>
      <p class="eyebrow">${escapeHtml(preset.name)}</p>
      <h2>${escapeHtml(label)}</h2>
    </div>
    <a href="./${preset.name}/README.md">README</a>
  </header>
  <a class="preview-link" href="./${preset.name}/index.svg">
    <img src="./${preset.name}/index.svg" alt="${escapeHtml(label)} preset preview for @${username}" loading="lazy">
  </a>
  <div class="card-copy">
    <p>${escapeHtml(PRESET_DESCRIPTIONS[preset.name])}</p>
    <div class="sections">${sections}</div>
  </div>
</article>`;
  };
  const cards = secondaryPresets
    .map((preset) => renderCard(preset, "compact"))
    .join("\n");
  const featuredCard = featured ? renderCard(featured, "featured") : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GitHub Insights Examples for @${escapeHtml(username)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #070a10;
      --panel: #111827;
      --panel-strong: #182234;
      --text: #eef6ff;
      --muted: #94a3b8;
      --line: #2f3b4f;
      --accent: #45b3ff;
      --green: #45d483;
      --gold: #f6b342;
      --cyan: #2dd4bf;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        linear-gradient(135deg, rgba(69, 179, 255, 0.12), transparent 32rem),
        linear-gradient(315deg, rgba(45, 212, 191, 0.08), transparent 30rem),
        var(--bg);
      color: var(--text);
    }
    main {
      width: min(1240px, calc(100% - 32px));
      margin: 0 auto;
      padding: 36px 0 56px;
    }
    .page-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 22px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 22px;
      background: rgba(17, 24, 39, 0.82);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 34px;
      line-height: 1.15;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
    }
    a {
      color: var(--accent);
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
    .meta {
      text-align: right;
      min-width: max-content;
      font-size: 13px;
    }
    .hero {
      margin-bottom: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
      align-items: start;
    }
    .example-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(17, 24, 39, 0.88);
      overflow: hidden;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.24);
    }
    .example-card header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(90deg, rgba(69, 179, 255, 0.12), rgba(246, 179, 66, 0.08)), var(--panel-strong);
    }
    .eyebrow {
      margin: 0 0 4px;
      color: var(--cyan);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      font-size: 17px;
      line-height: 1.25;
      letter-spacing: 0;
    }
    .preview-link {
      display: block;
      padding: 14px;
      background: #0b0f14;
    }
    .featured .preview-link {
      padding: 18px;
      max-height: 1040px;
      overflow: hidden;
    }
    .preview-link img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid var(--line);
    }
    .compact .preview-link {
      max-height: 440px;
      overflow: hidden;
    }
    .card-copy {
      padding: 14px 16px 16px;
      border-top: 1px solid var(--line);
      background: rgba(24, 34, 52, 0.68);
    }
    .sections {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .sections span {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 9px;
      color: #cbd5e1;
      font-size: 12px;
      line-height: 1.4;
      background: rgba(7, 10, 16, 0.55);
    }
    code {
      color: var(--text);
      background: #010409;
      border: 1px solid var(--line);
      border-radius: 5px;
      padding: 1px 5px;
    }
    @media (max-width: 700px) {
      main { width: min(100% - 20px, 1180px); padding-top: 20px; }
      .page-header { display: block; }
      .meta { margin-top: 12px; text-align: left; min-width: 0; }
      .grid { grid-template-columns: 1fr; }
      h1 { font-size: 28px; }
    }
    @media (min-width: 701px) and (max-width: 1100px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  </style>
</head>
<body>
  <main>
    <section class="page-header">
      <div>
        <h1>GitHub Insights Examples</h1>
        <p>Generated for <a href="https://github.com/${escapeHtml(username)}">@${escapeHtml(username)}</a>${source}.</p>
      </div>
      <p class="meta">Last generated: ${escapeHtml(generatedAt)}</p>
    </section>
    <section class="hero">
${featuredCard}
    </section>
    <section class="grid">
${cards}
    </section>
  </main>
</body>
</html>
`;
}
