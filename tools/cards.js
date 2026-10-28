const fs = require("node:fs");
const path = require("node:path");

const H = 210;

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const THEMES = {
  light: {
    bg: "#f6f8fa",
    border: "#d0d7de",
    fg: "#1f2328",
    muted: "#59636e",
    rule: "#d8dee4",
  },
  dark: {
    bg: "#151b23",
    border: "#30363d",
    fg: "#f0f6fc",
    muted: "#9198a1",
    rule: "#262c36",
  },
};

const CARDS = [
  {
    name: "about",
    width: 936,
    label: "ABOUT",
    accent: { light: "#bc4c00", dark: "#f0883e" },
    stat: null,
    caption: [
      "Full-stack developer focused on building reliable, scalable web applications.",
      "Gained production engineering experience working on a restaurant POS system.",
      "Built CineTickets, a real-time movie booking platform with Redis-powered seat locking, payment integration, and automated Docker deployments.",
    ],
    items: [
      ["Stack", "Node.js, TypeScript,  React, PostgreSQL"],
      ["Based in", "Kathmandu, Nepal"],
      ["Open to", "Software Engineer / Backend / Full-Stack roles"],
    ],
  },
  {
    name: "projects",
    width: 300,
    label: "PROJECTS",
    accent: { light: "#0969da", dark: "#4493f8" },
    stat: ["2+", "projects"],
    caption: "Full-stack applications built and deployed",
    items: [
      ["CineTickets", "Real-time booking, Redis, eSewa"],
      ["Next Chat", "Socket.IO, PostgreSQL, OAuth"],
    ],
  },
  {
    name: "experience",
    width: 300,
    label: "EXPERIENCE",
    accent: { light: "#1a7f37", dark: "#3fb950" },
    stat: ["1", "internship"],
    caption: "Software Engineering Intern at WiLL Design",
    items: [
      ["Backend debugging", "Fixed Redis cache consistency issue"],
      ["Quality engineering", "Regression testing, bug fixes, UI"],
    ],
  },
  {
    name: "infrastructure",
    width: 300,
    label: "INFRASTRUCTURE",
    accent: { light: "#8250df", dark: "#ab7df8" },
    stat: ["Homelab", "server"],
    caption: "Self-hosting applications with Docker & Nginx",
    items: [
      ["Docker & Nginx", "Containerization, reverse proxy"],
      ["CI/CD & Linux", "Automated deployments, SSH"],
    ],
  },
];

// Equivalent to Python's xml.sax.saxutils.escape().
// Escape quotes only when requested, as in the original aria-label.
function escapeXml(value, quote = false) {
  let result = String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (quote) {
    result = result.replace(/"/g, "&quot;");
  }

  return result;
}

function card(w, label, accent, stat, caption, items, t) {
  let head;
  let rule;
  let h;
  let aria;

  if (stat) {
    const [big, unit] = stat;

    const unitSvg = unit
      ? `<tspan dx="6" font-size="15" font-weight="600" fill="${t.muted}">${escapeXml(unit)}</tspan>`
      : "";

    head =
      `<text x="20" y="74" font-size="34" font-weight="700" fill="${t.fg}">${escapeXml(big)}${unitSvg}</text>` +
      `<text x="20" y="96" font-size="13" fill="${t.muted}">${escapeXml(caption)}</text>`;

    rule = 113;
    h = H;
    aria = `${big} ${unit} ${caption}`;
  } else {
    const [headline, ...lines] = caption;

    head =
      `<text x="20" y="64" font-size="18" font-weight="600" fill="${t.fg}">${escapeXml(headline)}</text>` +
      lines
        .map(
          (s, i) =>
            `<text x="20" y="${90 + i * 20}" font-size="14" fill="${t.muted}">${escapeXml(s)}</text>`,
        )
        .join("");

    rule = 90 + lines.length * 20;
    h = rule + 76;
    aria = caption.join(" ");
  }

  const wide = items.length > 2;

  const rows = items
    .map(([title, sub], i) => {
      const x = wide ? 20 + (i * (w - 40)) / items.length : 20;

      const y = wide ? rule + 35 : rule + 27 + i * 36;

      return (
        `<circle cx="${x + 6}" cy="${y - 4}" r="3" fill="${accent}"/>` +
        `<text x="${x + 18}" y="${y}" font-size="13" font-weight="600" fill="${t.fg}">${escapeXml(title)}</text>` +
        `<text x="${x + 18}" y="${y + 16}" font-size="12" fill="${t.muted}">${escapeXml(sub)}</text>`
      );
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}" role="img" aria-label="${escapeXml(label)}: ${escapeXml(aria, true)}">
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="${t.bg}" stroke="${t.border}"/>
<rect x="20" y="0.5" width="40" height="3" rx="1.5" fill="${accent}"/>
<text x="20" y="32" font-size="11" font-weight="700" letter-spacing="1.4" fill="${accent}">${escapeXml(label)}</text>
${head}
<line x1="20" y1="${rule}" x2="${w - 20}" y2="${rule}" stroke="${t.rule}"/>
${rows}
</svg>
`;
}

const out = path.resolve(__dirname, "../assets");

fs.mkdirSync(out, { recursive: true });

let generated = 0;

for (const { name, width, label, accent, stat, caption, items } of CARDS) {
  for (const [mode, theme] of Object.entries(THEMES)) {
    const svg = card(width, label, accent[mode], stat, caption, items, theme);

    const file = path.join(out, `card-${name}-${mode}.svg`);

    fs.writeFileSync(file, svg, "utf8");
    generated++;
  }
}

console.log(`wrote ${generated} cards to ${out}`);
