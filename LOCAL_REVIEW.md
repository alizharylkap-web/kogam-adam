# QOGAM × IDEA: local review

GitHub and hosted deployments have not been updated. The source research remains unchanged.

## Review file

Run `python build_preview.py` to generate a self-contained HTML review file. It includes the 3D globe, the geographical map, the case list, full case articles, comparison, and all 35 articles through the contents menu. It needs a browser supporting WebGL for the 3D view; the map/list remain available without WebGL. Internal chapter links open articles in the review file. Their dedicated interactive laboratories are available in the complete site, rather than reproduced in the review overlay.

## Complete site

Serve `dist` as the website root, for example `python -m http.server 8000 --directory dist`. No build is required to serve the saved output. To regenerate article pages, run `python build_site.py`; the atlas, reading scripts and styles stay in `dist`.

## Checks

- `node validate.cjs`: existing route/content/calculator checks.
- `node validate-atlas.cjs`: install `jsdom@26` as a local test dependency first; checks complete case text, case coordinates, map data, filtering, comparison and WebGL failure recovery.
- Rendering, touch gestures and FPS must be checked in real Safari on iPhone and a desktop browser. DOM tests do not validate GPU rendering or mobile frame rate.

## Assets

The globe library is pinned to Globe.GL 2.45.0 and served locally. Earth imagery: NASA SVS, Blue Marble. Countries: Natural Earth 110m. Source credits and geography provenance are in `dist/assets/earth-provenance.json`; third-party notices are in `dist/vendor/`.
