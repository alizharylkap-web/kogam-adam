"""Create a self-contained atlas review file, with all 35 articles embedded."""
from pathlib import Path
import base64,json,re
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
OUT=Path('/workspace/scratch/eca73549458c/output/Qogam_Idea_3D_Preview.html')
def safe_js(s):return re.sub(r'</script',r'<\\/script',s,flags=re.I)
h=(DIST/'atlas/index.html').read_text()
h=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',h)
h=re.sub(r'<link rel="stylesheet"[^>]*>','',h)
css='\n'.join((DIST/f).read_text() for f in ['styles.css','atlas.css','reading.css'])
css=re.sub(r'@import\s+url\([^)]*\)\s*;','',css)
h=h.replace('</head>','<style>'+css+'</style></head>')
favicon='data:image/svg+xml;base64,'+base64.b64encode((DIST/'favicon.svg').read_bytes()).decode()
h=h.replace('href="/favicon.svg"','href="'+favicon+'"')
data=json.loads((ROOT/'content.json').read_text())
countries=json.loads((DIST/'assets/countries-110m.geojson').read_text())
texture='data:image/webp;base64,'+base64.b64encode((DIST/'assets/earth-day.webp').read_bytes()).decode()
setup='window.ATLAS_PREVIEW=true;window.ATLAS_DATA='+json.dumps(data,ensure_ascii=False)+';window.ATLAS_COUNTRIES='+json.dumps(countries,separators=(',',':'))+';window.ATLAS_EARTH_TEXTURE='+json.dumps(texture)+';'
scripts=[setup]+[(DIST/f).read_text() for f in ['vendor/globe.gl.min.js','algorithms.js','atlas.js','reading.js','app.js']]
h=h.replace('</body>',''.join('<script>'+safe_js(s)+'</script>' for s in scripts)+'</body>')
OUT.parent.mkdir(exist_ok=True);OUT.write_text(h)
print(OUT,OUT.stat().st_size,'bytes')
