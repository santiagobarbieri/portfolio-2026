const gap = 24;

function overlap(a, b) {
  return Math.abs(a.x - b.x) < (a.width + b.width) / 2 + gap
    && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + gap;
}

function makeGroup(config) {
  const pieces = config.items.map((item) => {
    const ratio = item.w > 0 && item.h > 0 ? item.w / item.h : 1;
    const width = Math.min(config.width, config.height * ratio);
    return { item, width, height: width / ratio };
  });
  let radius = config.radius;
  // The actual image proportions determine spacing, including hover clearance.
  for (let attempt = 0; attempt < 200; attempt += 1) {
    pieces.forEach((piece, index) => {
      const angle = -Math.PI / 2 + index / pieces.length * Math.PI * 2;
      piece.x = Math.cos(angle) * radius;
      piece.y = Math.sin(angle) * radius;
    });
    if (!pieces.some((piece, index) => pieces.slice(index + 1).some((other) => overlap(piece, other)))) break;
    radius += 12;
  }
  const left = Math.min(-radius, ...pieces.map((piece) => piece.x - piece.width / 2));
  const top = Math.min(-radius, ...pieces.map((piece) => piece.y - piece.height / 2));
  const right = Math.max(radius, ...pieces.map((piece) => piece.x + piece.width / 2));
  const bottom = Math.max(radius, ...pieces.map((piece) => piece.y + piece.height / 2));
  return { ...config, pieces, radius, x: 0, y: 0, local: { x: left, y: top, width: right - left, height: bottom - top } };
}

export function buildSandboxLayout(configs) {
  const groups = configs.filter((config) => config.items.length).map(makeGroup);
  const rows = [groups.slice(0, 3), groups.slice(3)].filter((row) => row.length);
  const rowWidth = (row) => row.reduce((sum, group) => sum + group.local.width, 0) + Math.max(0, row.length - 1) * 112;
  const width = Math.max(...rows.map(rowWidth)) + 160;
  let top = 80;
  let firstRow;
  rows.forEach((row, index) => {
    let left = (width - rowWidth(row)) / 2;
    const height = Math.max(...row.map((group) => group.local.height));
    row.forEach((group) => {
      group.x = left - group.local.x;
      group.y = top + (height - group.local.height) / 2 - group.local.y;
      group.bounds = { x: left, y: group.y + group.local.y, width: group.local.width, height: group.local.height };
      group.pieces.forEach((piece) => { piece.x += group.x; piece.y += group.y; });
      left += group.local.width + 112;
    });
    if (index === 0) firstRow = { x: 80, y: top, width: width - 160, height };
    top += height + 160;
  });
  return { groups, bounds: { x: 0, y: 0, width, height: top - 80 }, opening: firstRow };
}
