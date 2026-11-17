"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// A helix of nodes, one per job. The active node grows and turns amber.
export default function Scene({ count, active }) {
  const mount = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const el = mount.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const INK = 0x12202f, COBALT = 0x2f5bff, AMBER = 0xffb547;
    const group = new THREE.Group();
    scene.add(group);

    const pts = Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0 : i / (count - 1);
      return new THREE.Vector3(Math.sin(t * Math.PI * 1.6) * 2.4, (0.5 - t) * 6.4, Math.cos(t * Math.PI * 1.6) * 2.4);
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(160)),
      new THREE.LineBasicMaterial({ color: COBALT })
    );
    group.add(line);

    const nodes = pts.map((p) => {
      const g = new THREE.Group();
      g.position.copy(p);
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.5, 1),
        new THREE.MeshBasicMaterial({ color: INK, wireframe: true })
      );
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.22, 0),
        new THREE.MeshBasicMaterial({ color: COBALT })
      );
      g.add(shell, core);
      group.add(g);
      return { g, shell, core };
    });

    const dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(Array.from({ length: 900 }, () => (Math.random() - 0.5) * 14)), 3)
      ),
      new THREE.PointsMaterial({ color: INK, size: 0.03, transparent: true, opacity: 0.35 })
    );
    scene.add(dust);

    const pointer = { x: 0, y: 0 };
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf;
    const tick = () => {
      if (!reduce) group.rotation.y += 0.004;
      group.rotation.x += (pointer.y * 0.25 - group.rotation.x) * 0.05;
      dust.rotation.y = group.rotation.y * 0.3;
      nodes.forEach((n, i) => {
        const on = activeRef.current === i;
        const s = on ? 1.7 : 1;
        n.g.scale.setScalar(n.g.scale.x + (s - n.g.scale.x) * 0.12);
        n.core.material.color.setHex(on ? AMBER : COBALT);
        n.shell.rotation.y += on ? 0.03 : 0.005;
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [count]);

  return <div ref={mount} className="scene" aria-hidden="true" />;
}
