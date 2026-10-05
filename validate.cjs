const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const A=require('./dist/algorithms.js');
assert.deepEqual(A.budget(20,[{cost:9.5,votes:103},{cost:7.2,votes:85}]),{total:16.7,remaining:3.3,votes:188});
assert.equal(A.budget(10,[{cost:9.5,votes:103},{cost:7.2,votes:85}]).remaining,-6.7);
assert.deepEqual(A.allocate(20,[{id:'water',cost:9.5,votes:103},{id:'light',cost:7.2,votes:85},{id:'access',cost:3.6,votes:58}]),['water','light']);
assert.deepEqual(A.license(40,5,3,2,.5),{gross:8,cost:1.5,net:6.5});
assert.equal(A.license(1,1,1,0,5).net,-4.99);
assert.equal(A.finance(0,0,0).share,0);
assert.equal(A.finance(25,75,60).remaining,40);
assert.deepEqual(A.savings(80,60,15),{saved:7.2,left:72.8});
assert.equal(A.savings(80,0,15).saved,0);
assert.throws(()=>A.savings(80,101,15));assert.throws(()=>A.license(NaN,5,3,2,.5));assert.throws(()=>A.budget(-1,[]));
const d=JSON.parse(fs.readFileSync('content.json','utf8'));assert.equal(d.pages.length,35);assert.equal(Object.keys(d.sources).length,77);
for(const p of d.pages){const f=path.join('dist',p.slug,'index.html');assert.ok(fs.existsSync(f));const h=fs.readFileSync(f,'utf8');assert.ok(h.includes('lang="kk"'));assert.equal((h.match(/<h1[ >]/g)||[]).length,1);assert.ok(h.includes('/algorithms.js'));for(const m of h.matchAll(/data-source="([^"]+)"/g))assert.ok(d.sources[m[1]],m[1]);}
for(const f of ['app.js','algorithms.js','data.js'])new vm.Script(fs.readFileSync('dist/'+f,'utf8'),{filename:f});
console.log('PASS: 35 routes, 77 sources, JS syntax, calculator boundaries and invalid inputs.');
console.log('Browser visual QA and native WebMCP validation unavailable for this static execution profile.');
