# Gradient Loop

A dependency-free WebGL motion studio inspired by the supplied molten gradient reference. Two circular forms share a continuously travelling phase field with a warm core and violet falloff. This is a procedural interpretation, not video playback or a frame-perfect reconstruction.

## Run

Run `npm run dev` and open http://localhost:3000. No installation or build required. Deploy the folder as a static website, including GitHub Pages.

## Controls

- Five editable gradient colours, four palette presets, intensity and gradient softness.
- Loop duration, phase offset, easing, reverse, playback, restart and timeline scrubbing.
- Orb radius, separation, vertical stretch, glow spread, grain, and scale.
- Portrait, square and landscape previews; fullscreen and PNG frame capture.
- JSON export/import and automatic local browser persistence.
- Space pauses; H toggles a distraction-free view. Reduced-motion preference starts the artwork paused.

## Implementation

`app.js` contains the GLSL fragment shader, palette interpolation, and rendering/UI code. One fullscreen triangle pair is rendered in native WebGL 1. A lower-resolution Canvas 2D software implementation of the same field is used when WebGL is unavailable. The shader combines signed circle distances and a periodic travelling phase field; every animated term repeats after one cycle. Grain is spatially fixed for seamless looping. Resolution is responsive with device pixel ratio capped at 2. No dependencies, CDNs, external fonts or assets.

The original reference video is intentionally not bundled. The shader can be embedded by reusing its uniforms and full-screen rendering setup.

## Check

`npm run check` verifies JavaScript syntax and samples loop endpoints, boundary velocity, and finite field values across all easing modes. Layout, playback, timeline scrubbing and palette controls were checked in the preview browser using the software renderer. The preview browser did not expose WebGL, so GPU shader compilation and GPU appearance remain unverified. Browser QA should also verify WebGL compilation, colour changes, scrubbing, import/export and capture.
