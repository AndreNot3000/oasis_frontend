'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Clean, balanced, high-realism Three.js 3D Hero Scene matching the "House of Attractions"
 * composition:
 *  - Left side of canvas kept completely clear so the "OASIS OF ATTRACTIONS" headline
 *    and dual CTA buttons have 100% clean negative space.
 *  - Right-center focal point: Realistic 3D Aerial Swing Ride with PBR brushed steel &
 *    chrome reflections, 6 well-spaced radial truss arms, S-curve hangers, and glossy
 *    crimson clearcoat twin coaster seats.
 *  - Directly overhead: Flush concentric emerald & cyan neon ceiling cove rings + soft
 *    starry ceiling field & subtle upper-right moon.
 *  - Viewport edges: The signature magenta-to-cyan 3D sphere on the right, warm amber
 *    sphere at the bottom edge, and dark matte sphere at top-left.
 */
export function Hero3dCanvas({ spinBoost = false }: { spinBoost?: boolean }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const boostRef = useRef<boolean>(spinBoost);

  useEffect(() => {
    boostRef.current = spinBoost;
  }, [spinBoost]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || 720;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 140);
    camera.position.set(0, 0.05, 10.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // -------------------------------------------------------------
    // 1. Procedural PBR Reflection Environment
    // -------------------------------------------------------------
    const pmremGenerator = track(new THREE.PMREMGenerator(renderer));
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x070814);

    const envStripGeo = new THREE.PlaneGeometry(10, 2);
    const addEnvPanel = (
      colorHex: number,
      pos: [number, number, number],
      look: [number, number, number],
    ) => {
      const m = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(envStripGeo, m);
      mesh.position.set(...pos);
      mesh.lookAt(...look);
      envScene.add(mesh);
    };
    addEnvPanel(0x00ffaa, [2, 8, -2], [0, 0, 0]);
    addEnvPanel(0xff1e9b, [-6, 3, 5], [0, 0, 0]);
    addEnvPanel(0x00f0ff, [8, 2, 4], [0, 0, 0]);
    addEnvPanel(0xffffff, [0, 4, 8], [0, 0, 0]);

    const envRenderTarget = track(pmremGenerator.fromScene(envScene, 0.04));
    scene.environment = envRenderTarget.texture;
    envStripGeo.dispose();

    // -------------------------------------------------------------
    // 2. Balanced Scene Lighting
    // -------------------------------------------------------------
    const hemiLight = new THREE.HemisphereLight(0x5b3ff8, 0x080a18, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.PointLight(0xff3b9a, 9.0, 28);
    keyLight.position.set(-0.5, 3.2, 6.2);
    scene.add(keyLight);

    const cyanRightLight = new THREE.PointLight(0x00f0ff, 8.0, 28);
    cyanRightLight.position.set(5.2, 1.8, 5.5);
    scene.add(cyanRightLight);

    const emeraldCeilingLight = new THREE.PointLight(0x00ffaa, 5.5, 18);
    emeraldCeilingLight.position.set(1.5, 3.2, 0.5);
    scene.add(emeraldCeilingLight);

    // -------------------------------------------------------------
    // 3. PBR Materials
    // -------------------------------------------------------------
    const chromeMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        metalness: 0.96,
        roughness: 0.07,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.7,
      }),
    );

    const brushedSteelMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
        envMapIntensity: 1.35,
      }),
    );

    const darkTitaniumMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x1a1d30,
        metalness: 0.8,
        roughness: 0.3,
        envMapIntensity: 1.2,
      }),
    );

    const fiberglassSeatMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xc81458,
        emissive: 0x2b0314,
        emissiveIntensity: 0.32,
        metalness: 0.16,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.5,
      }),
    );

    const harnessPadMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x161722,
        metalness: 0.15,
        roughness: 0.55,
      }),
    );

    const neonEmeraldMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x34f5c5,
        emissive: 0x00ffaa,
        emissiveIntensity: 2.2,
        roughness: 0.15,
      }),
    );

    const neonCyanMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x00e5ff,
        emissiveIntensity: 2.0,
        roughness: 0.15,
      }),
    );

    const neonMagentaMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xff2a85,
        emissive: 0xff1e80,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      }),
    );

    // -------------------------------------------------------------
    // 4. Unified Right-Center Focal Point: 3D Aerial Swing Ride + Flush Ceiling Halo
    //    Positioned at x = +1.35 so the left headline area is 100% unobstructed!
    // -------------------------------------------------------------
    const rideGroup = new THREE.Group();
    rideGroup.position.set(1.35, -0.1, -0.65);
    scene.add(rideGroup);

    // 4A. Sleek Vertical Tower Column (tucked slightly back at x = -0.35 relative to rideGroup)
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-0.35, -0.5, -0.8);
    rideGroup.add(towerGroup);

    const coreColumnGeo = track(new THREE.CylinderGeometry(0.26, 0.34, 6.4, 32));
    towerGroup.add(new THREE.Mesh(coreColumnGeo, darkTitaniumMat));

    const guideRailGeo = track(new THREE.CylinderGeometry(0.022, 0.022, 6.2, 12));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rail = new THREE.Mesh(guideRailGeo, brushedSteelMat);
      rail.position.set(Math.cos(a) * 0.31, 0, Math.sin(a) * 0.31);
      towerGroup.add(rail);
    }

    const collarFlangeGeo = track(new THREE.CylinderGeometry(0.38, 0.38, 0.07, 24));
    for (const yPos of [-1.8, -0.4, 1.0, 2.1]) {
      const flange = new THREE.Mesh(collarFlangeGeo, brushedSteelMat);
      flange.position.y = yPos;
      towerGroup.add(flange);
    }

    // 4B. Realistic 3D Architectural Neon Ceiling Rings (See-Through to the Starry Sky!)
    const ceilingHaloGroup = new THREE.Group();
    ceilingHaloGroup.position.set(-0.2, 2.68, -0.75);
    ceilingHaloGroup.rotation.x = Math.PI / 2.08;
    ceilingHaloGroup.rotation.y = -0.06;
    rideGroup.add(ceilingHaloGroup);

    const haloGlowEmeraldMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      }),
    );
    const haloGlowCyanMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      }),
    );

    const ringRadii = [2.38, 1.76, 1.18];
    ringRadii.forEach((radius, idx) => {
      // Upper brushed-titanium structural ring housing
      const housingGeo = track(new THREE.TorusGeometry(radius, 0.042, 20, 96));
      const housingMesh = new THREE.Mesh(housingGeo, brushedSteelMat);
      housingMesh.position.z = -0.035;
      ceilingHaloGroup.add(housingMesh);

      // Glowing neon diffuser tube tucked underneath the housing
      const neonGeo = track(new THREE.TorusGeometry(radius, 0.024, 16, 96));
      const neonMesh = new THREE.Mesh(
        neonGeo,
        idx % 2 === 0 ? neonEmeraldMat : neonCyanMat,
      );
      neonMesh.position.z = 0.01;
      ceilingHaloGroup.add(neonMesh);

      // Soft volumetric outer bloom halo around the neon tube
      const bloomGeo = track(new THREE.TorusGeometry(radius, 0.085, 16, 96));
      const bloomMesh = new THREE.Mesh(
        bloomGeo,
        idx % 2 === 0 ? haloGlowEmeraldMat : haloGlowCyanMat,
      );
      bloomMesh.position.z = 0.01;
      ceilingHaloGroup.add(bloomMesh);
    });

    // 8 radial brushed-steel suspension spokes connecting the 3 concentric ceiling rings
    const spokeStrutGeo = track(new THREE.CylinderGeometry(0.016, 0.016, 1.2, 10));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rMid = 1.78;
      const spoke = new THREE.Mesh(spokeStrutGeo, chromeMat);
      spoke.position.set(Math.cos(a) * rMid, Math.sin(a) * rMid, -0.035);
      spoke.rotation.z = a + Math.PI / 2;
      ceilingHaloGroup.add(spoke);
    }

    // 4C. Rotating Upper Carousel Hub & 6 Well-Spaced Radial Boom Arms
    const carouselHead = new THREE.Group();
    carouselHead.position.set(-0.35, 2.15, -0.8);
    carouselHead.rotation.z = -0.05;
    carouselHead.rotation.x = 0.08;
    rideGroup.add(carouselHead);

    const gearboxGeo = track(new THREE.CylinderGeometry(0.62, 0.48, 0.38, 32));
    carouselHead.add(new THREE.Mesh(gearboxGeo, brushedSteelMat));

    const hubRimGeo = track(new THREE.TorusGeometry(0.92, 0.04, 16, 64));
    const hubRim = new THREE.Mesh(hubRimGeo, chromeMat);
    hubRim.rotation.x = Math.PI / 2;
    hubRim.position.y = 0.14;
    carouselHead.add(hubRim);

    // Sculpted Twin Bucket Seat Builder (Glossy Clearcoat Fiberglass + Harnesses + Back Cutouts)
    const seatBackGeo = track(new THREE.BoxGeometry(0.3, 0.52, 0.09));
    const seatSideBolsterGeo = track(new THREE.BoxGeometry(0.065, 0.44, 0.22));
    const seatPanGeo = track(new THREE.BoxGeometry(0.3, 0.08, 0.3));
    const headrestGeo = track(new THREE.BoxGeometry(0.2, 0.15, 0.08));
    const backHoleRimGeo = track(new THREE.TorusGeometry(0.05, 0.014, 12, 24));
    const harnessStrapGeo = track(new THREE.TorusGeometry(0.1, 0.025, 10, 24, Math.PI));

    const buildSingleBucketSeat = () => {
      const seat = new THREE.Group();

      const back = new THREE.Mesh(seatBackGeo, fiberglassSeatMat);
      back.position.set(0, 0.05, -0.1);
      back.rotation.x = -0.1;
      seat.add(back);

      for (const holeX of [-0.07, 0.07]) {
        const rim = new THREE.Mesh(backHoleRimGeo, chromeMat);
        rim.position.set(holeX, 0.07, -0.15);
        seat.add(rim);
      }

      for (const sideX of [-0.14, 0.14]) {
        const bolster = new THREE.Mesh(seatSideBolsterGeo, fiberglassSeatMat);
        bolster.position.set(sideX, 0.02, -0.02);
        seat.add(bolster);
      }

      const pan = new THREE.Mesh(seatPanGeo, fiberglassSeatMat);
      pan.position.set(0, -0.19, 0.02);
      seat.add(pan);

      const headPad = new THREE.Mesh(headrestGeo, harnessPadMat);
      headPad.position.set(0, 0.23, -0.05);
      seat.add(headPad);

      for (const strapX of [-0.06, 0.06]) {
        const otsr = new THREE.Mesh(harnessStrapGeo, harnessPadMat);
        otsr.position.set(strapX, 0.13, 0.02);
        otsr.rotation.x = Math.PI / 2.2;
        otsr.rotation.y = Math.PI / 2;
        seat.add(otsr);
      }

      return seat;
    };

    const sCurvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.38, 0.07),
      new THREE.Vector3(0, -0.82, -0.12),
      new THREE.Vector3(0, -1.24, 0.02),
    ];
    const sCurvePath = new THREE.CatmullRomCurve3(sCurvePoints);
    const sHangerGeo = track(new THREE.TubeGeometry(sCurvePath, 24, 0.028, 12, false));
    const spreaderBarGeo = track(new THREE.CylinderGeometry(0.024, 0.024, 0.76, 12));

    const boomSparGeo = track(new THREE.CylinderGeometry(0.03, 0.038, 2.05, 12));
    const hydraulicStrutGeo = track(new THREE.CylinderGeometry(0.022, 0.022, 1.25, 10));
    const underArmLedGeo = track(new THREE.BoxGeometry(1.8, 0.018, 0.032));
    const clevisGeo = track(new THREE.CylinderGeometry(0.065, 0.065, 0.1, 16));

    const swingHinges: THREE.Group[] = [];
    const numArms = 6;

    for (let i = 0; i < numArms; i++) {
      const angle = (i / numArms) * Math.PI * 2;
      const armPivot = new THREE.Group();
      armPivot.rotation.y = angle;

      for (const zOff of [-0.075, 0.075]) {
        const spar = new THREE.Mesh(boomSparGeo, brushedSteelMat);
        spar.rotation.z = Math.PI / 2;
        spar.position.set(1.08, 0.1, zOff);
        armPivot.add(spar);
      }

      const strut = new THREE.Mesh(hydraulicStrutGeo, chromeMat);
      strut.position.set(0.85, -0.16, 0);
      strut.rotation.z = 1.12;
      armPivot.add(strut);

      const armLed = new THREE.Mesh(
        underArmLedGeo,
        i % 2 === 0 ? neonMagentaMat : neonCyanMat,
      );
      armLed.position.set(1.1, 0.05, 0);
      armPivot.add(armLed);

      const clevis = new THREE.Mesh(clevisGeo, chromeMat);
      clevis.position.set(2.08, 0.1, 0);
      armPivot.add(clevis);

      const swingHinge = new THREE.Group();
      swingHinge.position.set(2.08, 0.06, 0);
      swingHinge.rotation.z = 0.24;

      const hanger = new THREE.Mesh(sHangerGeo, darkTitaniumMat);
      swingHinge.add(hanger);

      const twinCarriage = new THREE.Group();
      twinCarriage.position.set(0, -1.26, 0);
      twinCarriage.rotation.y = Math.PI / 2;

      const spreader = new THREE.Mesh(spreaderBarGeo, chromeMat);
      spreader.rotation.z = Math.PI / 2;
      spreader.position.set(0, 0.25, -0.04);
      twinCarriage.add(spreader);

      const leftSeat = buildSingleBucketSeat();
      leftSeat.position.set(-0.19, 0, 0);
      twinCarriage.add(leftSeat);

      const rightSeat = buildSingleBucketSeat();
      rightSeat.position.set(0.19, 0, 0);
      twinCarriage.add(rightSeat);

      swingHinge.add(twinCarriage);
      armPivot.add(swingHinge);
      carouselHead.add(armPivot);
      swingHinges.push(swingHinge);
    }

    // -------------------------------------------------------------
    // 5. Realistic Full-Ceiling Starry Night Sky & 3D Cratered Moon
    // -------------------------------------------------------------
    const skyGroup = new THREE.Group();
    skyGroup.position.set(0, 0, 0);
    scene.add(skyGroup);

    // 5A. Realistic 3D Cratered Moon with Lunar Mare Shader & Corona Halo
    const moonGroup = new THREE.Group();
    moonGroup.position.set(3.85, 2.95, -2.2);
    skyGroup.add(moonGroup);

    const moonGeo = track(new THREE.SphereGeometry(0.32, 48, 48));
    const moonMat = track(
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPos;
          float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
          }
          float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                  mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                  mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
          }
          void main() {
            float n = noise(vPos * 9.5) * 0.55 + noise(vPos * 22.0) * 0.3 + noise(vPos * 45.0) * 0.15;
            vec3 highland = vec3(0.92, 0.94, 0.98);
            vec3 mare = vec3(0.55, 0.60, 0.68);
            vec3 surface = mix(mare, highland, smoothstep(0.38, 0.68, n));
            vec3 lightDir = normalize(vec3(-0.55, 0.45, 0.85));
            float diff = smoothstep(-0.25, 0.85, dot(vNormal, lightDir));
            float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
            vec3 earthshine = vec3(0.16, 0.22, 0.35);
            vec3 col = mix(earthshine, surface, diff) + rim * vec3(0.75, 0.88, 1.0) * 0.35;
            gl_FragColor = vec4(col, 0.98);
          }
        `,
        transparent: true,
      }),
    );
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    // Soft Lunar Atmospheric Glow Halo
    const moonHaloGeo = track(new THREE.PlaneGeometry(1.45, 1.45));
    const moonHaloMat = track(
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            float d = length(vUv - vec2(0.5)) * 2.0;
            float glow = exp(-d * d * 4.5) * 0.38;
            gl_FragColor = vec4(0.75, 0.88, 1.0, glow);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const moonHalo = new THREE.Mesh(moonHaloGeo, moonHaloMat);
    moonHalo.position.z = -0.05;
    moonGroup.add(moonHalo);

    // 5B. Full-Ceiling Planetarium Starfield (950+ Optical GLSL Stars Across the Top Sky)
    const starCount = 950;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);

    const stellarPalette = [
      new THREE.Color('#ffffff'), // Pure white
      new THREE.Color('#cce8ff'), // Sirius blue-white
      new THREE.Color('#ffe9be'), // Capella warm gold-white
      new THREE.Color('#a6e3ff'), // Vega icy cyan-white
      new THREE.Color('#ffd6ef'), // Soft rose-white
    ];

    for (let i = 0; i < starCount; i++) {
      // Spread across the entire upper ceiling sky ( denser near the very top )
      const u = Math.random();
      const v = Math.pow(Math.random(), 0.65); // biases stars toward the top edge of the page
      starPositions[i * 3] = (u - 0.5) * 18.5;
      starPositions[i * 3 + 1] = 0.65 + v * 3.85;
      starPositions[i * 3 + 2] = -1.4 - Math.random() * 3.4;

      const c =
        stellarPalette[Math.floor(Math.random() * stellarPalette.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;

      // Power-law star magnitudes: many fine stars + ~50 bright twinkling beacon stars
      const magRoll = Math.random();
      if (magRoll > 0.95) {
        starSizes[i] = 26.0 + Math.random() * 18.0; // Bright diffraction-spike stars
      } else if (magRoll > 0.75) {
        starSizes[i] = 13.0 + Math.random() * 9.0; // Medium constellation stars
      } else {
        starSizes[i] = 5.5 + Math.random() * 6.5; // Fine background milky-way stars
      }

      starPhases[i] = Math.random() * Math.PI * 20.0;
    }

    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));

    const starMat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: {
            value: Math.min(window.devicePixelRatio || 1, 2),
          },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uPixelRatio;
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aPhase;
          varying vec3 vColor;
          varying float vTwinkle;
          varying float vIsBright;
          void main() {
            vColor = aColor;
            float twinkleWave = sin(uTime * (1.8 + mod(aPhase, 2.4)) + aPhase);
            vTwinkle = 0.72 + 0.28 * twinkleWave;
            vIsBright = step(22.0, aSize);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uPixelRatio * (0.82 + 0.24 * twinkleWave) * (6.5 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vTwinkle;
          varying float vIsBright;
          void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float d = length(uv) * 2.0;
            if (d > 1.0) discard;

            // Intense pinpoint stellar core + soft exponential atmospheric halo
            float core = exp(-d * d * 18.0);
            float halo = exp(-d * d * 4.2) * 0.45;

            // 4-point optical diffraction glint on bright stars
            float spikeX = exp(-abs(uv.y) * 28.0) * exp(-abs(uv.x) * 4.5);
            float spikeY = exp(-abs(uv.x) * 28.0) * exp(-abs(uv.y) * 4.5);
            float spikes = (spikeX + spikeY) * 0.65 * vIsBright;

            float alpha = clamp((core + halo + spikes) * vTwinkle, 0.0, 1.0);
            vec3 finalCol = mix(vColor, vec3(1.0), core * 0.75);
            gl_FragColor = vec4(finalCol, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const domeStars = new THREE.Points(starGeo, starMat);
    skyGroup.add(domeStars);

    // -------------------------------------------------------------
    // 6. Photorealistic 3D Inflated Helium Balloons (Teardrop Latex Profile,
    //    Subsurface Scattering, Studio Softbox Reflections, Neck Knot & Curling Ribbon)
    // -------------------------------------------------------------
    const spheresGroup = new THREE.Group();
    scene.add(spheresGroup);

    // Sculpt a realistic inflated teardrop balloon geometry (taut dome + tapered lower pinch)
    const createInflatedBalloonGeo = (radius: number) => {
      const geo = track(new THREE.SphereGeometry(radius, 96, 96));
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const ny = v.y / radius; // -1 to +1
        if (ny < 0) {
          // Taper the lower half into a classic inflated balloon pear shape
          const t = -ny; // 0 at equator -> 1 at bottom pole
          const horizontalPinch = 1.0 - 0.16 * Math.pow(t, 1.55);
          const verticalStretch = 1.0 + 0.11 * Math.pow(t, 1.25);
          v.x *= horizontalPinch;
          v.z *= horizontalPinch;
          v.y *= verticalStretch;
        } else {
          // Slight taut helium expansion in the upper crown
          const crownSwell = 1.0 + 0.03 * Math.sin(ny * Math.PI);
          v.x *= crownSwell;
          v.z *= crownSwell;
        }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
    };

    // Photorealistic Latex & Pearl Clearcoat Balloon Shader
    const createBalloonShaderMat = (
      colorA: string,
      colorB: string,
      rimTint: string,
      opacityVal = 0.96,
      gradientAngle = 0.0,
    ) =>
      track(
        new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color(colorA) },
            uColorB: { value: new THREE.Color(colorB) },
            uRimTint: { value: new THREE.Color(rimTint) },
            uOpacity: { value: opacityVal },
            uGradAngle: { value: gradientAngle },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPos;
            varying vec3 vViewPos;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPos = position;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPos = -mvPosition.xyz;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform vec3 uRimTint;
            uniform float uOpacity;
            uniform float uGradAngle;
            varying vec3 vNormal;
            varying vec3 vPos;
            varying vec3 vViewPos;

            void main() {
              vec3 N = normalize(vNormal);
              vec3 V = normalize(vViewPos);

              // Smooth ombré pigment blend across the inflated balloon body
              vec2 rotDir = vec2(cos(uGradAngle), sin(uGradAngle));
              float gradCoord = dot(normalize(vPos.xy + vec2(0.0001)), rotDir) * 0.5 + 0.5;
              float heightCoord = smoothstep(-1.2, 1.2, vPos.y);
              float mixFactor = clamp(mix(gradCoord, heightCoord, 0.35), 0.0, 1.0);
              vec3 basePigment = mix(uColorA, uColorB, mixFactor);

              // Primary studio key light (upper-left front) & warm/neon fill lights
              vec3 keyLight = normalize(vec3(-0.58, 0.68, 0.85));
              vec3 rimLight = normalize(vec3(0.75, -0.35, -0.45));
              vec3 topLight = normalize(vec3(0.0, 1.0, 0.25));

              // 1. 3D Spherical Half-Lambert Diffuse + Deep Curvature Terminator Shadow
              float ndotl = dot(N, keyLight);
              float diffuse = smoothstep(-0.35, 0.95, ndotl);
              float shadowDepth = mix(0.22, 1.0, diffuse);

              // 2. Latex Subsurface Scattering (SSS: translucent internal glow where rubber is stretched thin)
              float stretchThinness = smoothstep(-1.05, 0.35, vPos.y); // thicker/darker near bottom knot
              float backScatter = pow(clamp(dot(V, -keyLight) * 0.5 + 0.5, 0.0, 1.0), 2.4);
              float centerTranslucency = pow(clamp(dot(N, V), 0.0, 1.0), 1.4) * smoothstep(-0.1, 0.85, ndotl);
              vec3 sssColor = mix(uColorA, vec3(1.0, 0.85, 0.95), 0.45) * (0.32 * centerTranslucency + 0.22 * backScatter) * stretchThinness;

              // 3. Pearlescent Fresnel Sheen along grazing curvature edges
              float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
              vec3 pearlRim = uRimTint * fresnel * 0.72;

              // 4. Dual Studio Softbox Clearcoat Reflections (Curved Window Highlight + Pinpoint Glint)
              vec3 H1 = normalize(keyLight + V);
              float specPrimary = pow(max(dot(N, H1), 0.0), 96.0);
              float softboxWindow = smoothstep(0.962, 0.992, dot(N, H1)) * 0.85;

              // Secondary subtle studio fill reflection on lower-right curve
              vec3 H2 = normalize(rimLight + V);
              float specSecondary = pow(max(dot(N, H2), 0.0), 42.0) * 0.35;

              // Top ceiling ring reflection arc
              vec3 HTop = normalize(topLight + V);
              float specTopArc = pow(max(dot(N, HTop), 0.0), 64.0) * 0.28;

              // Combine 3D volume shading, subsurface latex glow, pearl rim, and glossy clearcoat highlights
              vec3 shadedLatex = basePigment * shadowDepth + sssColor + pearlRim;
              vec3 clearcoatHighlights = vec3(1.0) * (softboxWindow + specPrimary * 0.55 + specTopArc) + uRimTint * specSecondary;
              vec3 finalColor = shadedLatex + clearcoatHighlights;

              // Subtle optical translucency (slightly more opaque at grazing Fresnel edges and near the neck)
              float alpha = clamp(uOpacity * (0.86 + 0.14 * fresnel), 0.0, 1.0);
              gl_FragColor = vec4(finalColor, alpha);
            }
          `,
          transparent: true,
        }),
      );

    // Helper to assemble a complete 3D Balloon (Inflated Body + Neck + Rolled Lip + Curling Silk Ribbon)
    const buildCompleteBalloon = (
      radius: number,
      mat: THREE.ShaderMaterial,
      includeKnotAndRibbon = true,
    ) => {
      const group = new THREE.Group();
      const bodyGeo = createInflatedBalloonGeo(radius);
      const bodyMesh = new THREE.Mesh(bodyGeo, mat);
      group.add(bodyMesh);

      if (includeKnotAndRibbon) {
        const bottomY = -radius * 1.1;

        // Tied knot & flared neck cone
        const neckGeo = track(
          new THREE.ConeGeometry(radius * 0.095, radius * 0.12, 32),
        );
        const neckMesh = new THREE.Mesh(neckGeo, mat);
        neckMesh.position.y = bottomY - radius * 0.03;
        group.add(neckMesh);

        // Rolled rubber lip ring
        const lipGeo = track(
          new THREE.TorusGeometry(radius * 0.075, radius * 0.024, 16, 32),
        );
        const lipMesh = new THREE.Mesh(lipGeo, mat);
        lipMesh.rotation.x = Math.PI / 2;
        lipMesh.position.y = bottomY - radius * 0.085;
        group.add(lipMesh);

        // Delicate curling metallic silk ribbon hanging from the balloon knot
        const ribbonCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, bottomY - radius * 0.09, 0),
          new THREE.Vector3(radius * 0.06, bottomY - radius * 0.38, radius * 0.04),
          new THREE.Vector3(-radius * 0.08, bottomY - radius * 0.72, -radius * 0.03),
          new THREE.Vector3(radius * 0.05, bottomY - radius * 1.08, radius * 0.05),
          new THREE.Vector3(-radius * 0.04, bottomY - radius * 1.42, 0),
        ]);
        const ribbonGeo = track(
          new THREE.TubeGeometry(ribbonCurve, 32, radius * 0.009, 8, false),
        );
        const ribbonMesh = new THREE.Mesh(ribbonGeo, chromeMat);
        group.add(ribbonMesh);
      }

      return group;
    };

    // 6A. Right-Edge Hero Balloon (Vibrant Magenta-to-Cyan Pearl Latex with Knot & Curling Ribbon)
    const rightSphereMat = createBalloonShaderMat(
      '#ff1493',
      '#00e5ff',
      '#a5f3fc',
      0.97,
      0.25,
    );
    const rightSphere = buildCompleteBalloon(1.32, rightSphereMat, true);
    rightSphere.position.set(4.75, 0.28, 1.65);
    rightSphere.rotation.z = 0.08;
    spheresGroup.add(rightSphere);

    // 6B. Bottom-Right Foreground Translucent Pearl-Violet Balloon (Replaces flat CSS circle)
    const bottomRightBalloonMat = createBalloonShaderMat(
      '#4f46e5',
      '#ec4899',
      '#67e8f9',
      0.78,
      0.8,
    );
    const bottomRightBalloon = buildCompleteBalloon(
      1.48,
      bottomRightBalloonMat,
      false,
    );
    bottomRightBalloon.position.set(4.55, -2.55, 2.05);
    spheresGroup.add(bottomRightBalloon);

    // 6C. Bottom-Center Warm Golden-Amber Latex Balloon (peeking from bottom edge)
    const bottomSphereMat = createBalloonShaderMat(
      '#ff4500',
      '#ffcc00',
      '#fef08a',
      0.96,
      1.4,
    );
    const bottomSphere = buildCompleteBalloon(0.86, bottomSphereMat, false);
    bottomSphere.position.set(-0.2, -3.55, 2.1);
    spheresGroup.add(bottomSphere);

    // 6D. Top-Left Satin Obsidian-Graphite Pearl Balloon (cropped in upper-left corner)
    const topLeftSphereMat = createBalloonShaderMat(
      '#111322',
      '#2e334d',
      '#94a3b8',
      0.96,
      -0.6,
    );
    const topLeftSphere = buildCompleteBalloon(1.08, topLeftSphereMat, true);
    topLeftSphere.position.set(-5.65, 3.02, 0.4);
    topLeftSphere.rotation.z = -0.12;
    spheresGroup.add(topLeftSphere);

    // -------------------------------------------------------------
    // 7. Responsive 3D Layout (Mobile Top-Showcase vs Desktop Right-Showcase)
    // -------------------------------------------------------------
    let isMobileView = width < 768;
    let rightSphereBaseY = 0.28;
    let topLeftSphereBaseY = 3.02;

    const applyResponsiveLayout = (w: number, h: number) => {
      isMobileView = w < 768;
      if (isMobileView) {
        // Mobile Portrait: Center the 3D Swing Ride + Neon Rings in the UPPER half
        // so the bottom half of the screen is 100% clean for the organized text block
        rideGroup.position.set(0.24, 1.35, -0.75);
        rideGroup.scale.setScalar(0.64);

        skyGroup.position.set(0, 0.25, 0);
        moonGroup.position.set(1.35, 3.15, -2.0);
        moonGroup.scale.setScalar(0.8);

        rightSphereBaseY = 1.95;
        rightSphere.position.set(2.05, rightSphereBaseY, 0.8);
        rightSphere.scale.setScalar(0.42);

        bottomRightBalloon.visible = false;
        bottomSphere.visible = false;

        topLeftSphereBaseY = 3.25;
        topLeftSphere.position.set(-2.1, topLeftSphereBaseY, 0.2);
        topLeftSphere.scale.setScalar(0.48);
      } else {
        // Desktop / Tablet: Ride shifted right (x = 1.85) & slightly up, text lower-left
        rideGroup.position.set(1.85, 0.08, -0.65);
        rideGroup.scale.setScalar(1.0);

        skyGroup.position.set(0, 0, 0);
        moonGroup.position.set(3.95, 2.85, -2.1);
        moonGroup.scale.setScalar(1.0);

        rightSphereBaseY = 0.28;
        rightSphere.position.set(4.75, rightSphereBaseY, 1.65);
        rightSphere.scale.setScalar(1.0);

        bottomRightBalloon.visible = true;
        bottomSphere.visible = true;

        topLeftSphereBaseY = 3.02;
        topLeftSphere.position.set(-5.65, topLeftSphereBaseY, 0.4);
        topLeftSphere.scale.setScalar(1.0);
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    applyResponsiveLayout(width, height);

    // -------------------------------------------------------------
    // 8. Smooth Pointer Parallax & Animation Loop
    // -------------------------------------------------------------
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = x * 0.38;
      targetY = y * 0.2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const clock = new THREE.Clock();
    let frameId = 0;
    let currentSwingAngle = 0.24;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      rightSphereMat.uniforms.uTime.value = elapsed;
      bottomRightBalloonMat.uniforms.uTime.value = elapsed;
      bottomSphereMat.uniforms.uTime.value = elapsed;
      topLeftSphereMat.uniforms.uTime.value = elapsed;
      starMat.uniforms.uTime.value = elapsed;

      if (!prefersReducedMotion) {
        const speedMultiplier = boostRef.current ? 2.2 : 1.0;
        const targetSwing = boostRef.current ? 0.42 : 0.24;
        currentSwingAngle += (targetSwing - currentSwingAngle) * 0.04;

        carouselHead.rotation.y += 0.009 * speedMultiplier;

        swingHinges.forEach((hinge, idx) => {
          hinge.rotation.z =
            currentSwingAngle + Math.sin(elapsed * 1.9 + idx * 1.04) * 0.03;
        });

        // Buoyant helium bobbing + gentle rotational sway
        rightSphere.position.y = rightSphereBaseY + Math.sin(elapsed * 1.15) * 0.09;
        rightSphere.rotation.z = 0.08 + Math.sin(elapsed * 0.9) * 0.04;

        bottomRightBalloon.position.y = -2.55 + Math.cos(elapsed * 1.05) * 0.07;
        bottomRightBalloon.rotation.z = -0.05 + Math.cos(elapsed * 0.85) * 0.03;

        bottomSphere.position.y = -3.55 + Math.cos(elapsed * 1.3) * 0.06;
        bottomSphere.rotation.z = Math.sin(elapsed * 1.1) * 0.03;

        topLeftSphere.position.y = topLeftSphereBaseY + Math.sin(elapsed * 1.0) * 0.06;
        topLeftSphere.rotation.z = -0.12 + Math.cos(elapsed * 0.95) * 0.035;

        ceilingHaloGroup.rotation.z -= 0.0015;
        domeStars.position.x = Math.sin(elapsed * 0.08) * 0.15;
        moonMesh.rotation.y = elapsed * 0.04;

        camera.position.x += (targetX - camera.position.x) * 0.045;
        camera.position.y += (0.05 + targetY - camera.position.y) * 0.045;
        camera.lookAt(isMobileView ? 0 : 0.2, 0.05, -0.5);
      }

      renderer.render(scene, camera);
      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(animate);
      }
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 720;
      applyResponsiveLayout(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-label="Interactive 3D Oasis Aerial Swing Ride and Neon Ceiling"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
    />
  );
}
