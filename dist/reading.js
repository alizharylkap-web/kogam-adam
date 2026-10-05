'use strict';
(()=>{
 const D=window.ATLAS_DATA,p=D.pages.find(p=>p.slug===document.body.dataset.page);
 if(!p)return;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const get=k=>{try{return JSON.parse(localStorage.getItem('qogam:'+k))}catch{return null}};
 const set=(k,v)=>{try{localStorage.setItem('qogam:'+k,JSON.stringify(v))}catch{}};
 const saved=get('reading:'+p.slug),article=document.querySelector('.article-text');
 if(get('large-text'))document.body.classList.add('big-reading');
 const size=document.querySelector('#reader-size');if(size&&document.body.classList.contains('big-reading')){size.setAttribute('aria-pressed','true');size.textContent='Қалыпты мәтін';}
 document.addEventListener('click',e=>{if(e.target.closest('#reader-size'))set('large-text',document.body.classList.contains('big-reading'))});
 const toolbar=document.createElement('div');toolbar.className='reading-toolbar';toolbar.innerHTML=`<span>${p.minutes} минут · ${p.sources.length} дереккөз</span><div><button id="reader-bookmark" aria-pressed="${!!get('bookmark:'+p.slug)}">${get('bookmark:'+p.slug)?'Сақталған':'Сақтау'}</button><button id="reader-print">Басып шығару</button></div>`;
 if(article)article.prepend(toolbar);
 const bookmark=document.querySelector('#reader-bookmark');bookmark?.addEventListener('click',()=>{const on=!get('bookmark:'+p.slug);set('bookmark:'+p.slug,on);bookmark.setAttribute('aria-pressed',on);bookmark.textContent=on?'Сақталған':'Сақтау'});
 document.querySelector('#reader-print')?.addEventListener('click',()=>window.print());
 if(saved?.section&&article?.querySelector('#'+saved.section)&&saved.progress>4&&saved.progress<96){const resume=document.createElement('div');resume.className='reading-resume';resume.innerHTML=`<div><strong>Оқуды жалғастыру</strong><span>Осы бөлімдегі соңғы орын · ${saved.progress}%</span></div><button>Жалғастыру</button>`;toolbar?.after(resume);resume.querySelector('button').onclick=()=>{article.querySelector('#'+saved.section).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});resume.remove()};}
 let section=null,lastSave=0;
 if(article){const sections=[...article.querySelectorAll('section[id]')];const obs=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])section=visible[0].target.id},{rootMargin:'-12% 0px -50% 0px'});sections.forEach(s=>obs.observe(s));
 const save=()=>{const r=article.getBoundingClientRect(),start=r.top+scrollY,height=article.offsetHeight;const progress=Math.max(0,Math.min(100,Math.round((scrollY-start+innerHeight*.25)/height*100)));if(section)set('reading:'+p.slug,{section,progress})};
 window.addEventListener('scroll',()=>{if(Date.now()-lastSave>1200){lastSave=Date.now();save()}},{passive:true});window.addEventListener('pagehide',save);}
 // Saved chapters are device-local preferences; no account or server is required.
 const contents=document.querySelector('#contents-dialog .contents-groups');
 if(contents){const bookmarks=D.pages.filter(p=>get('bookmark:'+p.slug));if(bookmarks.length){const section=document.createElement('section');section.className='saved-chapters';section.innerHTML='<h3>Сақталған бөлімдер</h3>'+bookmarks.map(q=>`<a href="/${q.slug?esc(q.slug)+'/':''}"><span>${q.num}</span>${esc(q.title)}</a>`).join('');contents.prepend(section)}}
 if(window.ATLAS_PREVIEW){
  const preview=document.createElement('dialog');preview.className='atlas-sheet';preview.id='preview-page-dialog';preview.setAttribute('aria-labelledby','preview-page-title');document.body.append(preview);
  document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const href=link.getAttribute('href');if(!href.startsWith('/')||href.startsWith('//'))return;const route=href.replace(/^\/|\/$/g,'');const q=D.pages.find(p=>p.slug===route);if(!q)return;e.preventDefault();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
   const inline=s=>esc(s).replace(/\[([KG]\d+)\]/g,'<button class="cite" data-source="$1">$1</button>');
   preview.innerHTML=`<div class="atlas-sheet-head"><div><span>${q.num} / 35 БӨЛІМ</span><h2 id="preview-page-title">${esc(q.title)}</h2></div><button data-close>Жабу</button></div><div class="atlas-detail-body"><p>${esc(q.deck)}</p>${q.article.map(s=>`<section><h3>${esc(s.heading)}</h3>${s.blocks.map(b=>b.type==='p'?`<p>${inline(b.text)}</p>`:`<div class="table-scroll"><table>${b.rows.map((r,i)=>`<tr>${r.map(v=>`<${i?'td':'th'}>${inline(v)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</table></div>`).join('')}</section>`).join('')}</div>`;preview.showModal();preview.scrollTop=0;
  });
 }
})();
