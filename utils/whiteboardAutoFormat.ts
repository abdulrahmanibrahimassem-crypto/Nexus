export interface AutoFormatSpellingFix {
  original: string;
  corrected: string;
  explanation: string;
}

export interface AutoFormatSection {
  id: string;
  title: string;
  badge?: string;
  items: string[];
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  width: number; // 0-100 percentage
  height: number; // 0-100 percentage
  shapeType?: 'rounded_rect' | 'rectangle' | 'diamond' | 'circle';
  accentColor?: string;
}

export interface AutoFormatGeometricShape {
  id: string;
  shapeType: 'rounded_rect' | 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'line';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed';
  label?: string;
}

export interface WhiteboardAutoFormatResult {
  detectedSummary: string;
  layoutStructure: 'flowchart' | 'notes_grid' | 'formula_derivation' | 'mindmap' | 'concept_cards';
  spellingFixes: AutoFormatSpellingFix[];
  formattedSections: AutoFormatSection[];
  geometricShapes: AutoFormatGeometricShape[];
  cleanFullText: string;
  suggestedFont?: 'monospace' | 'sans-serif' | 'serif';
}

export interface AutoFormatRenderOptions {
  mode: 'replace' | 'stamp_side';
  fontStyle: 'monospace' | 'sans-serif' | 'serif';
  isDarkTheme?: boolean;
  bgHex?: string;
  snapToGrid?: boolean;
}

/**
 * Draws rounded rectangle with optional individual corner radii
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Draws polished arrow with clean arrowhead
 */
function drawCleanArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  lineWidth: number = 2.5,
  label?: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const headLength = 14;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  // Line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  // Label badge on arrow if present
  if (label) {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(label).width;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 4;
    drawRoundedRect(ctx, midX - textWidth / 2 - 6, midY - 14, textWidth + 12, 18, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, midX, midY - 5);
  }

  ctx.restore();
}

/**
 * Draws a decision diamond geometric shape
 */
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor?: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.lineTo(x, y + height / 2);
  ctx.closePath();

  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/**
 * Renders the full Auto-Formatted board onto the HTML5 Canvas
 */
export function renderAutoFormattedBoard(
  canvas: HTMLCanvasElement,
  data: WhiteboardAutoFormatResult,
  options: AutoFormatRenderOptions
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const isDark = options.isDarkTheme || false;

  if (options.mode === 'replace') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();

  const fontFamily =
    options.fontStyle === 'monospace'
      ? '"JetBrains Mono", monospace'
      : options.fontStyle === 'serif'
      ? 'Newsreader, Georgia, serif'
      : 'system-ui, -apple-system, sans-serif';

  // 1. Draw Standalone Geometric Shapes & Connectors (Arrows, Lines, Diamonds)
  if (data.geometricShapes && data.geometricShapes.length > 0) {
    for (const shape of data.geometricShapes) {
      const stroke = shape.strokeColor || '#D97706';
      const fill = shape.fillColor || (isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)');

      if (shape.shapeType === 'arrow' && shape.fromX !== undefined && shape.toX !== undefined) {
        const fromX = (shape.fromX / 100) * width;
        const fromY = ((shape.fromY || 0) / 100) * height;
        const toX = (shape.toX / 100) * width;
        const toY = ((shape.toY || 0) / 100) * height;
        drawCleanArrow(ctx, fromX, fromY, toX, toY, stroke, shape.strokeWidth || 2.5, shape.label);
      } else if (shape.shapeType === 'diamond' && shape.x !== undefined) {
        const sx = (shape.x / 100) * width;
        const sy = ((shape.y || 0) / 100) * height;
        const sw = ((shape.width || 20) / 100) * width;
        const sh = ((shape.height || 20) / 100) * height;
        drawDiamond(ctx, sx, sy, sw, sh, stroke, fill);
        if (shape.label) {
          ctx.fillStyle = isDark ? '#F1F5F9' : '#1C1917';
          ctx.font = `bold 11px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(shape.label, sx + sw / 2, sy + sh / 2 + 4);
        }
      } else if (shape.shapeType === 'circle' && shape.x !== undefined) {
        const cx = ((shape.x + (shape.width || 20) / 2) / 100) * width;
        const cy = (((shape.y || 0) + (shape.height || 20) / 2) / 100) * height;
        const r = (((shape.width || 20) / 2) / 100) * width;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = shape.strokeWidth || 2;
        ctx.stroke();
        if (shape.label) {
          ctx.fillStyle = isDark ? '#F1F5F9' : '#1C1917';
          ctx.font = `bold 11.5px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(shape.label, cx, cy + 4);
        }
      }
    }
  }

  // 2. Draw Structured Cards with Clean Typography & Geometric Enclosures
  if (data.formattedSections && data.formattedSections.length > 0) {
    for (const section of data.formattedSections) {
      const cardX = (section.x / 100) * width;
      const cardY = (section.y / 100) * height;
      const cardW = Math.max(220, (section.width / 100) * width);
      const cardH = Math.max(140, (section.height / 100) * height);
      const accent = section.accentColor || '#059669';

      // Soft Shadow
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // Card Background
      ctx.fillStyle = isDark ? '#1E293B' : '#FFFFFF';
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 16);
      ctx.fill();

      // Reset Shadow for crisp borders
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Card Outline Border
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Card Header Banner
      const headerH = 36;
      ctx.save();
      ctx.beginPath();
      const r = 16;
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardW - r, cardY);
      ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + r, r);
      ctx.lineTo(cardX + cardW, cardY + headerH);
      ctx.lineTo(cardX, cardY + headerH);
      ctx.lineTo(cardX, cardY + r);
      ctx.arcTo(cardX, cardY, cardX + r, cardY, r);
      ctx.closePath();
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.restore();

      // Header Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold 12.5px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const truncatedTitle = section.title.length > 35 ? section.title.substring(0, 33) + '…' : section.title;
      ctx.fillText(truncatedTitle, cardX + 14, cardY + headerH / 2);

      // Badge if present
      if (section.badge) {
        ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
        const badgeW = ctx.measureText(section.badge).width + 12;
        const badgeX = cardX + cardW - badgeW - 10;
        const badgeY = cardY + 8;
        
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        drawRoundedRect(ctx, badgeX, badgeY, badgeW, 18, 9);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(section.badge, badgeX + badgeW / 2, badgeY + 9);
      }

      // Card Content Items / Formulas
      ctx.fillStyle = isDark ? '#F1F5F9' : '#2C1D11';
      ctx.font = `12px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      let currentLineY = cardY + headerH + 12;
      const maxLineY = cardY + cardH - 12;
      const itemMarginLeft = cardX + 14;
      const maxTextWidth = cardW - 28;

      for (const item of section.items) {
        if (currentLineY > maxLineY) break;

        // Clean up markdown markers for crisp canvas typography
        const cleanItem = item.replace(/^\*\*(.*?)\*\*:/, '$1:');
        
        // Handle formula or emphasis lines
        const isFormula = cleanItem.includes('=') || cleanItem.includes('f(x)') || cleanItem.includes('Δ') || cleanItem.includes('√');
        if (isFormula) {
          ctx.font = `bold 12px ${fontFamily}`;
          ctx.fillStyle = accent;
        } else {
          ctx.font = `11.5px ${fontFamily}`;
          ctx.fillStyle = isDark ? '#E2E8F0' : '#334155';
        }

        // Wrap text if needed
        const words = cleanItem.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            ctx.fillText(line, itemMarginLeft, currentLineY);
            line = words[n] + ' ';
            currentLineY += 17;
            if (currentLineY > maxLineY) break;
          } else {
            line = testLine;
          }
        }
        if (currentLineY <= maxLineY && line.trim()) {
          ctx.fillText(line, itemMarginLeft, currentLineY);
          currentLineY += 20;
        }
      }
    }
  }

  // 3. Top Watermark Badge showing Auto-Formatted Stamp
  ctx.save();
  const tagText = '✨ GEMINI AUTO-FORMATTED • STANDARDIZED TYPOGRAPHY & SHAPES';
  ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
  const tagW = ctx.measureText(tagText).width + 24;
  const tagX = width - tagW - 24;
  const tagY = 16;

  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 8;
  drawRoundedRect(ctx, tagX, tagY, tagW, 26, 13);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#059669';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, tagX + tagW / 2, tagY + 13);
  ctx.restore();

  ctx.restore();
}
