/* Pósters V.1 — native scrolling with independent, damped column lag.
   Artworks keep their proportions. Three bounded bands make a seamless loop. */
(() => {
  window.createPosterWall = ({scroller, root, items, makeImage, openImage, onResults, isActive}) => {
    const controller = new AbortController(), {signal} = controller;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 700px)');
    let density=4, query='', columns=[], period=0, frame=0, last=0, lastScroll=0, rebuilding=false, disposed=false;
    let resizeFrame=0, width=0;
    const visible = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => {
      target.querySelector('button').tabIndex=isIntersecting?0:-1;
    }), {root:scroller,rootMargin:'0px',threshold:.05});
    function render() {
      if(disposed)return;
      rebuilding=true; cancelAnimationFrame(frame); frame=0;visible.disconnect();root.replaceChildren();columns=[];
      const needle=query.trim().toLocaleLowerCase('es');
      const selection=items.filter(item=>`${item.name||''} ${item.alt||''}`.toLocaleLowerCase('es').includes(needle));
      const count=Math.min(narrow.matches?2:density,Math.max(1,selection.length));
      onResults({total:selection.length,columns:count,density});
      root.dataset.columns=String(count);root.classList.toggle('is-empty',!selection.length);
      if(!selection.length){const empty=document.createElement('p');empty.className='poster-wall__empty';empty.textContent='No encontré afiches con esa búsqueda.';root.append(empty);scroller.scrollTop=0;rebuilding=false;return;}
      const pools=Array.from({length:count},()=>[]), heights=Array(count).fill(0);
      // Assign to the shortest column; staggered starts prevent a row-like rhythm.
      const colWidth=(root.clientWidth-(count-1)*20)/count;
      selection.forEach(item=>{const col=heights.indexOf(Math.min(...heights));pools[col].push(item);heights[col]+=colWidth*item.h/item.w+62;});
      pools.forEach((pool,col)=>{
        if(!pool.length)pool.push(selection[col%selection.length]);
        let height=pool.reduce((sum,item)=>sum+colWidth*item.h/item.w+62,0);
        const seed=[...pool];let i=0;
        while(!motion.matches&&height<scroller.clientHeight*2.2){const item=seed[i++%seed.length];pool.push(item);height+=colWidth*item.h/item.w+62;}
        const column=document.createElement('div');column.className='poster-column';
        const band=document.createElement('div');band.className='poster-band';
        pool.forEach(item=>band.append(piece(item)));
        column.append(band);root.append(column);columns.push({node:column,pool,band,lag:0,base:0,edge:count===1?0:Math.abs(col-(count-1)/2)/((count-1)/2)});
      });
      // Measure captions once, after layout; image ratios are already reserved.
      period=Math.ceil(Math.max(...columns.map(({band})=>band.getBoundingClientRect().height)))+100;
      columns.forEach((col,i)=>{
        col.base=-[0,90,30,140,60,110][i];
        if(motion.matches)col.node.style.paddingTop=[0,90,30,140,60,110][i]+'px';
        if(!motion.matches){
          col.band.style.height=period+'px';
          col.node.append(col.band.cloneNode(true),col.band.cloneNode(true));
          // Cloned nodes need listeners, not duplicated IDs or serialized handlers.
          [...col.node.querySelectorAll('.poster-piece')].forEach((figure,index)=>{
            const button=figure.querySelector('button');
            if(index>=col.pool.length)button.addEventListener('click',()=>openImage(col.pool[index%col.pool.length]));
            visible.observe(figure);
          });
        }else col.band.querySelectorAll('.poster-piece').forEach(figure=>visible.observe(figure));
        col.node.style.transform=`translateY(${motion.matches?0:col.base}px)`;
      });
      root.style.height=motion.matches?'auto':(period*3)+'px';
      scroller.scrollTop=motion.matches?0:period;
      lastScroll=scroller.scrollTop;last=0;rebuilding=false;
    }
    function piece(item) {
      const figure=document.createElement('figure');figure.className='poster-piece';figure.dataset.posterId=item.id;
      const button=document.createElement('button');button.type='button';button.className='poster-piece__open';button.tabIndex=-1;
      button.setAttribute('aria-label',`Ampliar ${item.name||'afiche'}`);button.setAttribute('aria-haspopup','dialog');
      const thumb=item.thumbnail||item;const image=makeImage({src:thumb.src,alt:item.alt||item.name,w:thumb.w,h:thumb.h});
      if(item.preview){image.srcset=`${thumb.src} ${thumb.w}w, ${item.preview.src} ${item.preview.w}w`;image.sizes=`${Math.ceil(root.clientWidth/(narrow.matches?2:density))}px`;}
      button.append(image);
      button.addEventListener('click',()=>openImage(item));
      const caption=document.createElement('figcaption');caption.textContent=item.name||'Sin título';
      figure.append(button,caption);return figure;
    }
    function tick(now) {
      frame=0;if(disposed||rebuilding||motion.matches)return;
      const dt=Math.min(.05,(now-(last||now-16))/1000);last=now;
      let scroll=scroller.scrollTop;
      if(period&&(scroll<period*.35||scroll>period*1.65)){
        const shift=scroll<period*.35?period:-period;
        scroller.scrollTop=scroll+shift;scroll=scroller.scrollTop;lastScroll+=shift;
      }
      const delta=scroll-lastScroll;lastScroll=scroll;
      const active=!document.hidden&&isActive();let unsettled=false;
      columns.forEach(col=>{
        const impulse=active?Math.max(-70,Math.min(70,delta*(.22+col.edge*.35))):0;
        col.lag=active?Math.max(-100,Math.min(100,(col.lag+impulse)*Math.exp(-dt*(10-col.edge*3)))):0;
        if(Math.abs(col.lag)>.05)unsettled=true;else col.lag=0;
        col.node.style.transform=`translateY(${col.base+col.lag}px)`;
      });
      if(unsettled){frame=requestAnimationFrame(tick)}else last=0;
    }
    function scroll(){if(!rebuilding&&!frame&&!motion.matches)frame=requestAnimationFrame(tick);}
    scroller.addEventListener('scroll',scroll,{passive:true,signal});
    const observer=new ResizeObserver(()=>{
      const next=root.clientWidth;if(Math.abs(next-width)<1)return;width=next;
      cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(render);
    });observer.observe(root);
    motion.addEventListener('change',render,{signal});narrow.addEventListener('change',render,{signal});
    document.addEventListener('visibilitychange',()=>{if(!frame)frame=requestAnimationFrame(tick)},{signal});
    width=root.clientWidth;render();
    return {
      setDensity(value){density=value;render()},
      setQuery(value){query=value;render()},
      destroy(){disposed=true;controller.abort();observer.disconnect();visible.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);}
    };
  };
})();
