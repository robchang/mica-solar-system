# Mica Solar System

An interactive 3D solar system visualization built as a [Mica](https://github.com/anthropics/mica) canvas card.

## Features

- **8 planets** orbiting the Sun with realistic textures from NASA / Wikimedia Commons (CC BY 4.0)
- **Saturn's rings** rendered with a dedicated ring texture
- **Kepler's laws** — orbital speeds follow real relative periods (Earth = 1 year)
- **Axial tilts** — each planet rotated to its real tilt angle
- **Starfield** background with 5,000 procedurally placed stars
- **Orbital path lines** showing each planet's orbit
- **Interactive controls** — rotate, zoom, and pan with the mouse
- **Info panel** — click any planet or the Sun to view details (type, diameter, day length, moons, temperature)

## Tech Stack

- **Three.js 0.160** (UMD) — 3D rendering
- **OrbitControls** (ESM dynamic import) — camera navigation
- All textures loaded from public-domain Wikimedia Commons sources
- Fallback procedural colors for any texture that fails to load

## Usage

Open the project in Mica and click the **Solar System** card on the canvas. Use your mouse to:

- **Left-click + drag** — rotate the view
- **Scroll wheel** — zoom in/out
- **Right-click + drag** — pan

Click on any planet or the Sun to see its information panel.

## License

Planet textures are CC BY 4.0 from Wikimedia Commons / NASA Scientific Visualization Studio.
