"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, Box as BoxIcon, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type Drone3DViewerProps = {
  file: File | null;
  height?: number;
};

/**
 * Viewer 3D minimal basé sur Three.js (chargé dynamiquement côté client).
 * Charge un fichier STL ou OBJ déposé par l'utilisateur et l'affiche avec
 * une rotation orbitale à la souris + contrôles zoom/reset/fullscreen.
 *
 * On utilise three.js "pur" + les loaders officiels (STLLoader/OBJLoader)
 * plutôt que react-three-fiber, pour garder l'empreinte la plus légère
 * possible pour un composant unique d'aperçu.
 */
export default function Drone3DViewer({ file, height = 360 }: Drone3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const meshGroupRef = useRef<any>(null);
  const threeRef = useRef<any>(null); // module THREE chargé dynamiquement
  const animFrameRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Initialisation de la scène (une seule fois) ──
  useEffect(() => {
    let disposed = false;

    async function init() {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed || !containerRef.current) return;

      threeRef.current = { THREE, OrbitControls };

      const container = containerRef.current;
      const width = container.clientWidth;
      const h = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b1a30);
      scene.fog = new THREE.Fog(0x0b1a30, 400, 1100);

      const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 5000);
      camera.position.set(180, 140, 180);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // Éclairage — plus travaillé pour un rendu "premium" : lumière clé,
      // lumière de remplissage douce, contre-jour bleuté pour le contour,
      // et une lumière d'appoint pour adoucir les ombres dures.
      const hemi = new THREE.HemisphereLight(0xbfdbfe, 0x0a1628, 0.65);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
      keyLight.position.set(140, 220, 120);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
      fillLight.position.set(-160, 80, 60);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
      rimLight.position.set(-80, 40, -180);
      scene.add(rimLight);

      const ambient = new THREE.AmbientLight(0xffffff, 0.25);
      scene.add(ambient);

      // Grille de sol discrète, façon "plan technique"
      const grid = new THREE.GridHelper(400, 20, 0x1e3a5f, 0x152238);
      (grid.material as any).opacity = 0.4;
      (grid.material as any).transparent = true;
      scene.add(grid);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 20;
      controls.maxDistance = 1200;

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      controlsRef.current = controls;

      const animate = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    init();

    return () => {
      disposed = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose?.();
    };
  }, []);

  // ── Redimensionnement réactif (ex: passage en fullscreen) ──
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, h);
    };
    window.addEventListener("resize", handleResize);
    // léger délai pour laisser le DOM se stabiliser après toggle fullscreen
    const t = setTimeout(handleResize, 60);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
  }, [isFullscreen]);

  // ── Chargement du fichier déposé par l'utilisateur ──
  useEffect(() => {
    if (!file || !threeRef.current || !sceneRef.current) return;

    let disposed = false;
    setLoading(true);
    setError(null);

    async function loadFile() {
      const { THREE } = threeRef.current;
      const scene = sceneRef.current;

      // Nettoyer le précédent modèle
      if (meshGroupRef.current) {
        scene.remove(meshGroupRef.current);
        meshGroupRef.current = null;
      }

      const ext = file!.name.split(".").pop()?.toLowerCase();
      const url = URL.createObjectURL(file!);

      try {
        let object: any;

        if (ext === "stl") {
          const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
          const loader = new STLLoader();
          const geometry = await loader.loadAsync(url);
          geometry.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            color: 0xa8b2c0, metalness: 0.55, roughness: 0.38,
            envMapIntensity: 1,
          });
          object = new THREE.Mesh(geometry, material);
          object.castShadow = true;
        } else if (ext === "obj") {
          const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
          const loader = new OBJLoader();
          object = await loader.loadAsync(url);
          object.traverse((child: any) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xa8b2c0, metalness: 0.55, roughness: 0.38,
                envMapIntensity: 1,
              });
            }
          });
        } else {
          throw new Error(`Format ".${ext}" non pris en charge pour l'aperçu (STL ou OBJ uniquement).`);
        }

        if (disposed) return;

        // Centrer et mettre à l'échelle pour que le modèle remplisse bien le cadre
        const group = new THREE.Group();
        group.add(object);

        const box = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        group.position.sub(center); // centre le modèle sur l'origine

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 160;
        const scale = targetSize / maxDim;
        group.scale.setScalar(scale);

        scene.add(group);
        meshGroupRef.current = group;

        // Cadrer la caméra sur le modèle
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(targetSize * 1.3, targetSize * 1.0, targetSize * 1.3);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }

        setLoading(false);
      } catch (e: any) {
        if (!disposed) {
          setError(e?.message || "Impossible de charger ce fichier pour l'aperçu 3D.");
          setLoading(false);
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    loadFile();
    return () => { disposed = true; };
  }, [file]);

  // ── Contrôles UI ──
  const zoom = useCallback((factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const dir = new (threeRef.current.THREE.Vector3)().subVectors(camera.position, controls.target);
    dir.multiplyScalar(factor);
    camera.position.copy(controls.target).add(dir);
  }, []);

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(180, 140, 180);
    controls.target.set(0, 0, 0);
    controls.update();
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(f => !f);
  }, []);

  const btnStyle: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 8, border: "none",
    background: "rgba(15,17,23,0.65)", color: "#cbd5e1",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", backdropFilter: "blur(4px)",
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 1000 : undefined,
        width: "100%",
        height: isFullscreen ? "100vh" : height,
        borderRadius: isFullscreen ? 0 : 14,
        overflow: "hidden",
        background: "linear-gradient(160deg, #0e1f3d 0%, #0a1628 65%, #081120 100%)",
        border: isFullscreen ? "none" : "1px solid rgba(148,163,184,0.18)",
        boxShadow: isFullscreen ? "none" : "0 8px 24px -8px rgba(15,23,42,0.35), inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Badge format */}
      {file && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "3px 9px", borderRadius: 6,
          background: "rgba(15,17,23,0.65)", color: "#93c5fd",
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          backdropFilter: "blur(4px)",
        }}>
          {file.name.split(".").pop()?.toUpperCase()}
        </div>
      )}

      {/* État vide */}
      {!file && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 14, pointerEvents: "none",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BoxIcon size={24} color="#64748b" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
              Aucun modèle chargé
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
              Importez un fichier pour voir l'aperçu 3D
            </div>
          </div>
        </div>
      )}

      {/* Chargement */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(10,22,40,0.6)", color: "#93c5fd", fontSize: 13,
        }}>
          Chargement du modèle…
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(10,22,40,0.85)", color: "#fca5a5", fontSize: 13,
          textAlign: "center", padding: 24,
        }}>
          {error}
        </div>
      )}

      {/* Contrôles */}
      {file && !error && (
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          display: "flex", gap: 8,
        }}>
          <button onClick={resetView} style={btnStyle} title="Réinitialiser la vue">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => zoom(0.8)} style={btnStyle} title="Zoomer">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => zoom(1.25)} style={btnStyle} title="Dézoomer">
            <ZoomOut size={16} />
          </button>
          <button onClick={toggleFullscreen} style={btnStyle} title="Plein écran">
            <Maximize2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}