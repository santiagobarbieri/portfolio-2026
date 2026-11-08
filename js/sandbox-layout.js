// One shared field. Categories bias nearby positions, without enclosing the work.
function noise(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) / 4294967295;
}

function boundsOf(pieces, padding = 0) {
  const x = Math.min(...pieces.map((piece) => piece.x - piece.width / 2)) - padding;
  const y = Math.min(...pieces.map((piece) => piece.y - piece.height / 2)) - padding;
  const right = Math.max(...pieces.map((piece) => piece.x + piece.width / 2)) + padding;
  const bottom = Math.max(...pieces.map((piece) => piece.y + piece.height / 2)) + padding;
  return { x, y, width: right - x, height: bottom - y };
}

export function buildSandboxLayout(configs) {
  const active = configs.filter((config) => config.items.length);
  const count = active.reduce((sum, group) => sum + group.items.length, 0);
  const columns = Math.max(4, Math.ceil(Math.sqrt((count + active.length) * 1.7)));
  const rows = Math.ceil((count + active.length) / columns);
  const slots = Array.from({ length: columns * rows }, (_, index) => {
    const row = Math.floor(index / columns), column = index % columns;
    return {
      x: 198 + column * 236 + (row % 2 ? 36 : 0) + (noise(`x:${index}`) - 0.5) * 16,
      y: 199 + row * 238 + (noise(`y:${index}`) - 0.5) * 16,
    };
  });
  const fieldWidth = (columns - 1) * 236, fieldHeight = Math.max(238, (rows - 1) * 238);
  function takeSlot(group, seed, random = true) {
    let best = 0, score = Infinity;
    slots.forEach((slot, index) => {
      const dx = (slot.x - 198) / Math.max(236, fieldWidth) - group.anchor[0];
      const dy = (slot.y - 199) / fieldHeight - group.anchor[1];
      const candidate = dx * dx + dy * dy + (random ? noise(`${seed}:${index}`) * 0.065 : 0);
      if (candidate < score) { score = candidate; best = index; }
    });
    return slots.splice(best, 1)[0];
  }
  const groups = active.map((config) => ({ ...config, ...takeSlot(config, config.id, false), radius: 78, pieces: [] }));
  // Place categories in turns, so no format claims a separate block of the field.
  for (let index = 0; index < Math.max(...groups.map((group) => group.items.length)); index += 1) {
    groups.forEach((group) => {
      const item = group.items[index];
      if (!item) return;
      const ratio = item.w > 0 && item.h > 0 ? item.w / item.h : 1;
      const width = Math.min(group.width, group.height * ratio);
      group.pieces.push({ item, width, height: width / ratio, ...takeSlot(group, `${item.projectSlug}:${item.original || item.src}`) });
    });
  }
  const pieces = groups.flatMap((group) => group.pieces);
  const field = boundsOf([...pieces, ...groups.map((group) => ({ x: group.x, y: group.y, width: 156, height: 156 }))], 70);
  groups.forEach((group) => {
    group.x -= field.x; group.y -= field.y;
    group.pieces.forEach((piece) => { piece.x -= field.x; piece.y -= field.y; });
    group.bounds = boundsOf([...group.pieces, { x: group.x, y: group.y, width: 156, height: 156 }]);
  });
  const bounds = { x: 0, y: 0, width: field.width, height: field.height };
  return { groups, bounds, opening: bounds };
}
