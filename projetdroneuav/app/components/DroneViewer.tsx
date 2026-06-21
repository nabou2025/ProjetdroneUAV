'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  nbBras: number;
  optimized: boolean;
}

export default function DroneViewer({ nbBras, optimized }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth || 400, mountRef.current.clientHeight || 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lumières
    scene.add(new THREE.AmbientLight(0x404040, 2));
    const dir = new THREE.DirectionalLight(0x1DDB7A, 3);
    dir.position.set(5, 5, 5);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0x7c3aed, 2);
    dir2.position.set(-5, -3, -5);
    scene.add(dir2);

    // Grille
    scene.add(new THREE.GridHelper(8, 12, 0x1a2236, 0x1a2236));

    const bodyColor  = optimized ? 0x1DDB7A : 0x334155;
    const armColor   = optimized ? 0x7c3aed : 0x1e2d47;
    const motorColor = optimized ? 0xa78bfa : 0x334155;

    // Corps central
    const bodyGeo = new THREE.CylinderGeometry(
      optimized ? 0.22 : 0.32,
      optimized ? 0.22 : 0.32,
      optimized ? 0.1 : 0.18, 16
    );
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ color: bodyColor, wireframe: optimized }));
    scene.add(body);

    // Bras + moteurs + hélices
    for (let i = 0; i < nbBras; i++) {
      const angle = (i / nbBras) * Math.PI * 2;
      const armLen = optimized ? 1.0 : 1.3;
      const armW   = optimized ? 0.04 : 0.09;

      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(armLen, armW, armW),
        new THREE.MeshPhongMaterial({ color: armColor })
      );
      arm.position.x = Math.cos(angle) * armLen / 2;
      arm.position.z = Math.sin(angle) * armLen / 2;
      arm.rotation.y = -angle;
      scene.add(arm);

      // Nervures si optimisé
      if (optimized) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.09, 0.3),
          new THREE.MeshPhongMaterial({ color: 0x1DDB7A, transparent: true, opacity: 0.5 })
        );
        rib.position.x = Math.cos(angle) * armLen / 2;
        rib.position.z = Math.sin(angle) * armLen / 2;
        scene.add(rib);
      }

      // Moteur
      const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.09, 16),
        new THREE.MeshPhongMaterial({ color: motorColor })
      );
      motor.position.x = Math.cos(angle) * armLen;
      motor.position.z = Math.sin(angle) * armLen;
      scene.add(motor);

      // Hélices
      const prop = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.01, 0.07),
        new THREE.MeshPhongMaterial({ color: optimized ? 0x7c3aed : 0x475569, transparent: true, opacity: 0.75 })
      );
      prop.position.x = Math.cos(angle) * armLen;
      prop.position.y = 0.09;
      prop.position.z = Math.sin(angle) * armLen;
      scene.add(prop);
    }

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      scene.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [nbBras, optimized]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}