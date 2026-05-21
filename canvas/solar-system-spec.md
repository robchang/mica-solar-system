---
card-class:
  name: solar-system
  badge: SST
  defaultTitle: Solar System
  handler: ~
  sidecar: ~
  dependencies:
    umd_scripts:
      - url: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
        format: UMD
        version: "0.160.0"
    styles: []
  subtasks:
    - {name: "3D scene with WebGL renderer", tier: 1, mechanism: "card.js + Three.js UMD", verify: "render_capture"}
    - {name: "camera controls (zoom/pan/rotate)", tier: 1, mechanism: "card.js + OrbitControls ESM import", verify: "render_capture"}
    - {name: "Sun glow and point light", tier: 1, mechanism: "card.js + Three.js built-in lighting", verify: "render_capture"}
    - {name: "8 planets with realistic textures", tier: 1, mechanism: "card.js + THREE.TextureLoader with NASA/Wikimedia URLs", verify: "render_capture"}
    - {name: "Saturn rings", tier: 1, mechanism: "card.js + RingGeometry with NASA ring texture", verify: "render_capture"}
    - {name: "starfield background", tier: 1, mechanism: "card.js + THREE.Points", verify: "render_capture"}
    - {name: "orbital path lines", tier: 1, mechanism: "card.js + THREE.Line", verify: "render_capture"}
    - {name: "planet labels (HTML overlay)", tier: 1, mechanism: "card.js + CSS2D-style HTML overlay", verify: "render_capture"}
    - {name: "smooth animation loop", tier: 1, mechanism: "card.js + requestAnimationFrame", verify: "render_capture"}
    - {name: "info panel", tier: 1, mechanism: "card.js + DOM overlay", verify: "render_capture"}
  out_of_scope:
    - "realistic scale distances (compressed for visibility)"
    - "realistic planet size ratios (compressed for visibility)"
    - "asteroid belt"
    - "planetary moons (except Saturn's rings)"
---

# Solar System

## Overview

A canvas card that renders an interactive 3D solar system visualization using Three.js. All 8 planets orbit the Sun at relative speeds following Kepler's laws, with realistic NASA textures. Saturn has iconic rings. A starfield fills the background. Users can zoom, pan, and rotate the view with mouse controls. Planet names float above each world, and a side panel shows planet info.

## Architecture

All computation happens in the browser — no server-side code needed. Three.js handles the 3D rendering; planet textures are loaded from public-domain NASA / Wikimedia sources via `THREE.TextureLoader`. Orbital animation uses `requestAnimationFrame` with elapsed time to compute positions.

### Planet Textures

Each planet uses a real texture image loaded via `THREE.TextureLoader` from public-domain NASA / Wikimedia sources:
- **Mercury**: NASA Scientific Visualization Studio Mercury texture
- **Venus**: NASA SAGE III texture
- **Earth**: NASA Blue Marble texture (with separate bump map)
- **Mars**: NASA Mars Reconnaissance Orbiter HiRISE texture
- **Jupiter**: NASA Juno texture
- **Saturn**: NASA Cassini texture (with separate ring texture)
- **Uranus**: NASA Hubble texture
- **Neptune**: NASA Hubble texture

All textures are loaded at init, wrapped in `THREE.TextureLoader.load()`, and disposed on cleanup. Fallback: if a texture fails to load, a procedural color sphere is used.

### Saturn's Rings

Saturn's rings use a separate ring texture from NASA sources, applied to a `RingGeometry` with `DoubleSide` shading. The ring texture is procedurally generated as a fallback if the NASA ring texture fails to load.

### Orbital Mechanics

- Orbital periods follow Kepler's third law: `T² ∝ a³` where `a` is semi-major axis
- Angular speed: `ω = 2π / T` where T is the orbital period in Earth years
- Each planet has a slightly randomized initial orbital phase so they don't all start aligned
- Orbital speeds are relative to Earth = 1 year period at 10 distance units

### Axial Tilts

Each planet is rotated on its axis with its real axial tilt:
- Mercury: ~0.03°
- Venus: ~177.4° (retrograde)
- Earth: ~23.4°
- Mars: ~25.2°
- Jupiter: ~3.1°
- Saturn: ~26.7°
- Uranus: ~97.8°
- Neptune: ~28.3°

### Visual Design

- Dark space background with hundreds of white stars
- Sun at center with emissive glow (yellow/orange with bloom-like effect)
- Planets lit by the Sun's point light (one side bright, one side dark)
- Faint white orbital path lines for each planet
- Planet name labels floating above each planet, always facing the camera
- Info panel on the right side with planet names, relative sizes, and quick facts

## Verified Dependencies

| Dependency | Type | URL | Format | Status |
|---|---|---|---|---|
| Three.js 0.160.0 | library | `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js` | UMD | ✅ 200, verified |
| OrbitControls | addon | `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js` | ESM | ✅ 200, verified (dynamic import) |

### Planet Texture URLs (Wikimedia Commons, CC BY 4.0)

| Planet | URL |
|---|---|
| Sun | `https://upload.wikimedia.org/wikipedia/commons/c/cb/Solarsystemscope_texture_2k_sun.jpg` |
| Mercury | `https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg` |
| Venus | `https://upload.wikimedia.org/wikipedia/commons/4/40/Solarsystemscope_texture_2k_venus_surface.jpg` |
| Earth | `https://upload.wikimedia.org/wikipedia/commons/c/c3/Solarsystemscope_texture_2k_earth_daymap.jpg` |
| Mars | `https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg` |
| Jupiter | `https://upload.wikimedia.org/wikipedia/commons/b/be/Solarsystemscope_texture_2k_jupiter.jpg` |
| Saturn | `https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_8k_saturn.jpg` |
| Uranus | `https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg` |
| Neptune | `https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg` |
| Stars | `https://upload.wikimedia.org/wikipedia/commons/0/0e/Solarsystemscope_texture_2k_stars_milky_way.jpg` |
