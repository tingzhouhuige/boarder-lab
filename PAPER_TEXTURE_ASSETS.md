# Paper postcard materials

Project assets, 2026-10-30:

- `assets/paper-cotton-surface.png`: full-bleed macro scan of blank warm-white uncoated cotton fine-art postcard stock, irregular cellulose fibres, shallow meandering creases, soft diffuse raking light. No text, borders, stains, regular weave, repetitive noise or heavy crumpling.
- `assets/paper-cotton-surface-2.png`: a different, slightly smoother ivory-white sheet, asymmetric shallow wrinkles including a short forked crease near the upper right and a bent crease near the lower left. Neutral diffuse lighting, no objects, text, stains, vignette, repeated noise or distressed paper.

The renderer randomly assigns a stable seed to each imported photo. The seed selects one material and its rotation, reflection and crop. Broad illumination and crease shadows are removed with local contrast filtering; a narrow, neutral luminance range retains subtle sketch-paper tooth. No extra creases are drawn. Design synchronization does not copy this per-photo seed. Preview and export use the same material and seed; strength 0 bypasses compositing. The texture covers both the photo and white border.
