import * as THREE from "three";

const canvas = document.getElementById("bg-canvas");
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 90);
  camera.position.set(0, 0, 30);

  const count = isMobile ? 850 : 1900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  const palette = [
    new THREE.Color("#79b8ff"),
    new THREE.Color("#d7a8ff"),
    new THREE.Color("#82e6bd"),
    new THREE.Color("#ffd381"),
    new THREE.Color("#ff9a86")
  ];

  for (let i = 0; i < count; i += 1) {
    const radius = Math.pow(Math.random(), 0.58) * 31;
    const angle = Math.random() * Math.PI * 2;
    const depth = (Math.random() - 0.5) * 18;
    const height = (Math.random() - 0.5) * 30;
    const color = palette[Math.floor(Math.random() * palette.length)];

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = depth;

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 2.2 + 0.7;
    seeds[i] = Math.random() * 1000;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
    },
    vertexShader: `
      attribute float size;
      attribute float seed;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uPixelRatio;

      void main() {
        vec3 pos = position;
        float t = uTime * 0.28;
        float waveA = sin(pos.y * 0.15 + t + seed) * 1.25;
        float waveB = cos(pos.x * 0.11 + t * 1.42 + seed * 0.4) * 0.9;
        float waveC = sin((pos.x + pos.y) * 0.055 + t * 0.7) * 1.5;

        pos.x += waveA + waveC * 0.36;
        pos.y += waveB + waveC * 0.24;
        pos.z += sin(t + seed) * 0.65;

        vec2 mouseWorld = (uMouse - 0.5) * vec2(34.0, 22.0);
        float mouseDistance = distance(pos.xy, mouseWorld);
        float mouseGlow = smoothstep(10.0, 0.0, mouseDistance);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (size + mouseGlow * 1.8) * uPixelRatio * (165.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        vColor = color;
        vAlpha = 0.28 + mouseGlow * 0.36 + smoothstep(34.0, 0.0, length(pos.xy)) * 0.16;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float distanceToCenter = length(gl_PointCoord - 0.5);
        if (distanceToCenter > 0.5) discard;

        float softEdge = smoothstep(0.5, 0.02, distanceToCenter);
        float core = smoothstep(0.15, 0.0, distanceToCenter) * 0.28;
        gl_FragColor = vec4(vColor, (softEdge * 0.5 + core) * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const veilGeometry = new THREE.PlaneGeometry(70, 44, 1, 1);
  const veilMaterial = new THREE.MeshBasicMaterial({
    color: 0x5f7dad,
    transparent: true,
    opacity: 0.035,
    depthWrite: false
  });
  const veil = new THREE.Mesh(veilGeometry, veilMaterial);
  veil.position.z = -12;
  scene.add(veil);

  const mouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);
  const clock = new THREE.Clock();

  window.addEventListener("pointermove", (event) => {
    targetMouse.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
  }, { passive: true });

  function render() {
    const time = clock.getElapsedTime();
    mouse.lerp(targetMouse, 0.045);

    material.uniforms.uTime.value = time;
    material.uniforms.uMouse.value = mouse;

    particles.rotation.y = time * 0.018 + (mouse.x - 0.5) * 0.08;
    particles.rotation.x = (mouse.y - 0.5) * 0.06;
    veil.rotation.z = Math.sin(time * 0.12) * 0.02;

    camera.position.x += ((mouse.x - 0.5) * 0.55 - camera.position.x) * 0.02;
    camera.position.y += ((mouse.y - 0.5) * 0.32 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    if (!prefersReducedMotion) requestAnimationFrame(render);
  }

  render();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}
