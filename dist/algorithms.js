'use strict';
(function(g){
const round=x=>Math.round(x*1000000)/1000000;
const nonnegative=(...xs)=>{if(xs.some(x=>!Number.isFinite(x)||x<0))throw new Error('Expected finite nonnegative values')};
const A={
 budget(cap,projects){nonnegative(cap);if(!Array.isArray(projects)||projects.some(p=>!Number.isFinite(p.cost)||p.cost<0||!Number.isFinite(p.votes)||p.votes<0))throw new Error('Invalid projects');const total=round(projects.reduce((s,p)=>s+p.cost,0));return{total,remaining:round(cap-total),votes:projects.reduce((s,p)=>s+p.votes,0)}},
 allocate(cap,projects){nonnegative(cap);let remaining=cap;return [...projects].sort((a,b)=>b.votes-a.votes).filter(p=>{nonnegative(p.cost,p.votes);if(p.cost<=remaining+1e-9){remaining=round(remaining-p.cost);return true}return false}).map(p=>p.id)},
 license(sales,royalty,years,advance,expense){nonnegative(sales,royalty,years,advance,expense);if(royalty>100||years<1)throw new Error('Invalid license range');const gross=round(advance+sales*royalty/100*years),cost=round(expense*years);return{gross,cost,net:round(gross-cost)}},
 finance(own,transfer,mandatory){nonnegative(own,transfer,mandatory);const total=own+transfer;return{total,share:total?own/total*100:0,remaining:total-mandatory}},
 savings(base,adoption,effect){nonnegative(base,adoption,effect);if(adoption>100||effect>100)throw new Error('Invalid percent');const saved=round(base*adoption/100*effect/100);return{saved,left:round(base-saved)}}
};if(typeof module==='object'&&module.exports)module.exports=A;else g.AtlasAlgorithms=A;
})(typeof window!=='undefined'?window:globalThis);
