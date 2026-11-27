/* About: one native scroll, four chapters. No timed playback or wheel hijacking. */
(() => {
  window.createAboutJourney = ({ scroller, root, makeImage, work, interests, portrait = null, initial = 'testament', onChapter, openProject, close }) => {
    const controller = new AbortController(), { signal } = controller;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width: 700px)');
    const chapters = [['testament', 'Quién soy'], ['work', 'Mi trabajo'], ['interests', 'Gustos'], ['credentials', 'Credenciales']];
    const starts = [0, .24, .62, .83], destinations = [.025, .30, .69, .92];
    let frame = 0, resizeFrame = 0, disposed = false, linear = false, active = -1, max = 1, railTravel = 0;
    const node = (tag, className, text) => {
      const n = document.createElement(tag); if (className) n.className = className;
      if (text) n.textContent = text; return n;
    };
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const segment = (p, a, b) => clamp((p - a) / (b - a));
    const ease = t => t * t * (3 - 2 * t);
    const label = text => node('span', 'about-label', text);
    const track = node('div', 'about-track'), stage = node('div', 'about-stage');
    const status = node('p', 'visually-hidden'); status.setAttribute('role', 'status');
    const index = node('nav', 'about-index'); index.setAttribute('aria-label', 'Capítulos de Sobre mí');
    const scenes = chapters.map(([key, title], i) => {
      const section = node('section', `about-scene about-scene--${key}`); section.dataset.aboutChapter = key;
      section.id = `about-${key}`; section.setAttribute('aria-label', title);
      const content = node('div', 'about-scene__content'); section.append(content); stage.append(section);
      const button = node('button', 'about-index__button', title); button.type = 'button';
      button.dataset.aboutTab = key; button.setAttribute('aria-controls', section.id);
      button.addEventListener('click', () => goTo(i)); index.append(button);
      return { section, content, button };
    });
    const intro = node('div', 'about-intro');
    const introCopy = node('div', 'about-intro__copy');
    introCopy.append(label('Sobre mí'), node('h2', 'about-title about-title--hello', 'Hola, soy Santiago.'));
    introCopy.append(node('p', 'about-intro__lead', 'Diseñador gráfico, director creativo, desarrollador web y fotógrafo.'));
    const identity = node('div', 'about-intro__identity');
    identity.append(node('p', 'about-copy', 'Soy cofundador y director creativo de Apolo Studios. Trabajo en identidades, prendas, campañas y experiencias digitales.'));
    const facts = node('div', 'about-intro__facts'); facts.append(label('Buenos Aires, Argentina'), label('Apolo Studios · Cofundador'));
    identity.append(facts);
    const portraitField = node('figure', `about-portrait${portrait ? '' : ' about-portrait--pending'}`);
    if (portrait) { portraitField.append(makeImage(portrait, false), node('figcaption', '', 'Santiago Barbieri')); }
    else {
      // A personal photograph must be supplied by Santiago; never substitute a campaign model.
      portraitField.append(node('span', 'about-portrait__monogram', 'SB'), node('figcaption', '', 'Retrato por incorporar'));
      portraitField.firstChild.setAttribute('aria-hidden', 'true');
    }
    const introAside = node('div', 'about-intro__aside'); introAside.append(portraitField, identity);
    intro.append(introCopy, introAside); scenes[0].content.append(intro);

    const workHeader = node('header', 'about-work__header');
    workHeader.append(label('Mi trabajo'), node('h2', 'about-title', 'De una idea a una pieza.'));
    const railWindow = node('div', 'about-work__window'), rail = node('div', 'about-work__rail');
    work.forEach(item => {
      const card = node('article', 'about-work-card'), button = node('button', 'about-work-card__open'); button.type = 'button';
      button.setAttribute('aria-label', `Abrir ${item.name}`); button.dataset.aboutProject = item.slug;
      button.append(makeImage(item.image, false)); button.addEventListener('click', () => openProject(item.slug));
      const caption = node('div', 'about-work-card__caption');
      caption.append(node('h3', '', item.name), node('p', '', item.detail), label(item.year));
      card.append(button, caption); rail.append(card);
    });
    railWindow.append(rail); scenes[1].content.append(workHeader, railWindow);

    const taste = node('div', 'about-interests'), tasteCopy = node('header', 'about-interests__copy');
    tasteCopy.append(label('Gustos'), node('h2', 'about-title', 'Lo que miro. Lo que escucho.'), node('p', 'about-copy', 'Música, cine, diseño y fotografía.'));
    const collage = node('div', 'about-collage');
    interests.forEach(item => {
      const figure = node('figure', `about-interest about-interest--${item.kind}`);
      figure.append(makeImage(item.image, false), node('figcaption', '', item.label)); collage.append(figure);
    });
    taste.append(tasteCopy, collage); scenes[2].content.append(taste);

    const credentials = node('div', 'about-accreditations');
    credentials.append(label('Formación'), node('h2', 'about-title', 'Credenciales.'));
    [['Desarrollo web', 'Coderhouse'], ['Inglés · C1', 'Cambridge English · CAE']].forEach(([title, issuer]) => {
      const row = node('article', 'about-accreditation'); row.append(node('h3', '', title), node('p', '', issuer)); credentials.append(row);
    });
    const closing = node('div', 'about-accreditations__closing');
    closing.append(node('p', 'about-copy', 'El resto está en los proyectos.'));
    const returnButton = node('button', 'about-return', 'Volver a proyectos'); returnButton.type = 'button'; returnButton.addEventListener('click', close);
    closing.append(returnButton); credentials.append(closing); scenes[3].content.append(credentials);
    const controls = node('nav', 'about-controls'); controls.setAttribute('aria-label', 'Recorrer Sobre mí');
    const current = node('span', 'about-controls__current');
    const arrows = [-1, 1].map(direction => {
      const button = node('button', 'about-controls__arrow'); button.type = 'button';
      button.setAttribute('aria-label', direction < 0 ? 'Capítulo anterior' : 'Capítulo siguiente');
      button.innerHTML = `<svg class="ui-arrow ui-arrow--${direction < 0 ? 'left' : 'right'}" viewBox="0 0 9 9" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 1.5h5.5V7"/></svg>`;
      button.addEventListener('click', () => goTo(active + direction)); return button;
    });
    controls.append(arrows[0], current, arrows[1]);
    const hint = node('p', 'about-scroll-hint', 'Scroll para recorrer');
    track.append(stage); root.append(index, track, controls, hint, status);
    document.body.dataset.aboutJourney = 'true';

    function setChapter(i) {
      if (i === active) return;
      if (!linear && active >= 0 && scenes[active].section.contains(document.activeElement)) scroller.focus({ preventScroll:true });
      active = i; root.dataset.chapter = chapters[i][0];
      scenes.forEach((scene, n) => {
        if (n === i) scene.button.setAttribute('aria-current', 'step'); else scene.button.removeAttribute('aria-current');
        // Overlapping scenes stay painted until the next scene completely covers them.
        if (!linear) { scene.section.inert = n !== i; scene.section.setAttribute('aria-hidden', String(n !== i)); }
        else { scene.section.inert = false; scene.section.removeAttribute('aria-hidden'); }
      });
      current.textContent = `${String(i + 1).padStart(2, '0')} / 04 · ${chapters[i][1]}`;
      arrows[0].disabled = i === 0; arrows[1].disabled = i === scenes.length - 1;
      status.textContent = `${chapters[i][1]}. Capítulo ${i + 1} de 4.`;
      onChapter(chapters[i][0]);
    }
    function paint() {
      frame = 0; if (disposed) return;
      const y = scroller.scrollTop;
      if (linear) {
        const top = scroller.getBoundingClientRect().top, height = scroller.clientHeight;
        let chapter = 0;
        scenes.forEach((scene, i) => {
          const rect = scene.section.getBoundingClientRect();
          if (rect.top - top < height * .45) chapter = i;
          const reveal = reduced.matches ? 1 : segment(height - (rect.top - top), 0, height * .55);
          scene.content.style.setProperty('--chapter-enter', String(reveal));
        }); setChapter(chapter); return;
      }
      const p = clamp(y / max); root.style.setProperty('--about-progress', String(p));
      let chapter = 0;
      scenes.forEach((scene, i) => {
        const reveal = i === 0 ? 1 : ease(segment(p, starts[i] - .045, starts[i] + .035));
        const covered = i < scenes.length - 1 && p >= starts[i + 1] + .035;
        scene.section.style.visibility = reveal > 0 && !covered ? 'visible' : 'hidden';
        scene.section.style.clipPath = reveal >= 1 ? 'none' : `inset(${(1 - reveal) * 100}% 0 0 0)`;
        scene.content.style.setProperty('--chapter-enter', String(reveal));
        if (i && p >= starts[i] + .006) chapter = i;
      });
      const q = segment(p, .29, .59);
      rail.style.transform = `translate3d(${-q * railTravel}px,0,0)`;
      [...collage.children].forEach((piece, i) => {
        const q = segment(p, .62, .84), offset = (1 - ease(segment(q, 0, .48))) * (i % 2 ? 28 : -28);
        piece.style.transform = `translate3d(${offset}px,${(q - .5) * (i % 2 ? -12 : 12)}px,0)`;
      });
      hint.style.opacity = p < .035 ? '1' : '0'; setChapter(chapter);
    }
    function requestPaint() { if (!frame && !disposed) frame = requestAnimationFrame(paint); }
    function goTo(i, instant = false) {
      i = clamp(i, 0, scenes.length - 1);
      let top;
      if (linear) top = scenes[i].section.offsetTop;
      else top = destinations[i] * max;
      scroller.scrollTo({ top, behavior: instant || reduced.matches ? 'instant' : 'smooth' }); requestPaint();
    }
    function measure(keepChapter = true) {
      if (disposed) return;
      const previousLinear = linear, selected = Math.max(0, active), progress = clamp(scroller.scrollTop / max);
      // Measure only the fixed triggers; an open dropdown must never shift this layout.
      const chrome = [...document.querySelectorAll('.study-heading,.study-nav-trigger')].filter(n => n.getClientRects().length);
      const bottom = Math.max(80, ...chrome.map(n => n.getBoundingClientRect().bottom));
      scroller.style.setProperty('--about-safe-top', `${Math.ceil(bottom + 24)}px`);
      linear = reduced.matches || compact.matches || scroller.clientHeight < 650;
      root.classList.toggle('about-journey--linear', linear);
      root.style.setProperty('--about-screen', `${scroller.clientHeight}px`);
      max = Math.max(1, track.offsetHeight - scroller.clientHeight);
      railTravel = Math.max(0, rail.scrollWidth - railWindow.clientWidth);
      scenes.forEach(scene => {
        scene.section.style.removeProperty('visibility'); scene.section.style.removeProperty('clip-path');
        scene.content.style.removeProperty('--chapter-enter'); scene.section.inert = false; scene.section.removeAttribute('aria-hidden');
      });
      rail.style.removeProperty('transform'); [...collage.children].forEach(n => n.style.removeProperty('transform'));
      active = -1;
      if (keepChapter && previousLinear !== linear) goTo(selected, true);
      else if (keepChapter && !linear) scroller.scrollTop = progress * max;
      paint();
    }
    function scheduleMeasure() { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => measure()); }
    scroller.addEventListener('scroll', requestPaint, { passive: true, signal });
    window.addEventListener('resize', scheduleMeasure, { passive: true, signal });
    reduced.addEventListener('change', scheduleMeasure, { signal }); compact.addEventListener('change', scheduleMeasure, { signal });
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    measure(false); goTo(Math.max(0, chapters.findIndex(([key]) => key === initial)), true); paint();
    return {
      ready: Promise.all([...root.querySelectorAll('img')].map(image => image.decode().catch(() => {}))),
      goTo: key => goTo(Math.max(0, chapters.findIndex(([value]) => value === key))),
      destroy() {
        disposed = true; controller.abort(); cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame);
        delete document.body.dataset.aboutJourney; scroller.style.removeProperty('--about-safe-top');
      }
    };
  };
})();
