// Solar System — Three.js 3D interactive visualization
// Six-line skeleton: query → state → functions → events → cleanup → first render

// 1. Query DOM
const canvasContainer = container.querySelector('.ss-canvas-container');

// Load OrbitControls addon (ESM via esm.sh for bare import resolution)
const THREE_ADDONS = await import('https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js?deps=three@0.160.0');
const infoPanel = container.querySelector('.ss-info-panel');
const infoTitle = container.querySelector('.ss-info-title');
const infoBody = container.querySelector('.ss-info-body');
const planetListEl = container.querySelector('.ss-planet-list');
const controlsHint = container.querySelector('.ss-controls-hint');

// 2. Script-scoped state
let scene, camera, renderer, controls;
let sunMesh, planetMeshes = [], orbitLines = [], labelDivs = [];
let animationId = null;
let textureLoader = null;
let loadedTextures = {};
let hoveredPlanet = null;
let selectedPlanet = null;

// Planet data
const PLANETS = [
  {
    name: 'Mercury', type: 'Terrestrial Planet',
    diameter: '4,879 km', dayLength: '58.6 Earth days', moons: 0,
    temp: '−180°C to 430°C', color: 0xA5A5A5, size: 0.35,
    orbitRadius: 2.0, orbitSpeed: 4.15, axialTilt: 0.03 * Math.PI / 180,
    rotationSpeed: 0.017, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg'
  },
  {
    name: 'Venus', type: 'Terrestrial Planet',
    diameter: '12,104 km', dayLength: '243 Earth days', moons: 0,
    temp: '~465°C', color: 0xE8CD6A, size: 0.6,
    orbitRadius: 3.0, orbitSpeed: 1.62, axialTilt: 177.4 * Math.PI / 180,
    rotationSpeed: -0.004, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Solarsystemscope_texture_2k_venus_surface.jpg'
  },
  {
    name: 'Earth', type: 'Terrestrial Planet',
    diameter: '12,756 km', dayLength: '24 hours', moons: 1,
    temp: '−50°C to 50°C', color: 0x2266CC, size: 0.65,
    orbitRadius: 4.2, orbitSpeed: 1.0, axialTilt: 23.4 * Math.PI / 180,
    rotationSpeed: 0.5, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Solarsystemscope_texture_2k_earth_daymap.jpg'
  },
  {
    name: 'Mars', type: 'Terrestrial Planet',
    diameter: '6,792 km', dayLength: '24.6 hours', moons: 2,
    temp: '−140°C to 30°C', color: 0xCC5533, size: 0.45,
    orbitRadius: 5.6, orbitSpeed: 0.53, axialTilt: 25.2 * Math.PI / 180,
    rotationSpeed: 0.48, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg'
  },
  {
    name: 'Jupiter', type: 'Gas Giant',
    diameter: '142,984 km', dayLength: '9.9 hours', moons: 95,
    temp: '−110°C', color: 0xC8A070, size: 1.8,
    orbitRadius: 8.0, orbitSpeed: 0.084, axialTilt: 3.1 * Math.PI / 180,
    rotationSpeed: 1.2, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Solarsystemscope_texture_2k_jupiter.jpg'
  },
  {
    name: 'Saturn', type: 'Gas Giant',
    diameter: '120,536 km', dayLength: '10.7 hours', moons: 146,
    temp: '−175°C', color: 0xE8D5A0, size: 1.5,
    orbitRadius: 11.0, orbitSpeed: 0.034, axialTilt: 26.7 * Math.PI / 180,
    rotationSpeed: 1.1, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_8k_saturn.jpg',
    hasRings: true
  },
  {
    name: 'Uranus', type: 'Ice Giant',
    diameter: '51,118 km', dayLength: '17.2 hours', moons: 28,
    temp: '−200°C', color: 0x72B5C4, size: 1.0,
    orbitRadius: 14.0, orbitSpeed: 0.012, axialTilt: 97.8 * Math.PI / 180,
    rotationSpeed: -0.9, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg'
  },
  {
    name: 'Neptune', type: 'Ice Giant',
    diameter: '49,528 km', dayLength: '16.1 hours', moons: 16,
    temp: '−210°C', color: 0x3355CC, size: 0.95,
    orbitRadius: 17.0, orbitSpeed: 0.006, axialTilt: 28.3 * Math.PI / 180,
    rotationSpeed: 1.0, textureUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg'
  }
];

// 3. Functions
function initScene() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(55, getAspect(), 0.1, 2000);
  camera.position.set(15, 12, 18);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  canvasContainer.appendChild(renderer.domElement);

  // Controls
  controls = new THREE_ADDONS.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 80;
  controls.target.set(0, 0, 0);

  // Lighting — Sun is the light source
  const sunLight = new THREE.PointLight(0xffffff, 8, 200);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x666688, 1.0));
  // Hemisphere fill light for better visibility
  const hemiLight = new THREE.HemisphereLight(0x8888aa, 0x222233, 0.5);
  scene.add(hemiLight);

  // Starfield
  createStarfield();

  // Sun
  createSun();

  // Planets
  textureLoader = new THREE.TextureLoader();
  PLANETS.forEach((p, i) => createPlanet(p, i));

  // 4. Events
  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('click', onCanvasClick);
  renderer.domElement.addEventListener('mousemove', onCanvasHover);

  // 5. Cleanup
  mica.onDestroy(() => {
    window.removeEventListener('resize', onResize);
    renderer.domElement.removeEventListener('click', onCanvasClick);
    renderer.domElement.removeEventListener('mousemove', onCanvasHover);
    cancelAnimationFrame(animationId);
    renderer.dispose();
    if (controls) controls.dispose();
    PLANETS.forEach((p, i) => {
      if (planetMeshes[i]) {
        planetMeshes[i].geometry?.dispose();
        if (Array.isArray(planetMeshes[i].material)) {
          planetMeshes[i].material.forEach(m => m.dispose());
        } else {
          planetMeshes[i].material?.dispose();
        }
      }
    });
    sunMesh?.geometry?.dispose();
    sunMesh?.material?.dispose();
    orbitLines.forEach(l => { l.geometry?.dispose(); l.material?.dispose(); });
    labelDivs.forEach(l => l.remove());
  });

  // 6. First render
  textureLoader = new THREE.TextureLoader();
  renderPlanetList();
  animate();
}

function getAspect() {
  return canvasContainer.clientWidth / canvasContainer.clientHeight;
}

function createStarfield() {
  const starCount = 5000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 500 + Math.random() * 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    const brightness = 0.5 + Math.random() * 0.5;
    const tint = Math.random();
    colors[i3] = brightness * (tint > 0.8 ? 1.0 : 0.9);
    colors[i3 + 1] = brightness * (tint > 0.9 ? 0.8 : 0.95);
    colors[i3 + 2] = brightness;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const starMat = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, sizeAttenuation: true });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
}

function createSun() {
  const sunGeo = new THREE.SphereGeometry(1.2, 48, 48);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD33 });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sunMesh);

  // Glow sprite
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 128;
  glowCanvas.height = 128;
  const ctx = glowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 220, 80, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 180, 50, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 140, 20, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glowMat = new THREE.SpriteMaterial({ map: glowTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.7 });
  const glowSprite = new THREE.Sprite(glowMat);
  glowSprite.scale.set(6, 6, 1);
  sunMesh.add(glowSprite);
}

function createPlanet(data, index) {
  // Planet sphere
  const geometry = new THREE.SphereGeometry(data.size, 48, 48);

  // Create material with fallback color — texture loads async on top
  const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.8 });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { planetIndex: index, planetData: data };
  mesh.material = material; // explicit ref for texture callback

  // Async texture load — update material when done
  textureLoader.load(data.textureUrl, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    mesh.material.map = tex;
    mesh.material.needsUpdate = true;
    console.log('[SolarSystem] Loaded texture for', data.name);
  }, undefined, (err) => {
    console.warn('[SolarSystem] Texture failed for', data.name, err);
  });

  // Create a group to hold planet + label
  const group = new THREE.Group();
  group.add(mesh);

  // Axial tilt
  group.rotation.z = data.axialTilt;

  scene.add(group);
  planetMeshes[index] = group;

  // Label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'ss-label';
  labelDiv.textContent = data.name;
  canvasContainer.appendChild(labelDiv);
  labelDivs.push(labelDiv);

  // Orbit line
  const orbitCurve = new THREE.EllipseCurve(0, 0, data.orbitRadius, data.orbitRadius, 0, 2 * Math.PI, false, 0);
  const orbitPoints = orbitCurve.getPoints(128);
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setFromPoints(orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });
  const orbitLine = new THREE.Line(orbitGeo, orbitMat);
  scene.add(orbitLine);
  orbitLines.push(orbitLine);

  // Saturn rings
  if (data.hasRings) {
    const innerRadius = data.size * 1.4;
    const outerRadius = data.size * 2.5;
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    // Fix UVs for ring texture
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const dist = Math.sqrt(x * x + z * z);
      uv.setXY(i, (dist - innerRadius) / (outerRadius - innerRadius), 0.5);
    }

    // Create ring texture procedurally
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 256;
    ringCanvas.height = 16;
    const rCtx = ringCanvas.getContext('2d');
    const ringGrad = rCtx.createLinearGradient(0, 0, 256, 0);
    ringGrad.addColorStop(0, 'rgba(180, 160, 130, 0.0)');
    ringGrad.addColorStop(0.1, 'rgba(200, 180, 150, 0.6)');
    ringGrad.addColorStop(0.2, 'rgba(180, 160, 130, 0.2)');
    ringGrad.addColorStop(0.3, 'rgba(210, 190, 160, 0.8)');
    ringGrad.addColorStop(0.5, 'rgba(190, 170, 140, 0.4)');
    ringGrad.addColorStop(0.7, 'rgba(200, 180, 150, 0.7)');
    ringGrad.addColorStop(0.85, 'rgba(180, 160, 130, 0.3)');
    ringGrad.addColorStop(1, 'rgba(160, 140, 110, 0.0)');
    rCtx.fillStyle = ringGrad;
    rCtx.fillRect(0, 0, 256, 16);
    const ringTexture = new THREE.CanvasTexture(ringCanvas);

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    group.add(ringMesh);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  const elapsed = performance.now() / 1000;

  PLANETS.forEach((data, i) => {
    const group = planetMeshes[i];
    if (!group) return;

    // Orbital position
    const angle = elapsed * data.orbitSpeed * 0.3 + (i * 0.7); // randomized phase
    const x = Math.cos(angle) * data.orbitRadius;
    const z = Math.sin(angle) * data.orbitRadius;
    group.position.set(x, 0, z);

    // Self-rotation
    group.children[0].rotation.y += data.rotationSpeed * 0.01;
  });

  // Sun rotation
  if (sunMesh) {
    sunMesh.rotation.y += 0.002;
  }

  // Update labels
  PLANETS.forEach((data, i) => {
    const group = planetMeshes[i];
    if (!group || !labelDivs[i]) return;
    const worldPos = new THREE.Vector3();
    group.getWorldPosition(worldPos);
    worldPos.y += data.size + 0.5;
    const screenPos = worldPos.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * canvasContainer.clientWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * canvasContainer.clientHeight;
    labelDivs[i].style.left = x + 'px';
    labelDivs[i].style.top = y + 'px';
    // Hide if behind camera
    labelDivs[i].style.display = screenPos.z > 1 ? 'none' : 'block';
  });

  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = getAspect();
  camera.updateProjectionMatrix();
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

function onCanvasClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const meshes = planetMeshes.map(g => g.children[0]).concat([sunMesh]);
  const intersects = raycaster.intersectObjects(meshes);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.userData.planetData) {
      showPlanetInfo(obj.userData.planetData);
    } else if (obj === sunMesh) {
      showSunInfo();
    }
  } else {
    hidePlanetInfo();
  }
}

function onCanvasHover(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const meshes = planetMeshes.map(g => g.children[0]).concat([sunMesh]);
  const intersects = raycaster.intersectObjects(meshes);
  renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

function showPlanetInfo(data) {
  infoTitle.textContent = data.name;
  infoBody.innerHTML = `
    <div class="ss-info-row"><span class="ss-info-label">Type:</span> <span>${data.type}</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Diameter:</span> <span>${data.diameter}</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Day Length:</span> <span>${data.dayLength}</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Moons:</span> <span>${data.moons}</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Temperature:</span> <span>${data.temp}</span></div>
  `;
}

function showSunInfo() {
  infoTitle.textContent = 'The Sun';
  infoBody.innerHTML = `
    <div class="ss-info-row"><span class="ss-info-label">Type:</span> <span>G-type Main Sequence Star</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Diameter:</span> <span>1,391,000 km</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Surface Temp:</span> <span>5,500°C</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Core Temp:</span> <span>15,000,000°C</span></div>
    <div class="ss-info-row"><span class="ss-info-label">Age:</span> <span>4.6 billion years</span></div>
  `;
}

function hidePlanetInfo() {
  infoTitle.textContent = 'Solar System';
  infoBody.innerHTML = '<div class="ss-hint">Click a planet or the Sun for details</div>';
}

function renderPlanetList() {
  planetListEl.innerHTML = '';
  const allNames = ['Sun', ...PLANETS.map(p => p.name)];
  const colors = ['#FFDD33', '#A5A5A5', '#E8CD6A', '#2266CC', '#CC5533', '#C8A070', '#E8D5A0', '#72B5C4', '#3355CC'];
  allNames.forEach((name, i) => {
    const item = document.createElement('div');
    item.className = 'ss-planet-item';
    item.innerHTML = `<span class="ss-dot" style="background:${colors[i]}"></span>${name}`;
    item.addEventListener('click', () => {
      if (name === 'Sun') {
        showSunInfo();
      } else {
        const idx = PLANETS.findIndex(p => p.name === name);
        if (idx >= 0 && planetMeshes[idx]) {
          const worldPos = new THREE.Vector3();
          planetMeshes[idx].getWorldPosition(worldPos);
          controls.target.copy(worldPos);
          showPlanetInfo(PLANETS[idx]);
        }
      }
    });
    planetListEl.appendChild(item);
  });
}

// Init
textureLoader = new THREE.TextureLoader();

mica.onCapture(() => {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
});

(async () => {
  await THREE_ADDONS;
  initScene();
})();