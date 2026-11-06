const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function profileFor(slug) {
  let hash = 0;
  for (const character of slug) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  return {
    mass: 0.8 + (hash % 9) / 10,
    lag: 0.035 + ((hash >>> 4) % 9) / 200,
    depth: 28 + ((hash >>> 8) % 8) * 5,
  };
}

/** Visual springs only: the native scroll and the loop's measured rows stay intact. */
export function initArchivePhysics() {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let states = new Map();
  let records = [];
  let frame = 0;
  let lastTick = 0;
  let lastInput = 0;
  let inputVelocity = 0;
  let velocity = 0;

  function clear(state) {
    state.offset = state.speed = 0;
    state.link.style.removeProperty("--archive-drift");
    state.link.classList.remove("archive-card__link--moving");
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = lastTick = lastInput = inputVelocity = velocity = 0;
    states.forEach(clear);
  }

  function forget(link) {
    const state = states.get(link);
    if (state) clear(state);
    states.delete(link);
  }

  function setRows(rows, streamTop) {
    const next = new Map();
    const compact = innerWidth <= 600;
    const limit = compact ? 18 : 44;
    records = rows.map((row) => {
      const card = row.firstElementChild;
      const link = card.querySelector(".archive-card__link");
      const top = streamTop + row.offsetTop;
      const caption = link?.querySelector(".archive-card__caption");
      const height = link ? Math.max(link.offsetHeight, (caption?.offsetTop || 0) + (caption?.offsetHeight || 0)) : card.offsetHeight;
      const record = { top, bottom: top + height, left: card.offsetLeft, right: card.offsetLeft + card.offsetWidth, about: !link, state: null };
      if (link) {
        let state = states.get(link);
        if (!state || state.sequence !== row.dataset.sequence) {
          if (state) clear(state);
          state = { link, sequence: row.dataset.sequence, offset: 0, speed: 0, profile: profileFor(card.dataset.slug || "") };
        }
        record.state = state;
        next.set(link, state);
      }
      return record;
    });
    states.forEach((state, link) => { if (!next.has(link)) clear(state); });
    states = next;
    records.forEach((record, index) => {
      if (!record.state) return;
      const overlaps = (other) => other.left < record.right - 1 && other.right > record.left + 1;
      const before = records.slice(0, index).reverse().find(overlaps);
      const after = records.slice(index + 1).find(overlaps);
      function allowance(neighbor, gap) {
        // About keeps its full gutter; two moving cards share the available space.
        const gutter = neighbor?.about ? (compact ? 32 : 48) : 12;
        return neighbor ? clamp((gap - gutter) / 2, 0, limit) : limit;
      }
      record.state.up = allowance(before, record.top - (before?.bottom || 0));
      record.state.down = allowance(after, (after?.top || 0) - record.bottom);
      const bounded = clamp(record.state.offset, -record.state.up, record.state.down);
      if (bounded !== record.state.offset) {
        record.state.offset = bounded;
        record.state.speed = 0;
        record.state.link.style.setProperty("--archive-drift", `${bounded.toFixed(2)}px`);
      }
    });
  }

  function tick(now) {
    frame = 0;
    if (preference.matches || document.hidden) { reset(); return; }
    const dt = clamp(lastTick ? (now - lastTick) / 1000 : 1 / 60, 1 / 120, 1 / 30);
    lastTick = now;
    if (now - lastInput > 48) inputVelocity *= Math.exp(-dt / 0.075);
    velocity += (inputVelocity - velocity) * (1 - Math.exp(-dt / 0.065));
    const activity = Math.min(1, Math.abs(velocity) / 700);
    const force = velocity / (1 + Math.abs(velocity) / 900);
    const scroll = scrollY;
    const height = innerHeight;
    let moving = Math.abs(velocity) > 1 || Math.abs(inputVelocity) > 1;
    // Read cached geometry first, then write only transforms on visible links.
    records.forEach((record) => {
      const state = record.state;
      if (!state) return;
      const visible = record.bottom > scroll - 160 && record.top < scroll + height + 160;
      if (!visible || state.link.contains(document.activeElement)) { clear(state); return; }
      const center = (record.top + record.bottom) / 2;
      const depth = clamp((center - scroll - height / 2) / height, -1, 1);
      const target = clamp(force * state.profile.lag + depth * state.profile.depth * activity, -state.up, state.down);
      const stiffness = 190 / state.profile.mass;
      const damping = 2.1 * Math.sqrt(stiffness);
      state.speed += ((target - state.offset) * stiffness - state.speed * damping) * dt;
      const position = state.offset + state.speed * dt;
      state.offset = clamp(position, -state.up, state.down);
      if (position !== state.offset) state.speed = 0;
      if (Math.abs(target) < 0.04 && Math.abs(state.offset) < 0.04 && Math.abs(state.speed) < 0.2) clear(state);
      else {
        state.link.style.setProperty("--archive-drift", `${state.offset.toFixed(2)}px`);
        state.link.classList.add("archive-card__link--moving");
        moving = true;
      }
    });
    if (moving) frame = requestAnimationFrame(tick);
    else { lastTick = 0; inputVelocity = velocity = 0; }
  }

  function feed({ time, velocity: delta }) {
    if (preference.matches || document.hidden || !states.size) return;
    if (Math.abs(delta) > innerHeight * 0.85) { reset(); return; }
    const dt = clamp(lastInput ? (time - lastInput) / 1000 : 1 / 60, 1 / 120, 1 / 20);
    inputVelocity = clamp(delta / dt, -2400, 2400);
    lastInput = time;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  preference.addEventListener("change", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });
  window.addEventListener("resize", reset, { passive: true });
  return { feed, setRows, reset, forget };
}
