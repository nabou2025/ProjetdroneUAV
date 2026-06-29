"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Box as BoxIcon } from "lucide-react";

type Drone3DViewerByUrlProps = {
  url: string | null;       // URL d'un fichier .stl (ex: généré par le backend)
  height?: number;
  placeholderSeed?: number; // si pas d'URL, on génère une forme procédurale distincte par variante
};

/**
 * Variante de Drone3DViewer qui charge un modèle depuis une URL plutôt
 * qu'un fichier déposé par l'utilisateur. Utilisée pour afficher des
 * résultats déjà générés (ex. variantes d'optimisation côté backend).
 *
 * Tant qu'aucune URL réelle de fichier généré par le backend n'est
 * disponible, affiche une forme procédurale de type "bras de support
 * topologique" pour donner un aperçu visuel cohérent avec le rendu
 * Fusion 360 attendu (cf. maquette fournie), différente par variante
 * via `placeholderSeed`.
 */
export default function Drone3DViewerByUrl({ url, height = 220, placeholderSeed = 0 }: Drone3DViewerByUrlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const meshGroupRef = useRef<any>(null);
  const threeRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      scene.fog = new THREE.Fog(0x0b1a30, 300, 900);

      const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 5000);
      camera.position.set(140, 110, 140);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xbfdbfe, 0x0a1628, 0.65);
      scene.add(hemi);
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
      keyLight.position.set(120, 180, 100);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.5);
      fillLight.position.set(-140, 70, 50);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
      rimLight.position.set(-70, 40, -150);
      scene.add(rimLight);
      const ambient = new THREE.AmbientLight(0xffffff, 0.25);
      scene.add(ambient);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;
      controls.minDistance = 20;
      controls.maxDistance = 800;

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

      loadModel();
    }

    async function loadModel() {
      const { THREE } = threeRef.current;
      const scene = sceneRef.current;
      setLoading(true);
      setError(null);

      try {
        let object: any;

        if (url) {
          const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
          const loader = new STLLoader();
          const geometry = await loader.loadAsync(url);
          geometry.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            color: 0xa8b2c0, metalness: 0.55, roughness: 0.38,
          });
          object = new THREE.Mesh(geometry, material);
        } else {
          object = buildPlaceholderBracket(THREE, placeholderSeed);
        }

        if (disposed) return;

        const group = new THREE.Group();
        group.add(object);

        const box = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        group.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 110;
        const scale = targetSize / maxDim;
        group.scale.setScalar(scale);

        if (meshGroupRef.current) scene.remove(meshGroupRef.current);
        scene.add(group);
        meshGroupRef.current = group;

        setLoading(false);
      } catch (e: any) {
        if (!disposed) {
          setError("Aperçu indisponible pour cette variante.");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      disposed = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      rendererRef.current?.dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, placeholderSeed]);

  return (
    <div style={{
      position: "relative", width: "100%", height,
      borderRadius: 10, overflow: "hidden",
      background: "linear-gradient(160deg, #0e1f3d 0%, #0a1628 65%, #081120 100%)",
    }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {loading && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(10,22,40,0.55)", color: "#93c5fd", fontSize: 12,
        }}>
          Chargement…
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 6, color: "#94a3b8", fontSize: 11.5, textAlign: "center", padding: 12,
        }}>
          <BoxIcon size={20} />
          {error}
        </div>
      )}
    </div>
  );
}

// Forme procédurale de type "support en L topologique" — sert uniquement
// de représentation visuelle tant qu'aucun fichier STL réel généré par le
// backend n'est disponible pour cette variante. Variée via `seed` pour
// que chaque carte de résultat ait une silhouette distincte.
function buildPlaceholderBracket(THREE: any, seed: number) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xa8b2c0, metalness: 0.6, roughness: 0.35,
  });

  const armLen = 55 + (seed % 3) * 8;
  const armRadius = 9 - (seed % 4) * 0.8;
  const curveOffset = 18 + (seed % 5) * 4;

  // bras principal courbé (tube le long d'une courbe, façon bracket)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-armLen / 2, 0, 0),
    new THREE.Vector3(-armLen / 4, curveOffset * 0.4, 0),
    new THREE.Vector3(0, curveOffset, 0),
    new THREE.Vector3(armLen / 3, curveOffset * 0.7, 0),
    new THREE.Vector3(armLen / 2, 0, 0),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 32, armRadius, 12, false);
  const tube = new THREE.Mesh(tubeGeo, material);
  group.add(tube);

  // œillets de fixation aux extrémités (trous façon support mécanique)
  [-armLen / 2, armLen / 2].forEach((x, i) => {
    const torusGeo = new THREE.TorusGeometry(armRadius * 1.6, armRadius * 0.5, 12, 24);
    const torus = new THREE.Mesh(torusGeo, material);
    torus.position.set(x, 0, 0);
    torus.rotation.x = Math.PI / 2;
    group.add(torus);
  });

  // nervures de renfort (look "optimisation topologique" avec matière retirée)
  const ribCount = 2 + (seed % 3);
  for (let i = 0; i < ribCount; i++) {
    const t = (i + 1) / (ribCount + 1);
    const p = curve.getPoint(t);
    const ribGeo = new THREE.BoxGeometry(armRadius * 0.6, curveOffset * 0.5, armRadius * 2.2);
    const rib = new THREE.Mesh(ribGeo, material);
    rib.position.set(p.x, p.y - curveOffset * 0.25, 0);
    group.add(rib);
  }

  return group;
}