"use client";

import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";
import { NODE_COLORS, type CanvasNode, type NodeShape } from "@/types/canvas";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

// ---- lightweight SVG preview ------------------------------------------------

const PREVIEW_W = 320;
const PREVIEW_H = 180;
const PAD = 14;

function getTextColor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? "#EDEDED";
}

function NodePreviewShape({
  node,
  px,
  py,
  pw,
  ph,
}: {
  node: CanvasNode;
  px: number;
  py: number;
  pw: number;
  ph: number;
}) {
  const fill = node.data.color;
  const stroke = getTextColor(fill);
  const textColor = stroke;
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  const label = node.data.label;
  const fontSize = Math.max(6, Math.min(10, pw / 8));
  const sw = 1.5;

  function shape(s: NodeShape) {
    switch (s) {
      case "circle":
        return (
          <ellipse
            cx={cx}
            cy={cy}
            rx={pw / 2}
            ry={ph / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        );
      case "pill":
        return (
          <rect
            x={px}
            y={py}
            width={pw}
            height={ph}
            rx={ph / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        );
      case "diamond": {
        const pts = `${cx},${py} ${px + pw},${cy} ${cx},${py + ph} ${px},${cy}`;
        return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
      }
      case "hexagon": {
        const pts = [
          `${cx},${py}`,
          `${px + pw},${py + ph * 0.25}`,
          `${px + pw},${py + ph * 0.75}`,
          `${cx},${py + ph}`,
          `${px},${py + ph * 0.75}`,
          `${px},${py + ph * 0.25}`,
        ].join(" ");
        return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />;
      }
      case "cylinder":
        return (
          <g>
            <rect x={px} y={py + ph * 0.18} width={pw} height={ph * 0.64} fill={fill} />
            <ellipse cx={cx} cy={py + ph * 0.18} rx={pw / 2} ry={ph * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
            <ellipse cx={cx} cy={py + ph * 0.82} rx={pw / 2} ry={ph * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
            <line x1={px} y1={py + ph * 0.18} x2={px} y2={py + ph * 0.82} stroke={stroke} strokeWidth={sw} />
            <line x1={px + pw} y1={py + ph * 0.18} x2={px + pw} y2={py + ph * 0.82} stroke={stroke} strokeWidth={sw} />
          </g>
        );
      default:
        return (
          <rect x={px} y={py} width={pw} height={ph} rx={Math.min(3, ph * 0.15)} fill={fill} stroke={stroke} strokeWidth={sw} />
        );
    }
  }

  return (
    <g>
      {shape(node.data.shape)}
      {label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fill={textColor}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  if (template.nodes.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of template.nodes) {
    const w = node.width ?? 120;
    const h = node.height ?? 50;
    if (node.position.x < minX) minX = node.position.x;
    if (node.position.y < minY) minY = node.position.y;
    if (node.position.x + w > maxX) maxX = node.position.x + w;
    if (node.position.y + h > maxY) maxY = node.position.y + h;
  }

  const boundsW = maxX - minX || 1;
  const boundsH = maxY - minY || 1;
  const availW = PREVIEW_W - PAD * 2;
  const availH = PREVIEW_H - PAD * 2;
  const scale = Math.min(availW / boundsW, availH / boundsH);

  const scaledW = boundsW * scale;
  const scaledH = boundsH * scale;
  const offsetX = PAD + (availW - scaledW) / 2;
  const offsetY = PAD + (availH - scaledH) / 2;

  function toScreen(worldX: number, worldY: number) {
    return {
      x: (worldX - minX) * scale + offsetX,
      y: (worldY - minY) * scale + offsetY,
    };
  }

  function nodeCenter(node: CanvasNode) {
    const w = node.width ?? 120;
    const h = node.height ?? 50;
    return toScreen(node.position.x + w / 2, node.position.y + h / 2);
  }

  const centerMap = new Map<string, { x: number; y: number }>();
  for (const node of template.nodes) {
    centerMap.set(node.id, nodeCenter(node));
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {template.edges.map((edge) => {
        const s = centerMap.get(edge.source);
        const t = centerMap.get(edge.target);
        if (!s || !t) return null;
        return (
          <line
            key={edge.id}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
          />
        );
      })}
      {template.nodes.map((node) => {
        const w = (node.width ?? 120) * scale;
        const h = (node.height ?? 50) * scale;
        const pos = toScreen(node.position.x, node.position.y);
        return (
          <NodePreviewShape
            key={node.id}
            node={node}
            px={pos.x}
            py={pos.y}
            pw={w}
            ph={h}
          />
        );
      })}
    </svg>
  );
}

// ---- modal ------------------------------------------------------------------

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90vw] sm:max-w-275 bg-surface border-surface-border">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-lg text-copy-primary">Import Template</DialogTitle>
          <p className="text-sm text-copy-muted leading-relaxed">
            Choose a starter template to pre-populate your canvas. Any existing nodes will be
            replaced — use{" "}
            <kbd className="rounded-md border border-surface-border bg-elevated px-1.5 py-0.5 font-mono text-xs text-copy-secondary">
              Ctrl/⌘ + Z
            </kbd>{" "}
            to undo.
          </p>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-3 gap-6">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col rounded-2xl border border-surface-border bg-elevated overflow-hidden hover:border-brand transition-colors"
            >
              <div className="bg-base flex h-56 items-center justify-center">
                <TemplatePreview template={template} />
              </div>

              <div className="flex flex-col gap-2 p-4">
                <p className="text-sm font-semibold text-copy-primary">{template.name}</p>
                <p className="text-xs text-copy-muted leading-relaxed">{template.description}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-2 border-surface-border text-copy-secondary hover:text-copy-primary"
                  onClick={() => handleImport(template)}
                >
                  <Download size={13} />
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
