# Gradient Loop

Reference-based animation reconstruction with editable colours and timing.

The original four-second cycle is sampled into a 120-frame, 214 × 280 texture atlas. The renderer interpolates four neighbouring frames cyclically using Catmull–Rom interpolation, including across the loop boundary. This preserves the reference silhouette and evolving glow. It is a texture-based reconstruction, not a fully procedural simulation.

## Run

Run `npm run dev`, then open http://localhost:3000. No package installation required. The Three.js version requires an internet connection to load its pinned module. GitHub Pages can serve these static files directly.

## Controls

Five palette colours, intensity, gradient softness, loop duration, phase, easing, reverse, timeline scrubbing, horizontal shape, separation, vertical stretch, glow strength, grain and scale. Import/export JSON settings and save a PNG frame. Space pauses and H hides controls.

Shape controls warp the reference field; extreme settings can reveal the texture bounds. Source resolution is limited to 214 × 280 per frame. Default colours preserve the source RGB, with editable palette adjustments applied as a colour difference.

## Validation

`npm run check` checks JavaScript syntax and cyclic interpolation. Source-frame comparison measured mean RGB error of 1.22/255 after WebP compression. The last-to-first frame difference is within normal source frame variation. Software-rendered bright and inverted phases were inspected in the browser. GPU execution is not verified in the remote browser, which has WebGL disabled.

This branch uses Three.js 0.180.0 loaded from the pinned jsDelivr ES module URL and RawShaderMaterial.
