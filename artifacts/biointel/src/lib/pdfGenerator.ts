import { jsPDF } from 'jspdf';
import { getIntelligence } from './api';
import type { Species } from './types';

// ─── palette (fairy tale / warm kids-coloring style) ─────────────────────────
const C = {
  cream:   [255, 252, 244] as [number, number, number],
  parchment: [245, 238, 220] as [number, number, number],
  teal:    [0,  185, 170] as [number, number, number],
  tealPale:[200, 245, 240] as [number, number, number],
  coral:   [240, 100,  80] as [number, number, number],
  coralPale:[255, 225, 218] as [number, number, number],
  gold:    [220, 165,  30] as [number, number, number],
  goldPale:[255, 245, 200] as [number, number, number],
  green:   [ 60, 170, 110] as [number, number, number],
  greenPale:[210, 245, 228] as [number, number, number],
  crimson: [200,  60,  80] as [number, number, number],
  crimsonPale:[255, 215, 220] as [number, number, number],
  purple:  [120,  80, 190] as [number, number, number],
  purplePale:[230, 215, 255] as [number, number, number],
  dark:    [ 40,  36,  52] as [number, number, number],
  mid:     [ 90,  85, 100] as [number, number, number],
  light:   [160, 155, 170] as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
};

const W  = 210;   // A4 portrait mm
const H  = 297;
const M  = 14;    // margin
const CW = W - M * 2;

type RGB = [number, number, number];

// ─── helpers ──────────────────────────────────────────────────────────────────

function bg(doc: jsPDF, color: RGB) {
  doc.setFillColor(...color);
  doc.rect(0, 0, W, H, 'F');
}

function filledRect(doc: jsPDF, x: number, y: number, w: number, h: number, color: RGB) {
  doc.setFillColor(...color);
  doc.rect(x, y, w, h, 'F');
}

function dot(doc: jsPDF, cx: number, cy: number, r: number, color: RGB) {
  doc.setFillColor(...color);
  doc.circle(cx, cy, r, 'F');
}

function text(
  doc: jsPDF,
  str: string,
  x: number,
  y: number,
  opts: { size?: number; color?: RGB; bold?: boolean; align?: 'left' | 'center' | 'right' } = {},
) {
  const { size = 11, color = C.dark, bold = false, align = 'left' } = opts;
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(str, x, y, { align });
}

function sectionHeader(
  doc: jsPDF,
  label: string,
  y: number,
  accent: RGB,
  pale: RGB,
  icon: string,
): number {
  filledRect(doc, M, y, CW, 9, pale);
  filledRect(doc, M, y, 3.5, 9, accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...accent);
  doc.text(`${icon}  ${label.toUpperCase()}`, M + 7, y + 6.2);
  return y + 9 + 5;
}

function wrappedText(
  doc: jsPDF,
  str: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  size: number,
  color: RGB = C.dark,
): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(str, maxW) as string[];
  lines.forEach((line: string, i: number) => {
    if (y + i * lineH > H - M - 8) {
      doc.addPage();
      bg(doc, C.cream);
      decorativeCorners(doc);
      y = M + 8 - i * lineH;
    }
    doc.text(line, x, y + i * lineH);
  });
  return y + lines.length * lineH;
}

function decorativeCorners(doc: jsPDF) {
  const r = 2.5;
  dot(doc, M + 2, M + 2, r, C.teal);
  dot(doc, W - M - 2, M + 2, r, C.coral);
  dot(doc, M + 2, H - M - 2, r, C.gold);
  dot(doc, W - M - 2, H - M - 2, r, C.green);
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function pillBadge(doc: jsPDF, label: string, value: string, x: number, y: number, accent: RGB, pale: RGB) {
  filledRect(doc, x, y, 42, 14, pale);
  filledRect(doc, x, y, 42, 3, accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...accent);
  doc.text(label.toUpperCase(), x + 21, y + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  const truncated = value.length > 18 ? value.slice(0, 17) + '…' : value;
  doc.text(truncated, x + 21, y + 12, { align: 'center' });
}

// ─── main export ──────────────────────────────────────────────────────────────

export async function generateSpeciesPdf(species: Species): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Fetch all intelligence in parallel
  const dimensions = ['evolution', 'anatomy', 'behavior', 'ecosystem', 'conservation'] as const;
  const intelligenceResults = await Promise.allSettled(
    dimensions.map(d => getIntelligence(species.commonName, species.scientificName, d)),
  );
  const intelligence: Record<string, string> = {};
  dimensions.forEach((d, i) => {
    const r = intelligenceResults[i];
    const raw = r.status === 'fulfilled' ? r.value.content : '';
    // Evolution returns structured JSON — flatten to readable prose for PDF
    if (d === 'evolution' && raw.includes('"quick_facts"')) {
      try {
        const evo = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
        const lines: string[] = [];
        if (evo.phylogenetic_position) lines.push(evo.phylogenetic_position);
        if (evo.summary) lines.push(evo.summary);
        if (evo.quick_facts?.length) {
          lines.push(evo.quick_facts.map((f: {label:string;value:string}) => `${f.label}: ${f.value}`).join('  ·  '));
        }
        if (evo.adaptations?.length) {
          lines.push('Key Adaptations — ' + evo.adaptations.map((a: {title:string;description:string}) => `${a.title}: ${a.description}`).join('  |  '));
        }
        intelligence[d] = lines.join('\n\n');
      } catch {
        intelligence[d] = raw;
      }
    } else {
      intelligence[d] = raw;
    }
  });

  // Load species image
  const imgData = await loadImageDataUrl(species.imageUrl);

  // ── PAGE 1: Cover ──────────────────────────────────────────────────────────
  bg(doc, C.cream);

  // Decorative stripe header
  filledRect(doc, 0, 0, W, 18, C.teal);
  filledRect(doc, 0, 0, W, 3.5, C.coral);
  filledRect(doc, 0, 14.5, W, 3.5, C.gold);

  text(doc, '✦  BioIntel Species Research Profile  ✦', W / 2, 12, {
    size: 12, color: C.white, bold: true, align: 'center',
  });

  let y = 24;

  // Decorative dots
  const dotColors: RGB[] = [C.coral, C.gold, C.green, C.purple, C.teal];
  for (let i = 0; i < 5; i++) {
    dot(doc, M + i * 9, y + 4, 2.5, dotColors[i]);
    dot(doc, W - M - i * 9, y + 4, 2.5, dotColors[i]);
  }
  y += 12;

  // Species image
  if (imgData) {
    const imgW = 100;
    const imgH = 66;
    const imgX = (W - imgW) / 2;
    // Teal border behind image
    filledRect(doc, imgX - 2, y - 2, imgW + 4, imgH + 4, C.teal);
    // Corner dots
    dot(doc, imgX - 2, y - 2, 2, C.coral);
    dot(doc, imgX + imgW + 2, y - 2, 2, C.gold);
    dot(doc, imgX - 2, y + imgH + 2, 2, C.green);
    dot(doc, imgX + imgW + 2, y + imgH + 2, 2, C.purple);
    doc.addImage(imgData, 'JPEG', imgX, y, imgW, imgH);
    y += imgH + 8;
  } else {
    filledRect(doc, M, y, CW, 50, C.tealPale);
    text(doc, species.commonName.toUpperCase()[0], W / 2, y + 30, {
      size: 40, color: C.teal, bold: true, align: 'center',
    });
    y += 58;
  }

  // Species name block
  filledRect(doc, M, y, CW, 22, C.parchment);
  filledRect(doc, M, y, CW, 2, C.teal);
  text(doc, species.commonName, W / 2, y + 10, { size: 22, color: C.dark, bold: true, align: 'center' });
  text(doc, species.scientificName, W / 2, y + 18, { size: 11, color: C.mid, align: 'center' });
  y += 26;

  // Taxonomy breadcrumb
  const taxon = [species.kingdom, species.phylum, species.class, species.order, species.family]
    .filter(Boolean).join('  ›  ');
  text(doc, taxon, W / 2, y + 5, { size: 8, color: C.light, align: 'center' });
  y += 12;

  // IUCN badge
  const iucnColors: Record<string, [RGB, RGB]> = {
    EX:  [C.dark,   [80, 80, 80]],
    EW:  [C.dark,   [80, 80, 80]],
    CR:  [C.crimson, C.crimsonPale],
    EN:  [C.coral,   C.coralPale],
    VU:  [C.gold,    C.goldPale],
    NT:  [C.green,   C.greenPale],
    LC:  [C.teal,    C.tealPale],
    DD:  [C.mid,     C.parchment],
    NE:  [C.mid,     C.parchment],
  };
  const [iucnAccent, iucnPale] = iucnColors[species.iucnStatus] ?? [C.mid, C.parchment];
  filledRect(doc, W / 2 - 28, y, 56, 10, iucnPale);
  filledRect(doc, W / 2 - 28, y, 56, 2, iucnAccent);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...iucnAccent);
  doc.text(`IUCN Status: ${species.iucnStatus}`, W / 2, y + 7.5, { align: 'center' });
  y += 16;

  // Quick facts row
  const facts: [string, string, RGB, RGB][] = [
    ['Diet', species.diet ?? '—', C.coral, C.coralPale],
    ['Habitat', species.habitat ?? '—', C.teal, C.tealPale],
    ['Lifespan', species.lifespan ?? '—', C.gold, C.goldPale],
    ['Population', species.population ?? '—', C.green, C.greenPale],
  ];
  facts.forEach(([label, value, accent, pale], i) => {
    pillBadge(doc, label, value, M + i * (CW / 4 + 0.5), y, accent, pale);
  });
  y += 22;

  // Generated-by footer on cover
  filledRect(doc, 0, H - 14, W, 14, C.teal);
  text(doc, `Generated by BioIntel AI  ·  AI-powered Species Intelligence Platform  ·  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    W / 2, H - 5.5, { size: 7, color: C.white, align: 'center' });

  // ── PAGE 2: Intelligence ────────────────────────────────────────────────────
  const sections: [string, string, RGB, RGB, string][] = [
    ['Evolution',     intelligence.evolution,     C.purple,  C.purplePale,  '🌱'],
    ['Anatomy',       intelligence.anatomy,       C.teal,    C.tealPale,    '🔬'],
    ['Behavior',      intelligence.behavior,      C.gold,    C.goldPale,    '⚡'],
    ['Ecosystem',     intelligence.ecosystem,     C.green,   C.greenPale,   '🌿'],
    ['Conservation',  intelligence.conservation,  C.crimson, C.crimsonPale, '🛡'],
  ];

  doc.addPage();
  bg(doc, C.cream);
  decorativeCorners(doc);

  // Intelligence title
  filledRect(doc, 0, 0, W, 14, C.parchment);
  text(doc, `Intelligence Report  ·  ${species.commonName}`, W / 2, 9.5, {
    size: 11, color: C.mid, bold: true, align: 'center',
  });

  y = 20;

  for (const [label, content, accent, pale, icon] of sections) {
    if (!content) continue;

    // New page if too close to bottom
    if (y > H - 55) {
      doc.addPage();
      bg(doc, C.cream);
      decorativeCorners(doc);
      y = M + 4;
    }

    y = sectionHeader(doc, label, y, accent, pale, icon);

    y = wrappedText(doc, content, M + 4, y, CW - 8, 5.2, 9.5, C.dark);
    y += 10;
  }

  // Footer on last page
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    if (p > 1) {
      filledRect(doc, 0, H - 10, W, 10, C.parchment);
      text(doc, `BioIntel · ${species.commonName} · Page ${p} of ${totalPages}`,
        W / 2, H - 3.5, { size: 7, color: C.light, align: 'center' });
    }
  }

  doc.save(`${species.commonName.toLowerCase().replace(/\s+/g, '-')}-biointel-profile.pdf`);
}
