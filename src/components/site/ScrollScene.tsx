import { useEffect, useRef } from "react";

/**
 * Fixed WebGL backdrop: a cloud of particles that morphs between
 * architectural forms as the page scrolls —
 *   monolith → dome → twisting tower → blueprint grid → halo.
 * Scroll speed scatters the particles; the pointer tilts the scene.
 */

const SHAPES = 5;

function monolith(n: number, out: Float32Array) {
  const w = 1.05,
    h = 2.5,
    d = 1.05;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let x: number, y: number, z: number;
    if (r < 0.28) {
      // edges — gives the volume a crisp silhouette
      const e = Math.floor(Math.random() * 12);
      const t = Math.random() * 2 - 1;
      const sx = e & 1 ? 1 : -1,
        sy = e & 2 ? 1 : -1;
      if (e < 4) [x, y, z] = [t * w, sx * h, sy * d];
      else if (e < 8) [x, y, z] = [sx * w, t * h, sy * d];
      else [x, y, z] = [sx * w, sy * h, t * d];
    } else {
      const face = Math.floor(Math.random() * 6);
      const a = Math.random() * 2 - 1,
        b = Math.random() * 2 - 1;
      if (face < 2) [x, y, z] = [face ? w : -w, a * h, b * d];
      else if (face < 4) [x, y, z] = [a * w, face === 2 ? h : -h, b * d];
      else [x, y, z] = [a * w, b * h, face === 4 ? d : -d];
    }
    out.set([x * 0.5, y * 0.5, z * 0.5], i * 3);
  }
}

function dome(n: number, out: Float32Array) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    if (i % 5 === 0) {
      // floor ring
      const a = Math.random() * Math.PI * 2;
      const rr = 1.55 + Math.random() * 0.35;
      out.set([Math.cos(a) * rr, -0.55, Math.sin(a) * rr], i * 3);
      continue;
    }
    const y = 1 - (i / (n - 1)) * 1.02; // upper hemisphere
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    out.set([Math.cos(th) * r * 1.45, y * 1.45 - 0.55, Math.sin(th) * r * 1.45], i * 3);
  }
}

function tower(n: number, out: Float32Array) {
  const floors = 26;
  for (let i = 0; i < n; i++) {
    const f = Math.floor(Math.random() * floors);
    const y = (f / (floors - 1)) * 3.1 - 1.55;
    const twist = (f / floors) * Math.PI * 0.9;
    const side = Math.floor(Math.random() * 4);
    const t = Math.random() * 2 - 1;
    const s = 0.62 - (f / floors) * 0.12;
    let lx = 0,
      lz = 0;
    if (side === 0) [lx, lz] = [t * s, s];
    else if (side === 1) [lx, lz] = [t * s, -s];
    else if (side === 2) [lx, lz] = [s, t * s];
    else [lx, lz] = [-s, t * s];
    const c = Math.cos(twist),
      sn = Math.sin(twist);
    out.set([lx * c - lz * sn, y + (Math.random() - 0.5) * 0.02, lx * sn + lz * c], i * 3);
  }
}

function grid(n: number, out: Float32Array) {
  const size = 3.4,
    lines = 18;
  for (let i = 0; i < n; i++) {
    const t = Math.random() * 2 - 1;
    const k = Math.floor(Math.random() * lines);
    const v = (k / (lines - 1)) * 2 - 1;
    let x: number,
      z: number,
      y = 0;
    const r = Math.random();
    if (r < 0.38) [x, z] = [t * size * 0.5, v * size * 0.5];
    else if (r < 0.76) [x, z] = [v * size * 0.5, t * size * 0.5];
    else {
      // raised walls of a floor plan
      const walls: [number, number, number, number][] = [
        [-1, -0.8, 1, -0.8],
        [-1, 0.8, 1, 0.8],
        [-1, -0.8, -1, 0.8],
        [1, -0.8, 1, 0.8],
        [0, -0.8, 0, 0.8],
        [-1, 0.05, 1, 0.05],
      ];
      const [x1, z1, x2, z2] = walls[Math.floor(Math.random() * walls.length)]!;
      const u = Math.random();
      x = x1 + (x2 - x1) * u;
      z = z1 + (z2 - z1) * u;
      y = Math.random() * 0.35;
    }
    out.set([x, y - 0.35, z], i * 3);
  }
}

function halo(n: number, out: Float32Array) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 2;
    const R = 1.35,
      r = 0.08 + Math.random() * 0.1;
    const ring = i % 3;
    const RR = ring === 0 ? R : ring === 1 ? R * 0.7 : R * 1.25;
    out.set(
      [
        (RR + r * Math.cos(b)) * Math.cos(a),
        r * Math.sin(b) * (ring === 2 ? 3 : 1),
        (RR + r * Math.cos(b)) * Math.sin(a),
      ],
      i * 3,
    );
  }
}

const vertex = /* glsl */ `
  attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3; attribute vec3 aP4;
  attribute vec3 aRand;
  uniform float uProgress; uniform float uTime; uniform float uVelocity;
  uniform float uPixelRatio; uniform float uSize;
  varying float vMix; varying float vAlpha;

  vec3 pick(float i) {
    if (i < 0.5) return aP0;
    if (i < 1.5) return aP1;
    if (i < 2.5) return aP2;
    if (i < 3.5) return aP3;
    return aP4;
  }

  void main() {
    float p = clamp(uProgress, 0.0, 3.9999);
    float seg = floor(p);
    float t = p - seg;
    float delay = aRand.x * 0.45;
    float lt = smoothstep(delay, delay + 0.55, t);
    vec3 a = pick(seg);
    vec3 b = pick(seg + 1.0);
    vec3 pos = mix(a, b, lt);

    // swirl while in transit
    float transit = sin(lt * 3.14159);
    vec3 dir = normalize(aRand - 0.5 + 0.0001);
    pos += dir * transit * (0.55 + aRand.y * 0.6);
    pos += vec3(
      sin(uTime * 0.6 + aRand.x * 40.0),
      cos(uTime * 0.5 + aRand.y * 40.0),
      sin(uTime * 0.4 + aRand.z * 40.0)
    ) * (0.012 + transit * 0.05);

    // scroll speed scatters
    pos += dir * uVelocity * (0.2 + aRand.z * 0.9);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.45 + aRand.y * 0.9) * (1.0 + transit * 0.6);
    gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);

    vMix = step(0.9, aRand.z);
    vAlpha = 0.35 + aRand.x * 0.55;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA; uniform vec3 uColorB; uniform float uOpacity;
  varying float vMix; varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a * vAlpha * uOpacity);
  }
`;

export function ScrollScene() {
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.innerWidth < 768;
      const count = mobile ? 5000 : 11000;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        return; // no WebGL — the page still works without the backdrop
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 50);
      const fitCamera = () => {
        const aspect = el.clientWidth / el.clientHeight;
        // pull back on tall/narrow screens so the forms fit the width
        camera.position.set(0, 0, 6.2 * Math.pow(Math.max(1, 0.95 / aspect), 0.85));
      };
      fitCamera();

      const geo = new THREE.BufferGeometry();
      const makers = [monolith, dome, tower, grid, halo];
      for (let s = 0; s < SHAPES; s++) {
        const arr = new Float32Array(count * 3);
        makers[s]!(count, arr);
        geo.setAttribute(`aP${s}`, new THREE.BufferAttribute(arr, 3));
      }
      geo.setAttribute("position", geo.getAttribute("aP0"));
      const rand = new Float32Array(count * 3);
      for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

      const uniforms = {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uPixelRatio: { value: dpr },
        uSize: { value: mobile ? 2.6 : 2.2 },
        uOpacity: { value: 0 },
        uColorA: { value: new THREE.Color("#e5e5e0") },
        uColorB: { value: new THREE.Color("#d8ab6a") },
      };
      const mat = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      const group = new THREE.Group();
      group.add(points);
      scene.add(group);

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      let progress = 0;
      let lastScroll = window.scrollY;
      let velocity = 0;
      let raf = 0;
      let running = true;
      let last = performance.now();

      // Sections can pin a shape with data-scene="<0..4>"; the scene eases
      // between them based on where the viewport centre sits. Pages without
      // markers fall back to overall page progress.
      let anchors: { y: number; v: number }[] = [];
      let measuredAt = 0;
      const measure = () => {
        anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
          .map((el) => {
            const r = el.getBoundingClientRect();
            const top = r.top + window.scrollY;
            return {
              y: top + Math.min(r.height, window.innerHeight) * 0.5,
              v: Number(el.dataset["scene"]),
            };
          })
          .filter((a) => Number.isFinite(a.v))
          .sort((a, b) => a.y - b.y);
        measuredAt = performance.now();
      };
      const target = () => {
        if (performance.now() - measuredAt > 800) measure();
        if (anchors.length < 2) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          return max > 0 ? (window.scrollY / max) * (SHAPES - 1) : 0;
        }
        const c = window.scrollY + window.innerHeight * 0.5;
        if (c <= anchors[0]!.y) return anchors[0]!.v;
        for (let i = 1; i < anchors.length; i++) {
          const a = anchors[i - 1]!,
            b = anchors[i]!;
          if (c <= b.y) {
            const t = (c - a.y) / Math.max(1, b.y - a.y);
            const e = t * t * (3 - 2 * t);
            return a.v + (b.v - a.v) * e;
          }
        }
        return anchors[anchors.length - 1]!.v;
      };
      progress = target();

      const onMove = (e: PointerEvent) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        fitCamera();
        renderer.setSize(el.clientWidth, el.clientHeight);
      };
      const onVis = () => {
        running = !document.hidden;
        if (running && !reduce) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      };

      const render = (dt: number) => {
        const tgt = target();
        progress += (tgt - progress) * Math.min(1, dt * 4);
        const sy = window.scrollY;
        const dv = Math.min(Math.abs(sy - lastScroll) / Math.max(dt, 0.001) / 4000, 1);
        lastScroll = sy;
        velocity += (dv - velocity) * Math.min(1, dt * 5);
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);

        uniforms.uProgress.value = progress;
        uniforms.uVelocity.value = velocity;
        uniforms.uOpacity.value += (1 - uniforms.uOpacity.value) * Math.min(1, dt * 1.2);

        const heroOffset = window.innerWidth >= 1024 ? 1.35 : 0;
        group.position.x = heroOffset * Math.max(0, 1 - progress * 1.4);
        group.rotation.y = uniforms.uTime.value * 0.08 + progress * 1.1 + mouse.x * 0.35;
        group.rotation.x = 0.18 + mouse.y * 0.18;
        // tilt the blueprint grid toward the viewer
        const g = Math.max(0, 1 - Math.abs(progress - 3));
        group.rotation.x += g * 0.45;
        renderer.render(scene, camera);
      };

      const tick = () => {
        if (!running) return;
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        uniforms.uTime.value += dt;
        render(dt);
        raf = requestAnimationFrame(tick);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVis);

      let onStaticScroll: (() => void) | null = null;
      if (reduce) {
        uniforms.uOpacity.value = 1;
        const once = () => render(1);
        onStaticScroll = once;
        window.addEventListener("scroll", once, { passive: true });
        once();
      } else {
        raf = requestAnimationFrame(tick);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVis);
        if (onStaticScroll) window.removeEventListener("scroll", onStaticScroll);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full [&>canvas]:h-full [&>canvas]:w-full"
    />
  );
}
