/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "../jsx-factory.js";
import { BAR_COLORS, LAYOUT } from "../theme.js";
import type { SectionDef, ThemeMode } from "../types.js";
import { renderSectionHeader } from "./section.js";
import { StyleDefs } from "./style-defs.js";

function Background({ width, height }: { width: number; height: number }) {
  return (
    <>
      <rect width={width} height={height} rx="12" className="bg-fill" />
      <path
        d={`M ${width - 260} 0 L ${width} 0 L ${width} ${height} L ${width - 420} ${height} Z`}
        fill={BAR_COLORS[0]}
        opacity="0.05"
      />
      <path
        d={`M 0 ${height - 280} L 310 ${height} L 0 ${height} Z`}
        fill={BAR_COLORS[5]}
        opacity="0.05"
      />
    </>
  );
}

function SectionSurface({
  y,
  height,
  color,
}: {
  y: number;
  height: number;
  color: string;
}) {
  const x = 12;
  const width = LAYOUT.width - 24;
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="14"
        className="surface-fill surface-stroke"
        stroke-width="1"
        opacity="0.92"
      />
      <rect x={x} y={y} width="4" height={height} rx="2" fill={color} />
    </>
  );
}

export function wrapSectionSvg(
  bodySvg: string,
  height: number,
  mode: ThemeMode = "dark",
): string {
  const { width } = LAYOUT;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <StyleDefs mode={mode} />
      <Background width={width} height={height} />
      <SectionSurface y={12} height={height - 24} color={BAR_COLORS[0]} />
      {bodySvg}
    </svg>
  );
}

export function generateFullSvg(
  sections: SectionDef[],
  mode: ThemeMode = "dark",
): string {
  const { width, padY, sectionGap } = LAYOUT;
  let y = padY;
  let bodySvg = "";

  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const sectionTop = y - 12;
    const header = renderSectionHeader(section.title, section.subtitle, y);
    let sectionSvg = header.svg;
    let sectionHeight = header.height;

    if (section.renderBody) {
      const body = section.renderBody(y + header.height);
      sectionSvg += body.svg;
      sectionHeight += body.height;
    }

    const surfaceHeight = sectionHeight + 24;
    bodySvg += (
      <SectionSurface
        y={sectionTop}
        height={surfaceHeight}
        color={BAR_COLORS[index % BAR_COLORS.length]}
      />
    );
    bodySvg += sectionSvg;
    y += sectionHeight + sectionGap;
  }

  const totalHeight = y + padY - sectionGap;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
    >
      <StyleDefs mode={mode} />
      <Background width={width} height={totalHeight} />
      {bodySvg}
    </svg>
  );
}
