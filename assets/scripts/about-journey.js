/* About follows the six-scene timeline of Landing — scroll driven.html. */
(() => {
  window.createAboutJourney = ({ scroller, root, makeImage, work, interests, portrait = null, initial = 'opening', onChapter, openProject, close }) => {
    const controller = new AbortController(), { signal } = controller;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width: 700px)');
    const chapters = [['opening', 'Santiago Barbieri'], ['testament', 'Quién soy'], ['work', 'Mi trabajo'], ['interests', 'Gustos'], ['credentials', 'Credenciales'], ['ending', 'Proyectos']];
    // Original reference: five logo portals, six scenes, identical scroll intervals.
    const portals = [[0,0], [.03,.14], [.30,.38], [.52,.60], [.74,.81], [.90,.97]];
    const starts = [0,.14,.38,.60,.81,.97], destinations = [0,.23,.41,.68,.87,1];
    let frame = 0, resizeFrame = 0, disposed = false, linear = false, active = -1, max = 1, railTravel = 0, rendered = null, lastTime = 0;
    const node = (tag, className, text) => {
      const n = document.createElement(tag); if (className) n.className = className;
      if (text) n.textContent = text; return n;
    };
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const segment = (p, a, b) => clamp((p - a) / (b - a));
    const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const easeOut = t => 1 - Math.pow(1-t,3);
    const label = text => node('span', 'about-label', text);
    const track = node('div', 'about-track'), stage = node('div', 'about-stage');
    // Reuse the portfolio mark exactly; the logo is also the transition aperture.
    const logoPath = document.querySelector('.study-home .study-mark path').getAttribute('d');
    const NS = 'http://www.w3.org/2000/svg';
    const mark = className => {
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 50 50');
      svg.setAttribute('class', className); svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(NS, 'path'); path.setAttribute('d', logoPath); path.setAttribute('fill', 'currentColor'); svg.append(path); return svg;
    };
    const definitions = document.createElementNS(NS, 'svg'); definitions.setAttribute('class','about-portal-defs'); definitions.setAttribute('aria-hidden','true');
    const defs = document.createElementNS(NS, 'defs'); definitions.append(defs); root.append(definitions);
    const portalPaths = [];
    const token = 'about-' + Math.random().toString(36).slice(2,9);
    const status = node('p', 'visually-hidden'); status.setAttribute('role', 'status');
    const index = node('nav', 'about-index'); index.setAttribute('aria-label', 'Capítulos de Sobre mí');
    const scenes = chapters.map(([key, title], i) => {
      const section = node('section', `about-scene about-scene--${key}`); section.dataset.aboutChapter = key;
      section.id = `about-${key}`; section.setAttribute('aria-label', title);
      const content = node('div', 'about-scene__content');
      if (key === 'work') section.append(mark('about-scene__mark'));
      section.append(content); stage.append(section);
      if (i) {
        const clip = document.createElementNS(NS,'clipPath'); clip.id = `${token}-${i}`; clip.setAttribute('clipPathUnits','userSpaceOnUse');
        const path = document.createElementNS(NS,'path'); path.setAttribute('d',logoPath); clip.append(path); defs.append(clip); portalPaths[i] = {path,id:clip.id};
      }
      const button = node('button', 'about-index__button', title); button.type = 'button';
      button.dataset.aboutTab = key; button.setAttribute('aria-controls', section.id);
      button.addEventListener('click', () => goTo(i)); index.append(button);
      return { section, content, button };
    });
    const welcome = node('div','about-welcome');
    const heroLogo = mark('about-welcome__mark');
    welcome.append(heroLogo,node('h2','about-welcome__name','Santiago Barbieri'),node('p','about-welcome__line','Diseño, dirección creativa y fotografía.'));
    scenes[0].content.append(welcome);
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
      portraitField.append(node('figcaption', '', 'Retrato por incorporar'));
    }
    const introAside = node('div', 'about-intro__aside'); introAside.append(portraitField, identity);
    intro.append(introCopy, introAside); scenes[1].content.append(intro);

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
    railWindow.append(rail); scenes[2].content.append(workHeader, railWindow);

    const taste = node('div', 'about-interests'), tasteCopy = node('header', 'about-interests__copy');
    tasteCopy.append(label('Gustos'), node('h2', 'about-title', 'Lo que miro. Lo que escucho.'), node('p', 'about-copy', 'Música, cine, diseño y fotografía.'));
    const collage = node('div', 'about-collage');
    interests.forEach(item => {
      const figure = node('figure', `about-interest about-interest--${item.kind}`);
      figure.append(makeImage(item.image, false), node('figcaption', '', item.label)); collage.append(figure);
    });
    taste.append(tasteCopy, collage); scenes[3].content.append(taste);

    const credentials = node('div', 'about-accreditations');
    credentials.append(label('Formación'), node('h2', 'about-title', 'Credenciales.'));
    [['Desarrollo web', 'Coderhouse'], ['Inglés · C1', 'Cambridge English · CAE']].forEach(([title, issuer]) => {
      const row = node('article', 'about-accreditation'); row.append(node('h3', '', title), node('p', '', issuer)); credentials.append(row);
    });
    const closing = node('div', 'about-accreditations__closing');
    closing.append(node('p', 'about-copy', 'El resto está en los proyectos.'));
    const returnButton = node('button', 'about-return', 'Volver a proyectos'); returnButton.type = 'button'; returnButton.addEventListener('click', close);
    closing.append(returnButton); scenes[4].content.append(credentials);
    const ending = node('div','about-ending');
    ending.append(label('Proyectos'),node('h2','about-title','Seguí mirando.'),closing);
    const projectLinks = node('div','about-ending__projects');
    work.forEach(item=>{
      const button = node('button','about-ending__project');button.type='button';button.dataset.aboutProject=item.slug;
      button.setAttribute('aria-label',`Abrir ${item.name}`);button.append(makeImage(item.image,false),node('span','',item.name));
      button.addEventListener('click',()=>openProject(item.slug));projectLinks.append(button);
    });
    ending.append(projectLinks);scenes[5].content.append(ending);
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
      current.textContent = `${String(i + 1).padStart(2, '0')} / 06 · ${chapters[i][1]}`;
      arrows[0].disabled = i === 0; arrows[1].disabled = i === scenes.length - 1;
      status.textContent = `${chapters[i][1]}. Capítulo ${i + 1} de 6.`;
      onChapter(chapters[i][0]);
    }
    function paint(time = performance.now()) {
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
      const target = clamp(y / max);
      const dt = lastTime ? Math.min(40, time - lastTime) : 16; lastTime = time;
      if (rendered === null) rendered = target;
      rendered += (target - rendered) * (1 - Math.exp(-dt / 158));
      if (Math.abs(target - rendered) < .00001) rendered = target;
      const velocity = target - rendered;
      const p = rendered; root.style.setProperty('--about-progress', String(p));
      let chapter = 0;
      scenes.forEach((scene, i) => {
        const reveal = i === 0 ? 1 : segment(p, ...portals[i]);
        const covered = i < scenes.length - 1 && p >= portals[i + 1][1];
        scene.section.style.visibility = reveal > 0 && !covered ? 'visible' : 'hidden';
        if (i && reveal > 0 && reveal < 1) {
          const width = stage.clientWidth, height = stage.clientHeight;
          const hero = heroLogo.getBoundingClientRect(), stageRect = stage.getBoundingClientRect();
          const s0 = i === 1 ? hero.width / 50 : .3;
          const sEnd = Math.max(height / 4.8, width / 24) * 1.1;
          const scale = s0 * Math.pow(sEnd / s0, ease(reveal));
          const angle = -50 * Math.pow(1 - Math.min(1,reveal / .8),2) * (i % 2 ? 1 : -1);
          const x = i === 1 ? hero.left + hero.width/2 - stageRect.left : width/2;
          const y = i === 1 ? hero.top + hero.height/2 - stageRect.top : height/2;
          portalPaths[i].path.setAttribute('transform', `translate(${x} ${y}) rotate(${angle}) scale(${scale}) translate(-25 -25)`);
          scene.section.style.clipPath = `url(#${portalPaths[i].id})`;
        } else scene.section.style.clipPath = 'none';
        scene.content.style.setProperty('--chapter-enter','1');
        if (i && p >= starts[i]) chapter = i;
      });
      // Every scene has its own choreography, taken from the reference timeline.
      welcome.style.opacity = String(1-segment(p,0,.05));
      welcome.style.transform = `translateY(${-segment(p,0,.05)*30}px)`;
      const introProgress = segment(p,.08,.28);
      [introCopy.querySelector('h2'),introCopy.querySelector('.about-intro__lead'),identity].forEach((part,i)=>{
        const t = easeOut(segment(introProgress,i*.12,.38+i*.12));
        part.style.opacity = String(t); part.style.transform = `translateY(${(1-t)*32}px)`;
      });
      const portraitReveal = easeOut(segment(introProgress,.05,.60));
      portraitField.style.clipPath = `inset(${(1-portraitReveal)*100}% 0 0 0)`;
      const portraitImage = portraitField.querySelector('img');
      if (portraitImage) portraitImage.style.transform = `scale(${1.35-.35*portraitReveal})`;
      const q = segment(p,.33,.52), x = -q*railTravel;
      rail.style.transform = `translate3d(${x}px,0,0) skewX(${clamp(velocity*-160,-8,8)}deg)`;
      [...rail.children].forEach(card=>{
        const center = card.offsetLeft + card.offsetWidth/2 + x - rail.offsetLeft;
        const distance = clamp(Math.abs(center-railWindow.clientWidth/2)/railWindow.clientWidth);
        card.style.transform = `scale(${1-.14*distance})`;
      });
      scenes[2].section.querySelector('.about-scene__mark').style.transform = `translate(-50%,-50%) rotate(${q*180}deg)`;
      const tasteProgress = segment(p,.55,.74);
      [...collage.children].forEach((piece,i)=>{
        const t = easeOut(segment(tasteProgress,i*.06,.3+i*.06));
        const travel = (.5-tasteProgress) * [.5,.6,.5,.5][i] * stage.clientHeight * .4;
        piece.style.opacity = String(t);
        piece.style.transform = `translateY(${travel+(1-t)*stage.clientHeight*.08}px) scale(${.6+.4*t}) rotate(${(1-t)*(i%2?8:-8)}deg)`;
      });
      const credentialProgress = segment(p,.77,.89);
      [...credentials.querySelectorAll('.about-accreditation')].forEach((row,i)=>{
        const t = easeOut(segment(credentialProgress,i*.08,.4+i*.08));
        row.style.opacity = String(t);row.style.transform = `translateX(${(1-t)*(i%2?1:-1)*8}vw)`;
      });
      hint.style.opacity = String(1 - segment(p, 0, .01)); setChapter(chapter);
      if (rendered !== target) requestPaint();
    }
    function requestPaint() { if (!frame && !disposed) frame = requestAnimationFrame(paint); }
    function goTo(i, instant = false) {
      i = clamp(i, 0, scenes.length - 1);
      let top;
      if (linear) top = scenes[i].section.offsetTop;
      else top = destinations[i] * max;
      if (instant) rendered = null;
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
      rail.style.removeProperty('transform');
      [welcome,...rail.children,...collage.children,...credentials.querySelectorAll('.about-accreditation'),introCopy.querySelector('h2'),introCopy.querySelector('.about-intro__lead'),identity].forEach(n=>{n.style.removeProperty('transform');n.style.removeProperty('opacity')});
      portraitField.style.removeProperty('clip-path');portraitField.querySelector('img')?.style.removeProperty('transform');
      active = -1; rendered = null; lastTime = 0;
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
