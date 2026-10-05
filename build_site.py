from pathlib import Path
import json,html,re
ROOT=Path('/workspace/sites/qogam-idea-atlas');D=json.loads((ROOT/'content.json').read_text());P=D['pages'];e=html.escape
names={'gov':'Жергілікті басқару','ip':'Зияткерлік меншік','labs':'Зертханалар','overview':'Атлас және деректер'}
def url(p):return '/'+p['slug']+'/' if p['slug'] else '/'
def inline(t):
    t=e(t);return re.sub(r'\[([KG]\d+)\]',lambda m:f'<button class="cite" data-source="{m[1]}" aria-label="{m[1]} дереккөзін көрсету">{m[1]}</button>',t)
def card(p):return f'<a class="chapter-card {p["group"]}" href="{url(p)}"><span class="card-top"><span>{p["num"]}</span><span>{names[p["group"]]}</span></span><h3>{e(p["title"])}</h3><p>{e(p["deck"])}</p><span class="card-bottom">{p["minutes"]} минут · Мақаланы ашу</span></a>'
def article(p):
    s='<article class="article-text" id="reading">'
    takeaways=[b['text'] for a in p['article'] for b in a['blocks'] if b['type']=='p' and re.match(r'^(Авторлық талдау|Талдау[.:]|Қазақстанға сабақ)',b['text'])]
    if takeaways:s+='<div class="article-brief"><span>ТАЛДАУДЫҢ ТҮЙІНІ</span><p>'+inline(takeaways[0])+'</p></div>'
    for i,a in enumerate(p['article']):
        s+=f'<section id="section-{i}"><h2>{e(a["heading"])}</h2>'
        for b in a['blocks']:
            if b['type']=='p':s+='<p>'+inline(b['text'])+'</p>'
            else:
                s+='<div class="table-scroll" tabindex="0" role="region" aria-label="Дерек кестесі"><table>'
                for j,row in enumerate(b['rows']):
                    tag='th' if j==0 else 'td';s+='<tr>'+''.join(f'<{tag}>'+inline(c)+f'</{tag}>' for c in row)+'</tr>'
                s+='</table></div>'
        s+='</section>'
    return s+'</article>'
nav='<nav class="main-nav" aria-label="Негізгі бағыттар"><a href="/atlas/">Әлемдік атлас</a><a href="/local-government/">Басқару</a><a href="/ip-objects/">Зияткерлік меншік</a><a href="/budget-lab/">Зертханалар</a></nav>'
footer='<footer><a class="brand" href="/">QOGAM <span>×</span> IDEA</a><p>Шешімдер мен идеялар атласы</p><div><a href="/sources/">Дереккөз және әдіс</a><a href="/news/">Өзгерістер күнтізбесі</a><button data-open="contents">35 беттің мазмұны</button></div><small>Зерттеу: 05.10.2026 · Оқу зертханалары демонстрациялық деректермен жұмыс істейді.</small></footer>'
for n,p in enumerate(P):
    toc=''.join(f'<a href="#section-{i}">{e(a["heading"])}</a>' for i,a in enumerate(p['article']))
    head=f'''<!doctype html><html lang="kk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{e(p['deck'])}"><meta name="theme-color" content="#061323"><title>{e(p['title'])} — QOGAM × IDEA</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/atlas.css"><link rel="stylesheet" href="/reading.css"><script src="/data.js" defer></script><script src="/algorithms.js" defer></script><script src="/atlas.js" defer></script><script src="/reading.js" defer></script><script src="/app.js" defer></script></head><body data-page="{p['slug']}" data-kind="{p['kind']}" data-group="{p['group']}"><a href="#main" class="skip">Мазмұнға өту</a><div class="read-progress" aria-hidden="true"></div><header class="site-header"><a href="/" class="brand">QOGAM <span>×</span> IDEA</a>{nav}<div class="header-tools"><button data-open="search" class="icon-button" aria-label="Сайттан іздеу">Іздеу <kbd>⌘ K</kbd></button><button data-open="contents" class="menu-button" aria-label="35 беттің мәзірін ашу">Мазмұн</button></div></header>'''
    if not p['slug']:
        main='''<main id="main"><section class="home-hero"><img src="/assets/glass-city.webp" alt="Қоғамдық кеңістік пен идеяны бейнелейтін шыны архитектуралық композиция" width="1536" height="1024" fetchpriority="high"><div class="hero-copy"><div class="eyebrow">ӘЛЕМДІК ЗЕРТТЕУ / 2026</div><h1>Қоғам шешеді.<br><em>Идея өзгертеді.</em></h1><p>Биліктің өкілеттігін түсініңіз. Әлемнің тәжірибесін зерттеңіз. Өз шешіміңізді сынаңыз.</p><div class="hero-actions"><a class="button primary" href="/atlas/">Атласты зерттеу</a><a class="button secondary" href="/budget-lab/">Бюджетті бөліп көру</a></div></div><div class="hero-foot"><span>35 толық бөлім</span><span>77 дереккөз</span><span>Екі зерттеу бағыты</span></div></section><section class="section-wrap"><div class="section-head"><div><div class="eyebrow">ӨЗІҢІЗ ТАҢДАҢЫЗ</div><h2>Бір сайт. Екі әлем.</h2></div><p>Қоғамдық шешім мен зияткерлік актив бір жобада тоғысады.</p></div><div class="direction-grid"><a href="/local-government/" class="direction gov"><span>01 / ҚОҒАМ</span><h3>Кім шешеді?<br>Кім жауап береді?</h3><p>Өкілеттіктер, бюджет, қоғамдастық және әлемдік тәжірибе.</p><strong>Жергілікті басқару</strong></a><a href="/ip-objects/" class="direction ip"><span>02 / ИДЕЯ</span><h3>Идея кімге тиесілі?<br>Қалай құн жасайды?</h3><p>Авторлық құқық, патент, бренд және лицензиялау.</p><strong>Зияткерлік меншік</strong></a></div></section><section class="atlas-home section-wrap"><div class="section-head"><div><div class="eyebrow">ӘЛЕМДІК ТӘЖІРИБЕ</div><h2>Бір нүкте — бір сабақ.</h2></div><a href="/atlas/" class="text-link">Барлық кейсті зерттеу</a></div><div id="interactive" class="interactive home-map"></div></section><section class="section-wrap"><div class="section-head"><div><div class="eyebrow">ӘРЕКЕТ АРҚЫЛЫ ТҮСІНУ</div><h2>Шешіміңізді сынаңыз.</h2></div></div><div class="card-grid">'''+card(P[32])+card(P[33])+card(P[31])+'''</div></section><section class="section-wrap"><div class="section-head"><div><div class="eyebrow">ЖАҢА ДЕРЕК, НАҒЫЗ МАҒЫНА</div><h2>Зерттеудің алдыңғы шебі.</h2></div><a class="text-link" href="/news/">Күнтізбені ашу</a></div><div class="card-grid">'''+card(P[20])+card(P[17])+card(P[28])+'''</div></section><section class="reading-layout section-wrap"><aside class="toc"><span>АТЛАСТЫҢ НЕГІЗІ</span>'''+toc+'</aside>'+article(p)+'</section></main>'
    else:
        lab=p['group']=='labs';special=p['kind'] in ['atlas','sources'];interactivefirst=lab or special
        main=f'<main id="main"><section class="page-hero {p["group"]}"><div class="breadcrumb"><a href="/">Атлас</a><span>/</span><span>{names[p["group"]]}</span></div><div class="page-title"><div><div class="eyebrow">{p["num"]} / {names[p["group"]].upper()}</div><h1>{e(p["title"])}</h1><p>{e(p["deck"])}</p></div><div class="page-stamp"><strong>{p["minutes"]}</strong><span>минут оқу</span><span>05.10.2026</span></div></div></section>'
        interaction=f'<section class="section-wrap lab-area"><div class="lab-head"><span class="eyebrow">{("ДЕРЕКТІ ЗЕРТТЕУ" if special else "ӨЗІҢІЗ ТЕКСЕРІҢІЗ")}</span><span class="lab-tag">{("ТЕКСЕРІЛГЕН ДЕРЕК" if p["kind"] in ["atlas","sources","stats","timeline","compare"] else "ОҚУ СЦЕНАРИЙІ")}</span></div><div id="interactive" class="interactive"></div></section>'
        if interactivefirst:main+=interaction
        main+='<div class="reading-layout section-wrap"><aside class="toc"><span>ОСЫ БЕТТЕ</span>'+toc+'<a href="#interactive">Интерактив</a><button id="reader-size" aria-pressed="false">Мәтінді үлкейту</button></aside>'+article(p)+'</div>'
        if not interactivefirst:main+=interaction
        if p['sources']:
            main+='<section class="section-wrap reference-strip"><h2>Осы беттің дереккөздері</h2><div>'+''.join(f'<button data-source="{s}">{s} · {e(D["sources"][s]["label"].split(".")[0])}</button>' for s in p['sources'] if s in D['sources'])+'</div></section>'
        prev=P[n-1];nxt=P[(n+1)%len(P)]
        main+=f'<nav class="chapter-pagination section-wrap" aria-label="Бөлімдер арасында өту"><a href="{url(prev)}"><span>Алдыңғы бөлім · {prev["num"]}</span><strong>{e(prev["title"])}</strong></a><a href="{url(nxt)}"><span>Келесі бөлім · {nxt["num"]}</span><strong>{e(nxt["title"])}</strong></a></nav></main>'
    dialogs='''<dialog id="search-dialog" aria-labelledby="search-title"><div class="dialog-top"><h2 id="search-title">Атластан іздеу</h2><button data-close aria-label="Терезені жабу">Жабу</button></div><label class="search-field">Тақырып, ел немесе ұғым<input id="search-input" type="search" placeholder="Мысалы: патент, Париж, бюджет" autocomplete="off"></label><div id="search-results" aria-live="polite"></div></dialog><dialog id="contents-dialog" aria-labelledby="contents-title"><div class="dialog-top"><h2 id="contents-title">35 беттің мазмұны</h2><button data-close>Жабу</button></div><div class="contents-groups">'''
    for group in names:
        dialogs+=f'<section><h3>{names[group]}</h3>'+''.join(f'<a href="{url(q)}"><span>{q["num"]}</span>{e(q["title"])}</a>' for q in P if q['group']==group)+'</section>'
    dialogs+='</div></dialog><dialog id="source-dialog" aria-labelledby="source-title"><div class="dialog-top"><h2 id="source-title">Деректің негізі</h2><button data-close>Жабу</button></div><div id="source-detail"></div></dialog>'
    dest=ROOT/'dist'/p['slug'] if p['slug'] else ROOT/'dist';dest.mkdir(exist_ok=True);(dest/'index.html').write_text(head+main+footer+dialogs+'</body></html>')
(ROOT/'dist/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#061323"/><circle cx="12" cy="16" r="7" fill="none" stroke="#56ddcf" stroke-width="2"/><path d="M19 9v14M15 16h9" stroke="#f0bd74" stroke-width="2"/></svg>')
print('Rendered',len(P),'routes')
