'use strict';
// The globe and the 2D map share the same verified case coordinates and articles.
window.mountAtlas=function(root,D){
 const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const mobile=()=>matchMedia('(max-width:800px)').matches;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const regions=['Барлығы','Еуропа','Азия','Америка','Африка','Океания'];
 const colors={gov:'#56ddcf',ip:'#f0bd74'};
 const iso={'Қазақстан':'KAZ','Франция':'FRA','Испания':'ESP','Финляндия':'FIN','АҚШ':'USA','Бразилия':'BRA','Эстония':'EST','Үндістан':'IND','Кения':'KEN','Оңтүстік Африка':'ZAF','Сингапур':'SGP','Жаңа Зеландия':'NZL','Австралия':'AUS','Эфиопия':'ETH','Ұлыбритания':'GBR'};
 let region='Барлығы',group='all',mode='earth',chosen=D.cases.find(c=>c.slug==='kazakhstan')||D.cases[0];
 let globe=null,countries=null,inView=false,loading=null,rotate=false,exploring=false,light=false,compare=[];
 const filtered=()=>D.cases.filter(c=>(region==='Барлығы'||c.region===region)&&(group==='all'||c.group===group));
 const article=c=>D.pages.find(p=>p.slug===c.slug);
 const paragraphs=c=>article(c).article.flatMap(s=>s.blocks.filter(b=>b.type==='p').map(b=>b.text));
 const inline=s=>esc(s).replace(/\[([KG]\d+)\]/g,'<button class="cite" data-source="$1">$1</button>');
 function fullArticle(p){return p.article.map(s=>`<section><h3>${esc(s.heading)}</h3>${s.blocks.map(b=>b.type==='p'?`<p>${inline(b.text)}</p>`:`<div class="table-scroll"><table>${b.rows.map((r,i)=>`<tr>${r.map(v=>`<${i?'td':'th'}>${inline(v)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</table></div>`).join('')}</section>`).join('')}
 function summary(c){
  const ps=paragraphs(c),pick=(rx,fallback)=>ps.find(p=>rx.test(p))||fallback;
  return {problem:pick(/^Мәселе[. :]/,article(c).deck),solution:pick(/^(Шешім|.*бағдарламасының|Decidim|X-Road|CSIRO|Эфиопия[. :])/,ps[0]),lesson:pick(/Қазақстан(ға|да)|Авторлық талдау|Талдау[. :]/,ps.at(-1))};
 }
 root.classList.add('atlas-shell');root.dataset.view='earth';
 root.innerHTML=`<div class="atlas-toolbar"><div class="atlas-region-scroll" role="group" aria-label="Өңір бойынша сүзу">${regions.map(r=>`<button data-region="${r}" aria-pressed="${r===region}">${r==='Барлығы'?'Барлық өңір':r}</button>`).join('')}</div><div class="atlas-filter-line"><label class="atlas-direction">Бағыт<select id="atlas-group"><option value="all">Екі бағыт</option><option value="gov">Басқару</option><option value="ip">Зияткерлік меншік</option></select></label><span id="atlas-count" aria-live="polite"></span><div class="atlas-modes" role="group" aria-label="Көрініс"><button data-mode="earth" aria-pressed="true">Жер</button><button data-mode="map" aria-pressed="false">Карта</button><button data-mode="list" aria-pressed="false">Тізім</button></div></div></div>
 <div class="atlas-workspace"><div class="atlas-stage"><div class="atlas-stage-header"><span>ӘЛЕМДІК КЕЙСТЕР</span><button id="atlas-full" aria-pressed="false">Толық экран</button></div><div class="atlas-visual"><div id="earth-view" class="earth-view"><div class="earth-loading" role="status"><span class="loading-orbit"></span><span>Жер дайындалуда…</span></div></div><div id="map-view" hidden></div><div id="list-view" hidden></div><div id="earth-error" class="earth-error" hidden><p>Бұл құрылғыда 3D көрініс ашылмады.</p><button data-mode="map">Картаға өту</button><button id="earth-retry">Қайта көру</button></div></div><div class="atlas-stage-footer"><div class="atlas-legend"><span><i class="gov-dot"></i>Басқару</span><span><i class="ip-dot"></i>Зияткерлік меншік</span></div><div class="atlas-camera"><button id="atlas-kz">Қазақстан</button><button id="atlas-reset">Бастапқы көрініс</button><button id="atlas-rotate" aria-pressed="false">Айналдыру</button></div><div class="atlas-touch-row"><button id="atlas-touch" aria-pressed="false">Жерді басқару</button><span id="atlas-hint">Қаланы таңдаңыз · жақындату үшін екі саусақ</span></div><div class="atlas-options"><label><input id="atlas-grid" type="checkbox">Координаттар</label><label><input id="atlas-light" type="checkbox">Жеңіл графика</label><span id="atlas-status" aria-live="polite">3D ЖЕР</span></div></div></div><aside id="case-panel" class="atlas-case" aria-live="polite"></aside></div>
 <div class="atlas-case-browser"><div class="atlas-browser-head"><h3>Қаланы таңдаңыз</h3><label class="atlas-city-search"><span class="sr-only">Қала немесе ел</span><input id="atlas-city-search" type="search" placeholder="Қала немесе ел…"></label></div><div id="case-list" class="atlas-city-list"></div></div><div class="atlas-comparison-bar" id="compare-bar" hidden><span id="compare-count"></span><div><button id="compare-open">Салыстыру</button><button id="compare-clear">Тазарту</button></div></div><p class="atlas-footnote">Нүктелер зерттелген кейстерді көрсетеді. Көрсеткіштер әртүрлі кезеңдер мен өлшемдерге жатады; олар елдер рейтингі емес.</p><details class="atlas-attribution"><summary>Карта және бейне негізі</summary><p>NASA Visible Earth · Blue Marble. Natural Earth · 1:110m әкімшілік шекаралар. Шекаралар географиялық бағдар үшін берілген.</p></details>`;
 const dialog=document.createElement('dialog');dialog.className='atlas-sheet';dialog.id='atlas-detail-dialog';dialog.setAttribute('aria-labelledby','atlas-detail-title');document.body.append(dialog);
 const compareDialog=document.createElement('dialog');compareDialog.className='atlas-compare-dialog';compareDialog.setAttribute('aria-labelledby','atlas-compare-title');document.body.append(compareDialog);
 function renderPanel(){
  if(!chosen){$('#case-panel').innerHTML='<div class="atlas-empty"><h2>Кейс табылмады</h2><p>Басқа өңірді немесе бағытты таңдаңыз.</p><button id="atlas-clear-filter">Сүзгіні тазарту</button></div>';return;}
  const c=chosen,p=article(c),s=summary(c),selected=compare.includes(c.city);
  $('#case-panel').innerHTML=`<div class="atlas-case-top"><span class="case-number">${esc(p.num)} / ${c.group==='gov'?'БАСҚАРУ':'ЗИЯТКЕРЛІК МЕНШІК'}</span><span class="atlas-country">${esc(c.country)}</span></div><h2>${esc(c.city)}</h2><p class="atlas-case-deck">${esc(p.deck)}</p><div class="atlas-metric ${c.group}"><strong>${esc(c.value)}</strong><span>${esc(c.label)}</span></div><div class="atlas-case-summary"><span>НЕГІЗГІ СҰРАҚ</span><p>${inline(s.problem)}</p></div><div class="atlas-case-actions"><button id="case-read" class="atlas-read">Кейсті толық оқу</button><button id="case-compare" aria-pressed="${selected}">${selected?'Салыстырудан алу':'Салыстыруға қосу'}</button></div><div class="atlas-source-pills">${p.sources.map(id=>`<button data-source="${id}" title="${esc(D.sources[id]?.label)}">${esc(id)}</button>`).join('')}<span>${p.minutes} минут</span></div>`;
 }
 function list(){
  const q=$('#atlas-city-search').value.toLocaleLowerCase('kk');
  const fs=filtered().filter(c=>(c.city+' '+c.country).toLocaleLowerCase('kk').includes(q));
  $('#case-list').innerHTML=fs.map(c=>`<button data-city="${esc(c.city)}" aria-pressed="${c===chosen}" class="${c.group}"><span>${esc(c.city)}</span><small>${esc(c.country)}</small><i aria-hidden="true"></i></button>`).join('')||'<p class="atlas-empty">Іздеуді немесе сүзгіні өзгертіңіз.</p>';
  $('#atlas-count').textContent=filtered().length+' кейс';
  $('#list-view').innerHTML=fs.map(c=>`<button class="atlas-result-card ${c.group}" data-city="${esc(c.city)}" aria-pressed="${c===chosen}"><span>${esc(c.country)}</span><strong>${esc(c.city)}</strong><b>${esc(c.value)}</b><small>${esc(c.label)}</small></button>`).join('')||'<p class="atlas-empty">Осы сүзгіде кейс жоқ.</p>';
 }
 function select(c,fly=true){chosen=c;renderPanel();list();drawMap();syncGlobe();if(c&&globe&&fly){rotate=false;$('#atlas-rotate').setAttribute('aria-pressed','false');$('#atlas-rotate').textContent='Айналдыру';globe.controls().autoRotate=false;globe.pointOfView({lat:c.lat,lng:c.lon,altitude:mobile()?2.1:1.8},reduced?0:1100)} }
 function reconcile(){const fs=filtered();select(fs.includes(chosen)?chosen:fs[0]||null);}
 function setMode(m){mode=m;all('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));$('#earth-view').hidden=m!=='earth';$('#map-view').hidden=m!=='map';$('#list-view').hidden=m!=='list';$('#earth-error').hidden=!(m==='earth'&&root.dataset.earthError);root.dataset.view=m;$('#atlas-status').textContent=({earth:'3D ЖЕР',map:'2D КАРТА',list:'КЕЙСТЕР ТІЗІМІ'})[m];if(m==='earth')ensureEarth();drawMap();visibility();}
 function drawMap(){
  if(!countries||mode!=='map')return;
  const xy=([lon,lat])=>[40+(lon+180)/360*920,35+(90-lat)/180*460];
  const poly=ring=>{let path='',prev=null;for(const coord of ring){const [x,y]=xy(coord);path+=(prev!==null&&Math.abs(coord[0]-prev)>180?' M':prev===null?'M':'L')+x.toFixed(2)+','+y.toFixed(2);prev=coord[0]}return path+'Z'};
  const paths=countries.features.map(f=>{const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;return `<path d="${polys.map(p=>p.map(poly).join('')).join('')}" fill="${f.properties.iso_a3==='KAZ'?'#245b58':'#183b4d'}" stroke="${f.properties.iso_a3==='KAZ'?'#56ddcf':'#446378'}" stroke-width=".65"/>`}).join('');
  $('#map-view').innerHTML=`<svg viewBox="0 0 1000 540" role="img" aria-label="Кейстердің әлем картасындағы орны"><rect width="1000" height="540" fill="#071726"/>${paths}${filtered().map(c=>{const [x,y]=xy([c.lon,c.lat]);return `<g data-city="${esc(c.city)}" class="map-point"><circle cx="${x}" cy="${y}" r="${c===chosen?12:9}" fill="${colors[c.group]}" fill-opacity=".18"/><circle cx="${x}" cy="${y}" r="${c===chosen?5:3.5}" fill="${colors[c.group]}"/><title>${esc(c.city)}</title></g>`}).join('')}</svg><p class="atlas-map-caption">${chosen?esc(chosen.city)+' · '+esc(chosen.country):'Қаланы таңдаңыз'} · картадағы нүктені басыңыз</p>`;
 }
 function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script)})}
 async function geography(){if(countries)return countries;if(window.ATLAS_COUNTRIES)countries=window.ATLAS_COUNTRIES;else{const r=await fetch('/assets/countries-110m.geojson');if(!r.ok)throw Error('Map data unavailable');countries=await r.json()}drawMap();return countries;}
 async function ensureEarth(){
  if(globe)return;if(loading)return loading;
  loading=(async()=>{
   try{
    await geography();if(!window.Globe)await loadScript('/vendor/globe.gl.min.js');
    const host=$('#earth-view');host.innerHTML='';
    const G=new window.Globe(host,{animateIn:!reduced,rendererConfig:{antialias:!mobile(),alpha:true,powerPreference:'low-power'}});
    globe=G;G.backgroundColor('rgba(0,0,0,0)').globeImageUrl(window.ATLAS_EARTH_TEXTURE||'/assets/earth-day.webp').showAtmosphere(true).atmosphereColor('#68a7de').atmosphereAltitude(.13).showGraticules(false).globeCurvatureResolution(mobile()?4:3)
     .pointsData(filtered()).pointLat('lat').pointLng('lon').pointColor(c=>colors[c.group]).pointRadius(c=>c===chosen ? .5 : .25).pointAltitude(.007).pointResolution(12).pointsTransitionDuration(reduced?0:300)
     .pointLabel(c=>`<div class="earth-tooltip"><strong>${esc(c.city)}</strong><span>${esc(c.country)}</span></div>`).onPointClick(c=>select(c))
     .labelsData(chosen?[chosen]:[]).labelLat('lat').labelLng('lon').labelText('city').labelColor(()=> '#f3f8fc').labelSize(.8).labelAltitude(.022).labelDotRadius(.38).labelResolution(2).onLabelClick(c=>select(c))
     .polygonsData(countries.features.filter(f=>f.properties.iso_a3==='KAZ')).polygonCapColor(f=>f.properties.iso_a3==='KAZ'?'#56ddcf30':'#f0bd7428').polygonSideColor(()=> '#00000000').polygonStrokeColor(f=>f.properties.iso_a3==='KAZ'?'#7aecd9':'#f0bd74').polygonAltitude(.003)
     .ringsData(reduced?[]:chosen?[chosen]:[]).ringLat('lat').ringLng('lon').ringColor(()=> t=>`rgba(86,221,207,${1-t})`).ringMaxRadius(2.2).ringPropagationSpeed(1.2).ringRepeatPeriod(1400);
    const mat=G.globeMaterial();mat.shininess=8;mat.specular?.set('#173044');
    for(const l of G.lights()){if(l.isAmbientLight)l.intensity=.85;if(l.isDirectionalLight){l.intensity=1.4;l.position.set(-120,150,200)}}
    const renderer=G.renderer();renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile()?1.4:1.8));
    const controls=G.controls();controls.enablePan=false;controls.minDistance=125;controls.maxDistance=550;controls.enableDamping=true;controls.dampingFactor=.08;controls.autoRotateSpeed=.45;controls.enabled=exploring||!mobile();
    controls.addEventListener('start',()=>{rotate=false;controls.autoRotate=false;$('#atlas-rotate').setAttribute('aria-pressed','false');$('#atlas-rotate').textContent='Айналдыру'});
    const resize=()=>{const r=host.getBoundingClientRect();if(r.width&&r.height)G.width(r.width).height(r.height)};new ResizeObserver(resize).observe(host);resize();
    const canvas=host.querySelector('canvas');canvas.setAttribute('aria-label','Жер. Қаланы төмендегі тізімнен де таңдауға болады.');canvas.setAttribute('role','img');canvas.setAttribute('tabindex','0');canvas.style.touchAction=exploring||!mobile()?'none':'pan-y';
    canvas.addEventListener('keydown',e=>{const pov=G.pointOfView();if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')pov.lng-=12;if(e.key==='ArrowRight')pov.lng+=12;if(e.key==='ArrowUp')pov.lat=Math.min(85,pov.lat+10);if(e.key==='ArrowDown')pov.lat=Math.max(-85,pov.lat-10);if(e.key==='+')pov.altitude=Math.max(.3,pov.altitude-.2);if(e.key==='-')pov.altitude=Math.min(4,pov.altitude+.2);G.pointOfView(pov,reduced?0:250)}});
    G.pointOfView({lat:30,lng:65,altitude:mobile()?2.1:1.8},0);visibility();
   }catch(error){if(globe){try{globe._destructor()}catch{}globe=null;}$('#earth-view').innerHTML='';$('#earth-error').hidden=mode!=='earth';$('#atlas-status').textContent='КАРТА ҚОЛЖЕТІМДІ';root.dataset.earthError='true';}
  })();return loading;
 }
 function syncGlobe(){if(!globe)return;globe.pointsData(filtered()).labelsData(chosen?[chosen]:[]).ringsData(!reduced&&!light&&chosen?[chosen]:[]);if(countries)globe.polygonsData(countries.features.filter(f=>f.properties.iso_a3==='KAZ'||f.properties.iso_a3===iso[chosen?.country]));}
 function visibility(){if(!globe)return;const active=inView&&mode==='earth'&&!document.hidden;if(active)globe.resumeAnimation();else globe.pauseAnimation();}
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView&&mode==='earth')ensureEarth();visibility()},{rootMargin:'120px'}).observe($('#earth-view'));
 document.addEventListener('visibilitychange',visibility);
 function readCase(){if(!chosen)return;const c=chosen,p=article(c),s=summary(c);dialog.innerHTML=`<div class="atlas-sheet-head"><div><span>${esc(c.country)} / ${c.group==='gov'?'Басқару':'Зияткерлік меншік'}</span><h2 id="atlas-detail-title">${esc(c.city)}: кейстің толық талдауы</h2></div><button data-close>Жабу</button></div><div class="atlas-sheet-metric"><strong>${esc(c.value)}</strong><span>${esc(c.label)}</span></div><nav class="atlas-detail-nav" aria-label="Кейс бөлімдері"><a href="#case-original">Толық зерттеу</a><a href="#case-lesson">Қазақстанға сабақ</a><a href="#case-evidence">Деректер</a></nav><div class="atlas-detail-body"><div id="case-original" class="atlas-full-article">${fullArticle(p)}</div><section id="case-lesson" class="atlas-lesson"><span>АВТОРЛЫҚ ТАЛДАУ</span><h3>Қазақстанда қолдану шарттары</h3><p>${inline(s.lesson)}</p><p>Құзырет, қаржыландыру, меншік режимі және жергілікті құқықтық негіз қолдану алдында бөлек тексеріледі.</p></section><section id="case-evidence"><h3>Деректің негізі</h3><p>Көрсеткіш: ${esc(c.label)}. Зерттеу тексерілген күн: 05.10.2026. Географиялық нүкте қала орнын көрсетеді; зерттеу ауқымы қала, ел немесе ұйым болуы мүмкін.</p>${p.sources.map(id=>`<button class="atlas-source-row" data-source="${id}"><b>${id}</b><span>${esc(D.sources[id]?.label)}</span></button>`).join('')}</section><a class="atlas-chapter-link" href="/${p.slug}/">Осы тақырыптың жеке бетін ашу</a></div>`;dialog.showModal();dialog.scrollTop=0;}
 function comparisonBar(){const n=compare.length;$('#compare-bar').hidden=!n;$('#compare-count').textContent=n+'/2 кейс таңдалды';$('#compare-open').disabled=n!==2;renderPanel();}
 function comparison(){
  if(compare.length!==2)return;
  const cs=compare.map(name=>D.cases.find(c=>c.city===name));
  const rows=[['Ел және бағыт',c=>esc(c.country)+' · '+(c.group==='gov'?'Басқару':'Зияткерлік меншік')],['Негізгі сұрақ',c=>inline(summary(c).problem)],['Тетік және дерек',c=>inline(summary(c).solution)],['Көрсеткіш және кезең',c=>`<strong>${esc(c.value)}</strong><br>${esc(c.label)}`],['Қолдану шарты / шектеу',c=>inline(summary(c).lesson)],['Бастапқы негіз',c=>article(c).sources.map(id=>`<button class="cite" data-source="${id}">${id}</button>`).join(' ')]];
  compareDialog.innerHTML=`<div class="atlas-sheet-head"><div><span>ЕКІ КЕЙС / БІР ӨЛШЕМ</span><h2 id="atlas-compare-title">${cs.map(c=>esc(c.city)).join(' және ')}</h2></div><button data-close>Жабу</button></div><p class="atlas-compare-note">Әртүрлі жылдар мен бірліктердегі сандар тікелей рейтинг құруға жарамайды. Салыстыру басқару тетігі мен қолдану шартын түсіндіреді.</p><div class="atlas-compare-table"><table><thead><tr><th>Критерий</th>${cs.map(c=>`<th>${esc(c.city)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name,get])=>`<tr><th scope="row">${name}</th>${cs.map(c=>`<td>${get(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;compareDialog.showModal();
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.region){region=b.dataset.region;all('[data-region]').forEach(x=>x.setAttribute('aria-pressed',x===b));reconcile();}
  if(b.dataset.mode)setMode(b.dataset.mode);
  if(b.dataset.city)select(D.cases.find(c=>c.city===b.dataset.city));
  if(b.id==='case-read')readCase();
  if(b.id==='case-compare'&&chosen){if(compare.includes(chosen.city))compare=compare.filter(x=>x!==chosen.city);else{if(compare.length===2)compare.shift();compare.push(chosen.city)}comparisonBar();}
  if(b.id==='compare-open')comparison();if(b.id==='compare-clear'){compare=[];comparisonBar();}
  if(b.id==='atlas-clear-filter'){region='Барлығы';group='all';$('#atlas-group').value='all';all('[data-region]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.region===region));reconcile();}
  if(b.id==='atlas-kz'){region='Барлығы';group='all';$('#atlas-group').value='all';all('[data-region]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.region===region));select(D.cases.find(c=>c.slug==='kazakhstan'));}
  if(b.id==='atlas-reset'){if(globe)globe.pointOfView({lat:30,lng:65,altitude:mobile()?2.1:1.8},reduced?0:1000);rotate=false;if(globe)globe.controls().autoRotate=false;$('#atlas-rotate').setAttribute('aria-pressed','false');$('#atlas-rotate').textContent='Айналдыру';}
  if(b.id==='atlas-rotate'&&globe){rotate=!rotate;globe.controls().autoRotate=rotate;b.setAttribute('aria-pressed',rotate);b.textContent=rotate?'Тоқтату':'Айналдыру';}
  if(b.id==='atlas-touch'){exploring=!exploring;b.setAttribute('aria-pressed',exploring);b.textContent=exploring?'Бетті жылжыту':'Жерді басқару';if(globe){globe.controls().enabled=exploring||!mobile();$('#earth-view canvas').style.touchAction=exploring?'none':'pan-y';}$('#atlas-hint').textContent=exploring?'Бір саусақпен айналдырыңыз · екі саусақпен жақындатыңыз':'Қаланы таңдаңыз · бет еркін жылжиды';}
  if(b.id==='atlas-full'){const on=root.classList.toggle('atlas-expanded');b.setAttribute('aria-pressed',on);b.textContent=on?'Жабу':'Толық экран';document.body.classList.toggle('atlas-lock',on);}
  if(b.id==='earth-retry'){loading=null;delete root.dataset.earthError;$('#earth-error').hidden=true;ensureEarth();}
 });
 // SVG elements are not buttons; marker selection is also available in the list.
 $('#map-view').addEventListener('click',e=>{const c=e.target.closest('[data-city]');if(c)select(D.cases.find(x=>x.city===c.dataset.city))});
 $('#atlas-group').addEventListener('change',e=>{group=e.target.value;reconcile()});$('#atlas-city-search').addEventListener('input',list);
 $('#atlas-grid').addEventListener('change',e=>{if(globe)globe.showGraticules(e.target.checked)});
 $('#atlas-light').addEventListener('change',e=>{light=e.target.checked;if(globe){globe.renderer().setPixelRatio(light?1:Math.min(devicePixelRatio||1,mobile()?1.4:1.8));globe.showAtmosphere(!light).globeCurvatureResolution(light?6:mobile()?4:3);syncGlobe()}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('atlas-expanded')){$('#atlas-full').click();}});
 window.addEventListener('pagehide',()=>{if(globe)globe._destructor();},{once:true});
 renderPanel();list();geography().catch(()=>{$('#map-view').innerHTML='<p class="atlas-empty">Карта деректері жүктелмеді. Кейстер тізімі қолжетімді.</p>'});
 root.readAtlasState=()=>({region,group,mode,city:chosen?.city||null,filtered:filtered().length,compare:[...compare],earthReady:!!globe});
};
