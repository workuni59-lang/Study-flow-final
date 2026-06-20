import { useEffect, useRef } from 'react';
import { WALLPAPERS, type ParticleCategory } from '../../lib/gamification';
import { PARTICLE_PRESETS, type ParticlePreset } from '../../lib/particlePresets';
import { useStudy } from '../../context/StudyContext';

function createGlowTexture(THREE: any, size: number, type: 'circle' | 'sharp' | 'star') {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  if (type === 'star') {
    const core = ctx.createRadialGradient(c, c, 0, c, c, c * 0.15);
    core.addColorStop(0, 'rgba(255,255,255,1)');
    core.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, size, size);
    for (let a = 0; a < 4; a++) {
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(a * Math.PI / 2);
      const spike = ctx.createLinearGradient(0, 0, c * 0.65, 0);
      spike.addColorStop(0, 'rgba(255,255,255,0.7)');
      spike.addColorStop(0.5, 'rgba(255,255,255,0.08)');
      spike.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = spike;
      ctx.beginPath();
      ctx.moveTo(0, -c * 0.025);
      ctx.lineTo(c * 0.65, -c * 0.004);
      ctx.lineTo(c * 0.65, c * 0.004);
      ctx.lineTo(0, c * 0.025);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'sharp') {
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.05, 'rgba(255,255,255,0.8)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else {
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.1, 'rgba(255,255,255,0.7)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  const t = new THREE.CanvasTexture(canvas);
  t.needsUpdate = true;
  return t;
}

function getPresetForWallpaper(wallpaperId: string): { preset: ParticlePreset; category: ParticleCategory } {
  const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId);
  const category = wallpaper?.particleCategory || 'ember';
  return { preset: PARTICLE_PRESETS[category], category };
}

function getAcCent(): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim();
  return (!val || val === 'rgba(0, 0, 0, 0)') ? '#6366f1' : val;
}

function pickColor(colors: { r: number; g: number; b: number; weight: number }[], THREE: any) {
  let rnd = Math.random();
  for (const c of colors) {
    rnd -= c.weight;
    if (rnd <= 0) return new THREE.Color(c.r, c.g, c.b);
  }
  return new THREE.Color(colors[colors.length - 1].r, colors[colors.length - 1].g, colors[colors.length - 1].b);
}

function visibleHalfExtents(z: number, fov: number, aspect: number) {
  const h = z * Math.tan((fov / 2) * Math.PI / 180);
  return { hw: h * aspect, hh: h };
}

type ParticleSystem = ReturnType<typeof buildPointsSystem>;

function buildPointsSystem(THREE: any, preset: ParticlePreset, fov: number, aspect: number) {
  const isMobile = window.innerWidth < 768 || (navigator as any)?.hardwareConcurrency <= 4;
  const count = isMobile ? preset.mobileCount : preset.count;

  const glowTexture = createGlowTexture(THREE, 64, preset.textureType);

  const pos = new Float32Array(count * 3);
  const origPos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const baseSizes = new Float32Array(count);

  let placed = 0;
  const maxAttempts = count * 10;
  let attempts = 0;
  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const z = -(preset.depthMin + Math.random() * (preset.depthMax - preset.depthMin));
    const { hw, hh } = visibleHalfExtents(-z, fov, aspect);
    const margin = 0.85;
    const x = (Math.random() * 2 - 1) * hw * margin;
    const y = (Math.random() * 2 - 1) * hh * margin;

    const nx = x / hw;
    const ny = y / hh;
    const dist = Math.sqrt(nx * nx + ny * ny);

    let acceptProb = 1;
    if (dist < 0.25) acceptProb = 0.08;
    else if (dist < 0.4) acceptProb = 0.4;

    if (Math.random() > acceptProb) continue;

    const i = placed;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    origPos[i * 3] = x;
    origPos[i * 3 + 1] = y;
    origPos[i * 3 + 2] = z;

    const c = pickColor(preset.colorPalette, THREE);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    if (preset.warmAccentChance > 0 && preset.warmPalette && Math.random() < preset.warmAccentChance) {
      const wc = preset.warmPalette[Math.floor(Math.random() * preset.warmPalette.length)];
      colors[i * 3] = wc.r;
      colors[i * 3 + 1] = wc.g;
      colors[i * 3 + 2] = wc.b;
    }

    const depthRatio = 1 + (-z / 20);
    const sz = (preset.sizeMin + Math.random() * (preset.sizeMax - preset.sizeMin)) * depthRatio;
    baseSizes[i] = sz;
    phases[i] = Math.random() * Math.PI * 2;
    placed++;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const baseSize = preset.textureType === 'star' ? 0.9
    : preset.textureType === 'sharp' ? 1.6 : 2.5;

  const mat = new THREE.PointsMaterial({
    size: baseSize,
    map: glowTexture,
    vertexColors: true,
    transparent: true,
    opacity: preset.opacity,
    blending: preset.blendMode === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const mesh = new THREE.Points(geo, mat);

  return {
    mesh, geo, mat, glowTexture,
    placed, pos, origPos, phases, baseSizes,
  };
}


export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<any>(null);
  const { themeConfig } = useStudy();
  const wallpaperId = themeConfig.wallpaper;
  const particleMotion = themeConfig.particleMotion;

  useEffect(() => {
    let alive = true;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let fov = 60;
    let currentCategory: ParticleCategory = 'ember';
    let speedMul = particleMotion === 'static' ? 0 : 1;
    let system: ParticleSystem | null = null;
    let shootingStar: any = null;
    let lastShootingStar = performance.now();
    let nextShootingStar = 15000 + Math.random() * 15000;
    let mouseX = 0;
    let mouseY = 0;
    let frameTime = 0;

    (async () => {
      try {
        const THREE = await import('three');

        if (!alive) return;

        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current!,
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 0);

        function disposeCurrent() {
          if (system) {
            scene.remove(system.mesh);
            system.geo.dispose();
            system.mat.dispose();
            system.glowTexture.dispose();
            system = null;
          }
          if (shootingStar) {
            scene.remove(shootingStar.mesh);
            shootingStar.geo.dispose();
            shootingStar.mat.dispose();
            shootingStar = null;
          }
        }

        function buildParticles(wpId: string) {
          disposeCurrent();
          const aspect = window.innerWidth / window.innerHeight;
          const { preset, category } = getPresetForWallpaper(wpId);
          currentCategory = category;
          canvasRef.current?.setAttribute('data-particle-category', category);

          system = buildPointsSystem(THREE, preset, fov, aspect);
          scene.add(system.mesh);
          lastShootingStar = performance.now();
          nextShootingStar = 15000 + Math.random() * 15000;
        }

        buildParticles(wallpaperId);

        const onMouseMove = (e: MouseEvent) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouseMove);

        const onResize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        const animate = () => {
          if (!alive) return;
          requestAnimationFrame(animate);
          frameTime += 0.004;

          const sm = speedMul;

          if (system) {
            const pAttr = system.mesh.geometry.attributes.position as any;
            const arr = pAttr.array as Float32Array;

            for (let i = 0; i < system.placed; i++) {
              const i3 = i * 3;
              const ox = system.origPos[i3];
              const oy = system.origPos[i3 + 1];
              const oz = system.origPos[i3 + 2];
              const phase = system.phases[i];
              const drift = sm;
              const amp = system.baseSizes[i] * 8;
              const freq = currentCategory === 'space' ? 0.15 : 0.3;
              arr[i3] = ox + Math.sin(frameTime * freq + phase) * drift * amp * 0.02;
              arr[i3 + 1] = oy + Math.sin(frameTime * 0.5 + phase * 1.3) * drift * amp * 0.02;
              arr[i3 + 2] = oz + Math.sin(frameTime * 0.2 + phase * 0.7) * drift * 0.04;
            }
            pAttr.needsUpdate = true;
          }

          if (currentCategory === 'space' && sm > 0) {
            const now = performance.now();
            if (!shootingStar && now - lastShootingStar > nextShootingStar) {
              const side = Math.floor(Math.random() * 4);
              const z = -(2 + Math.random() * 8);
              const { hw, hh } = visibleHalfExtents(-z, fov, window.innerWidth / window.innerHeight);
              let sx: number, sy: number;
              switch (side) {
                case 0: sx = -hw * 1.1; sy = (Math.random() * 2 - 1) * hh * 0.6; break;
                case 1: sx = hw * 1.1; sy = (Math.random() * 2 - 1) * hh * 0.6; break;
                case 2: sx = (Math.random() * 2 - 1) * hw * 0.6; sy = hh * 1.1; break;
                default: sx = (Math.random() * 2 - 1) * hw * 0.6; sy = -hh * 1.1; break;
              }
              const dx = (Math.random() * 2 - 1) * hw * 0.5;
              const dy = (Math.random() * 2 - 1) * hh * 0.5;
              const ex = sx + dx;
              const ey = sy + dy;
              const trailLen = 30;
              const positions = new Float32Array(trailLen * 3);
              const colors = new Float32Array(trailLen * 3);
              for (let i = 0; i < trailLen; i++) {
                const seg = i / (trailLen - 1);
                positions[i * 3] = sx + dx * seg;
                positions[i * 3 + 1] = sy + dy * seg;
                positions[i * 3 + 2] = z;
                const fade = 1 - seg;
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
              }
              const sGeo = new THREE.BufferGeometry();
              sGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
              sGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
              const sMat = new THREE.PointsMaterial({
                size: 0.8, vertexColors: true, transparent: true, opacity: 1,
                blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
              });
              const sMesh = new THREE.Points(sGeo, sMat);
              scene.add(sMesh);
              shootingStar = {
                mesh: sMesh, geo: sGeo, mat: sMat,
                sx, sy, ex, ey, z, trailLen,
                life: 0, maxLife: 800,
              };
              lastShootingStar = now;
              nextShootingStar = 8000 + Math.random() * 12000;
            }
          }

          if (shootingStar) {
            shootingStar.life += 16;
            const t = shootingStar.life / shootingStar.maxLife;
            if (t >= 1) {
              scene.remove(shootingStar.mesh);
              shootingStar.geo.dispose();
              shootingStar.mat.dispose();
              shootingStar = null;
            } else {
              const dx = shootingStar.ex - shootingStar.sx;
              const dy = shootingStar.ey - shootingStar.sy;
              const p = shootingStar.mesh.geometry.attributes.position;
              const a = p.array as Float32Array;
              const c = shootingStar.mesh.geometry.attributes.color;
              const ca = c.array as Float32Array;
              for (let i = 0; i < shootingStar.trailLen; i++) {
                const seg = i / (shootingStar.trailLen - 1);
                const age = t - seg * 0.5;
                const clamped = Math.max(0, Math.min(1, age));
                a[i * 3] = shootingStar.sx + dx * clamped;
                a[i * 3 + 1] = shootingStar.sy + dy * clamped;
                const fade = Math.sin(clamped * Math.PI) * (1 - seg * 0.7);
                ca[i * 3] = fade;
                ca[i * 3 + 1] = fade;
                ca[i * 3 + 2] = fade;
              }
              p.needsUpdate = true;
              c.needsUpdate = true;
            }
          }

          if (system) {
            system.mesh.rotation.y += (mouseX * 0.002 - system.mesh.rotation.y) * 0.02;
            system.mesh.rotation.x += (mouseY * 0.001 - system.mesh.rotation.x) * 0.02;
          }

          renderer.render(scene, camera);
        };
        animate();

        threeRef.current = {
          buildParticles,
          get scene() { return scene; },
          get speedMul() { return speedMul; },
          set speedMul(v: number) { speedMul = v; },
        };
      } catch {
        // Three.js unavailable
      }
    })();

    return () => {
      alive = false;
      threeRef.current = null;
      if (renderer) renderer.dispose();
    };
  }, []);

  // Rebuild when wallpaper changes
  useEffect(() => {
    const engine = threeRef.current;
    if (!engine) return;
    engine.buildParticles(wallpaperId);
  }, [wallpaperId]);

  // Update speed multiplier when motion toggle changes
  useEffect(() => {
    const engine = threeRef.current;
    if (!engine) return;
    engine.speedMul = particleMotion === 'static' ? 0 : 1;
  }, [particleMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5, width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
