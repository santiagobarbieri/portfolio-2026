/* About content follows the supplied landing choreography and section palette. */
(() => {
  window.createAboutJourney = ({scroller,root,makeImage,work,interests,bio,credentials,portrait=null,initial='opening',onChapter,close}) => {
    const controller=new AbortController(),{signal}=controller;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const keys=['opening','testament','work','interests','credentials','ending'];
    const ranges=[[0,0],[.03,.14],[.30,.38],[.52,.60],[.74,.81],[.90,.97]];
    const bounds=[0,.14,.38,.60,.81,.97],destinations=[0,.23,.42,.67,.86,1];
    const NS='http://www.w3.org/2000/svg',D=document.querySelector('.study-home .study-mark path').getAttribute('d');
    const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
    const seg=(p,a,b)=>clamp((p-a)/(b-a));
    const out=t=>1-Math.pow(1-t,3),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el};
    const mark=cls=>{const el=document.createElementNS(NS,'svg');el.setAttribute('viewBox','0 0 50 50');el.setAttribute('class',cls);el.setAttribute('aria-hidden','true');const p=document.createElementNS(NS,'path');p.setAttribute('d',D);p.setAttribute('pathLength','1');el.append(p);return el};
    const imageField=image=>{const el=node('div','about-model-image');el.append(makeImage(image,false));return el};
    let frame=0,resizeFrame=0,disposed=false,linear=false,active=-1,max=1,current=null,last=0,railMax=0;
    let W=0,H=0,cx=0,cy=0,logoScale=1,scaleEnd=1;
    const defsSVG=document.createElementNS(NS,'svg');defsSVG.setAttribute('class','about-model-defs');defsSVG.setAttribute('aria-hidden','true');
    const defs=document.createElementNS(NS,'defs');defsSVG.append(defs);root.append(defsSVG);
    const paths=[],token='about-'+Math.random().toString(36).slice(2,9);
    const track=node('div','about-model-track'),stage=node('div','about-model-stage');track.append(stage);
    const scenes=keys.map((key,i)=>{
      const el=node('section',`about-model-scene about-model-scene--${key}`);el.dataset.aboutChapter=key;el.setAttribute('aria-label',['Inicio de Sobre mí','Presentación','Imágenes de trabajo','Gustos y exploraciones personales','Credenciales','Final del recorrido'][i]);
      stage.append(el);
      if(i){const cp=document.createElementNS(NS,'clipPath');cp.id=token+i;cp.setAttribute('clipPathUnits','userSpaceOnUse');const path=document.createElementNS(NS,'path');path.setAttribute('d',D);cp.append(path);defs.append(cp);paths[i]={path,id:cp.id};}
      return el;
    });
    const toolbar=node('div','about-model-toolbar');
    const signature=node('div','about-model-signature');signature.append(mark('about-model-signature__mark'),node('span','','SANTIAGO BARBIERI'));
    const hero=node('div','about-model-hero'),heroLogo=mark('about-model-hero__mark');
    hero.append(heroLogo,node('h1','about-model-name','Santiago Barbieri'),node('p','about-model-welcome','Diseño, dirección creativa, web y fotografía.'));scenes[0].append(hero);
    const intro=node('div','about-model-intro'),copy=node('div','about-model-copy');
    const titleBars=[node('p','about-model-kicker','Sobre mí'),node('h2','about-model-title','Hola, soy Santiago.')];
    const textBars=[node('p','about-model-lead',bio.lead),...bio.paragraphs.map(text=>node('p','about-model-paragraph',text))];
    copy.append(...titleBars,...textBars);
    const portraitField=portrait?imageField(portrait):node('div','about-model-image');portraitField.classList.add('about-model-portrait');intro.append(copy,portraitField);scenes[1].append(intro);
    const workHeading=node('h2','about-model-scene-heading','Mi trabajo');
    const ghost=mark('about-model-ghost'),rail=node('div','about-model-rail');scenes[2].append(workHeading,ghost,rail);
    const panels=work.map(item=>{
      const panel=node('article','about-model-panel'),media=imageField(item.image),caption=node('div','about-model-caption'),head=node('div','about-model-caption__head');
      head.append(node('h3','',item.name),node('span','',item.year));caption.append(head,node('p','',item.detail));panel.append(media,caption);rail.append(panel);return panel;
    });
    const tasteHeading=node('header','about-model-tastes-heading');tasteHeading.append(node('h2','','Gustos'),node('p','','Música, cine, diseño y fotografía. Exploraciones personales.'));scenes[3].append(tasteHeading);
    const collage=node('div','about-model-collage');scenes[3].append(collage);
    const cfg=[[4,12,22,1.4,.4],[31,2,14,.7,.6],[53,8,13,.7,.4],[77,0,14,.7,.6],[6,62,13,.7,.5],[28,65,21,1.4,.4],[56,64,13,.7,.6],[77,66,20,1.4,.4]];
    const items=cfg.map((c,i)=>{
      const item=interests[i],el=node('figure','about-model-piece');el.dataset.kind=item.kind;
      el.append(imageField(item.image),node('figcaption','',item.label));collage.append(el);return{el,c};
    });
    const marquee=node('div','about-model-marquee');for(let i=0;i<8;i++)marquee.append(mark(''));scenes[4].append(marquee);
    const rows=node('div','about-model-rows');rows.append(node('h2','about-model-title','Credenciales.'));
    const rowNodes=credentials.map(item=>{const row=node('article','about-model-row');row.append(node('i','about-model-rule'),node('h3','',item.title),node('p','',item.detail),node('p','about-model-issuer',item.issuer));rows.append(row);return row});scenes[4].append(rows);
    const ending=node('figure','about-model-ending');ending.append(imageField(interests[0].image),node('figcaption','','Zapallar, Chile · Fotografía personal'));scenes[5].append(ending);
    const closeButton=node('button','about-model-close');closeButton.type='button';closeButton.setAttribute('aria-label','Cerrar Sobre mí');
    const closeIcon=node('span','','×');closeIcon.setAttribute('aria-hidden','true');closeButton.append(node('span','','CERRAR'),closeIcon);closeButton.addEventListener('click',close,{signal});
    toolbar.append(signature,closeButton);root.append(toolbar,track);document.body.dataset.aboutJourney='true';
    const readyObserver=new MutationObserver(()=>{if(!document.body.hasAttribute('data-section-loading')&&!document.querySelector('.study-section-loader')){root.classList.add('is-ready');readyObserver.disconnect()}});
    readyObserver.observe(document.body,{attributes:true,attributeFilter:['data-section-loading'],childList:true});
    function setChapter(i){if(i===active)return;active=i;root.dataset.chapter=keys[i];scenes.forEach((el,n)=>{el.inert=!linear&&n!==i;if(!linear)el.setAttribute('aria-hidden',String(n!==i));else el.removeAttribute('aria-hidden')});onChapter(keys[i])}
    function paint(time=performance.now()){
      frame=0;if(disposed)return;
      if(document.body.hasAttribute('data-about-returning'))return;
      if(linear){let chapter=0;scenes.forEach((el,i)=>{if(el.getBoundingClientRect().top<scroller.clientHeight*.45)chapter=i});setChapter(chapter);return}
      const target=clamp(scroller.scrollTop/max),dt=last?Math.min(40,time-last):16;last=time;if(current===null)current=target;
      const velocity=target-current;current+=velocity*(1-Math.exp(-dt/200));if(Math.abs(target-current)<.0001)current=target;
      const p=current;root.style.setProperty('--about-progress',String(p));
      scenes.forEach((el,i)=>{
        const t=i?seg(p,...ranges[i]):1,covered=i<5&&p>=ranges[i+1][1];el.style.visibility=t>0&&!covered?'visible':'hidden';
        if(i&&t>0&&t<1){const s0=i===1?logoScale:.3,s=s0*Math.pow(scaleEnd/s0,ease(t)),r=-50*Math.pow(1-Math.min(1,t/.8),2)*(i%2?1:-1);paths[i].path.setAttribute('transform',`translate(${i===1?cx:W/2} ${i===1?cy:H/2}) rotate(${r}) scale(${s}) translate(-25 -25)`);el.style.clipPath=`url(#${paths[i].id})`}else el.style.clipPath='none';
      });
      const h=seg(p,0,.05);hero.style.opacity=String(1-h);hero.style.transform=`translateY(${-h*30}px)`;
      const introQ=seg(p,.08,.28);titleBars.forEach((el,i)=>{const t=out(seg(introQ,i*.07,.35+i*.07));el.style.clipPath=`inset(0 ${(1-t)*100}% 0 0)`;el.style.opacity=String(t)});textBars.forEach((el,i)=>{const t=out(seg(introQ,.22+i*.07,.55+i*.07));el.style.transform=`translateY(${(1-t)*12}px)`;el.style.opacity=String(t)});
      const portraitQ=out(seg(introQ,.05,.6));portraitField.style.clipPath=`inset(${(1-portraitQ)*100}% 0 0 0)`;if(portraitField.firstElementChild)portraitField.firstElementChild.style.transform=`scale(${1.35-.35*portraitQ})`;
      const workQ=seg(p,.33,.52),x=-workQ*railMax;rail.style.transform=`translateX(${x}px) skewX(${clamp(velocity*-80,-2,2)}deg)`;
      panels.forEach(panel=>{const center=panel.offsetLeft+panel.offsetWidth/2+x,d=clamp(Math.abs(center-W/2)/W);panel.style.transform=`scale(${1-.06*d})`;const img=panel.querySelector('img');if(img)img.style.transform=`translateX(${(center-W/2)*-.035}px) scale(1.08)`});ghost.style.transform=`rotate(${workQ*180}deg)`;
      const tasteQ=seg(p,.55,.74);items.forEach(({el,c},i)=>{const t=out(seg(tasteQ,i*.06,i*.06+.3)),ty=(.5-tasteQ)*c[4]*H*.12;el.style.opacity=String(t);el.style.transform=`translateY(${ty+(1-t)*H*.025}px) scale(${.88+.12*t}) rotate(${(1-t)*(i%2?3:-3)}deg)`});
      const credentialQ=seg(p,.77,.89);rowNodes.forEach((row,i)=>{const t=out(seg(credentialQ,i*.08,.4+i*.08));row.style.opacity=String(t);row.style.transform=`translateX(${(1-t)*(i%2?1:-1)*3}vw)`;row.firstElementChild.style.transform=`scaleX(${t})`});marquee.style.transform=`translateX(${-credentialQ*40}%)`;
      let chapter=0;bounds.forEach((b,i)=>{if(p>=b)chapter=i});setChapter(chapter);
      if(current!==target)requestPaint();
    }
    function requestPaint(){if(!frame&&!disposed)frame=requestAnimationFrame(paint)}
    function goTo(key,instant=false){const i=Math.max(0,keys.indexOf(key));if(instant)current=null;scroller.scrollTo({top:linear?scenes[i].offsetTop:destinations[i]*max,behavior:instant||reduced.matches?'instant':'smooth'});requestPaint()}
    function measure(keep=true){
      if(disposed)return;const oldLinear=linear,p=clamp(scroller.scrollTop/max),selected=keys[Math.max(0,active)];
      W=scroller.clientWidth;H=scroller.clientHeight;linear=reduced.matches||H<600;root.classList.toggle('about-journey--linear',linear);root.style.setProperty('--about-screen',H+'px');
      const transform=hero.style.transform;hero.style.transform='none';const rect=heroLogo.getBoundingClientRect(),st=stage.getBoundingClientRect();cx=rect.left+rect.width/2-st.left;cy=rect.top+rect.height/2-st.top;logoScale=rect.width/50;hero.style.transform=transform;
      scaleEnd=Math.max(H/4.8,W/24)*1.1;railMax=Math.max(0,rail.scrollWidth-W);max=Math.max(1,track.offsetHeight-H);
      items.forEach(({el,c},i)=>{
        const mobile=W<700,width=mobile?28:c[2];el.style.width=width+'vw';el.style.aspectRatio=mobile?'0.78':c[3];
        el.style.left=(mobile?4+(i%3)*32:c[0])+'vw';
        const room=Math.max(0,collage.clientHeight-el.offsetHeight-28),y=mobile?Math.floor(i/3)*(collage.clientHeight/3):c[1]/100*collage.clientHeight;
        el.style.top=Math.min(room,y)+'px';
      });
      scenes.forEach(el=>{el.style.removeProperty('visibility');el.style.removeProperty('clip-path')});
      [hero,rail,ghost,marquee,...panels,...titleBars,...textBars,...items.map(i=>i.el),...rowNodes].forEach(el=>{el.style.removeProperty('transform');el.style.removeProperty('opacity');el.style.removeProperty('clip-path')});portraitField.style.removeProperty('clip-path');panels.forEach(el=>el.querySelector('img')?.style.removeProperty('transform'));
      active=-1;current=null;last=0;if(keep&&oldLinear!==linear)goTo(selected,true);else if(keep&&!linear)scroller.scrollTop=p*max;paint();
    }
    scroller.addEventListener('scroll',requestPaint,{passive:true,signal});const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>measure())};window.addEventListener('resize',resize,{passive:true,signal});reduced.addEventListener('change',resize,{signal});document.fonts.ready.then(()=>{if(!disposed)resize()});
    measure(false);goTo(initial,true);paint();
    return{ready:Promise.all([...root.querySelectorAll('img')].map(img=>img.decode().catch(()=>{}))),goTo:key=>goTo(key),destroy(){disposed=true;controller.abort();readyObserver.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);delete document.body.dataset.aboutJourney}};
  };
})();
