export function fitRectangle(rect, viewport, padding = 40, maximum = 1.2) {
  const scale = Math.min(maximum, Math.max(0.03, Math.min(
    (viewport.width - padding * 2) / rect.width,
    (viewport.height - padding * 2) / rect.height,
  )));
  return { x: viewport.width / 2 - (rect.x + rect.width / 2) * scale, y: viewport.height / 2 - (rect.y + rect.height / 2) * scale, scale };
}

export function worldPoint(camera, x, y) {
  return { x: (x - camera.x) / camera.scale, y: (y - camera.y) / camera.scale };
}

export function createSandboxCamera({ viewport, bounds, onChange, onRest }) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let size = { ...viewport };
  let current = fitRectangle(bounds, size, 24);
  let target = { ...current };
  let frame = 0;
  let lastTime = 0;
  const minimum = () => Math.max(0.03, Math.min(1, fitRectangle(bounds, size, 24).scale * 0.85));
  function constrain(value) {
    const state = { ...value, scale: Math.max(minimum(), Math.min(1.8, value.scale)) };
    // Edges may reach the centre, so edge groups can actually be centred.
    const axis = (position, start, length, screen) => length * state.scale < screen - 48
      ? (screen - length * state.scale) / 2 - start * state.scale
      : Math.min(screen / 2 - start * state.scale, Math.max(screen / 2 - (start + length) * state.scale, position));
    state.x = axis(state.x, bounds.x, bounds.width, size.width);
    state.y = axis(state.y, bounds.y, bounds.height, size.height);
    return state;
  }
  function emit() { onChange({ ...current }, { ...size }); }
  function stop() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    target = { ...current };
  }
  function tick(time) {
    frame = 0;
    if (reduced.matches) { current = { ...target }; lastTime = 0; emit(); onRest?.({ ...current }); return; }
    const elapsed = lastTime ? Math.min(40, time - lastTime) : 16;
    lastTime = time;
    const response = 1 - Math.exp(-elapsed / 62);
    for (const key of ["x", "y", "scale"]) current[key] += (target[key] - current[key]) * response;
    if (Math.abs(current.x - target.x) < 0.15 && Math.abs(current.y - target.y) < 0.15 && Math.abs(current.scale - target.scale) < 0.0002) {
      current = { ...target }; lastTime = 0; emit(); onRest?.({ ...current });
    } else { emit(); frame = requestAnimationFrame(tick); }
  }
  function move(value, immediate = false) {
    target = constrain(value);
    if (immediate || reduced.matches) {
      cancelAnimationFrame(frame); frame = 0; lastTime = 0;
      current = { ...target }; emit(); onRest?.({ ...current });
    } else if (!frame) frame = requestAnimationFrame(tick);
  }
  function zoom(scale, x = size.width / 2, y = size.height / 2, immediate = false) {
    const next = Math.max(minimum(), Math.min(1.8, scale));
    const point = worldPoint(target, x, y);
    move({ x: x - point.x * next, y: y - point.y * next, scale: next }, immediate);
  }
  return {
    get state() { return { ...current }; },
    get destination() { return { ...target }; },
    get size() { return { ...size }; },
    get moving() { return Boolean(frame); },
    get minimumScale() { return minimum(); },
    move, stop, zoom,
    pan(dx, dy, immediate = false) { move({ ...target, x: target.x + dx, y: target.y + dy }, immediate); },
    center(x, y, immediate = false) { move({ x: size.width / 2 - x * target.scale, y: size.height / 2 - y * target.scale, scale: target.scale }, immediate); },
    fit(rect = bounds, immediate = false) { move(fitRectangle(rect, size, rect === bounds ? 24 : 36), immediate); },
    resize(next) {
      const centre = worldPoint(current, size.width / 2, size.height / 2);
      stop(); size = { ...next };
      move({ x: size.width / 2 - centre.x * current.scale, y: size.height / 2 - centre.y * current.scale, scale: current.scale }, true);
    },
    destroy() { stop(); },
  };
}
