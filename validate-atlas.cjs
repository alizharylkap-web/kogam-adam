const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const D=JSON.parse(fs.readFileSync('content.json','utf8'));
const countries=JSON.parse(fs.readFileSync('dist/assets/countries-110m.geojson','utf8'));
const html=fs.readFileSync('dist/atlas/index.html','utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
async function test(){
 const dom=new JSDOM(html,{url:'https://local.test/atlas/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,observers=[];w.ATLAS_DATA=D;w.ATLAS_COUNTRIES=countries;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.IntersectionObserver=class{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){}};
 w.ResizeObserver=class{observe(){}disconnect(){}};
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
 w.print=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 for(const f of ['algorithms.js','atlas.js','reading.js','app.js'])w.eval(fs.readFileSync('dist/'+f,'utf8'));
 await Promise.resolve();const root=w.document.querySelector('#interactive');const state=()=>JSON.parse(JSON.stringify(root.readAtlasState()));
 const click=selector=>{const e=w.document.querySelector(selector);assert.ok(e,selector);e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 assert.equal(state().city,'Астана');assert.equal(state().filtered,15);assert.equal(root.dataset.view,'earth');
 click('[data-mode="map"]');assert.equal(state().mode,'map');assert.equal(root.querySelectorAll('#map-view path').length,177);
 assert.ok(!/NaN|Infinity/.test(root.querySelector('#map-view svg').outerHTML));
 click('[data-city="Париж"]');assert.equal(state().city,'Париж');
 click('#case-read');const detail=w.document.querySelector('#atlas-detail-dialog');assert.ok(detail.hasAttribute('open'));
 const p=D.pages.find(p=>p.slug==='paris');for(const a of p.article)for(const b of a.blocks)if(b.type==='p')assert.ok(detail.textContent.includes(b.text.replace(/\[([KG]\d+)\]/g,'$1')),b.text.slice(0,60));
 click('#atlas-detail-dialog [data-close]');assert.ok(!detail.hasAttribute('open'));
 click('#case-compare');click('[data-city="Хельсинки"]');click('#case-compare');assert.equal(state().compare.length,2);click('#compare-open');assert.ok(w.document.querySelector('.atlas-compare-dialog[open]'));assert.equal(w.document.querySelectorAll('.atlas-compare-table tbody tr').length,6);
 click('.atlas-compare-dialog [data-close]');click('#compare-clear');assert.equal(state().compare.length,0);
 click('[data-region="Америка"]');const sel=w.document.querySelector('#atlas-group');sel.value='ip';sel.dispatchEvent(new w.Event('change'));assert.equal(state().filtered,0);assert.equal(state().city,null);assert.ok(root.querySelector('#atlas-clear-filter'));
 click('#atlas-clear-filter');assert.equal(state().filtered,15);
 const input=w.document.querySelector('#atlas-city-search');input.value='Эфиопия';input.dispatchEvent(new w.Event('input'));assert.equal(root.querySelectorAll('#case-list button').length,1);input.value='';input.dispatchEvent(new w.Event('input'));
 click('#atlas-full');assert.ok(root.classList.contains('atlas-expanded'));w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.ok(!root.classList.contains('atlas-expanded'));
 // A renderer failure must preserve the map and list and remain recoverable.
 w.Globe=class{constructor(){throw Error('No WebGL in test')}};click('[data-mode="earth"]');await new Promise(r=>setTimeout(r,5));assert.equal(root.dataset.earthError,'true');assert.equal(root.querySelector('#earth-error').hidden,false);click('[data-mode="list"]');click('[data-mode="earth"]');assert.equal(root.querySelector('#earth-error').hidden,false);
 assert.ok(countries.features.find(f=>f.properties.iso_a3==='KAZ'));
 for(const c of D.cases){assert.ok(Number.isFinite(c.lat)&&c.lat>=-90&&c.lat<=90);assert.ok(Number.isFinite(c.lon)&&c.lon>=-180&&c.lon<=180);assert.ok(D.pages.find(p=>p.slug===c.slug));}
 for(const p of D.pages){const h=fs.readFileSync('dist/'+(p.slug?p.slug+'/':'')+'index.html','utf8');for(const src of h.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:css|js|svg|webp))"/g))assert.ok(fs.existsSync('dist'+src[1]),src[1]);}
 dom.window.close();console.log('PASS: 15 case coordinates, 177 countries, mode/filter/search transitions, complete case text, comparison, fullscreen Escape, WebGL failure recovery, 35-route assets.');
}
test().catch(e=>{console.error(e);process.exitCode=1});
