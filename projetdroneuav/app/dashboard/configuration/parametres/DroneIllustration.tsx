"use client";

import React from "react";

type DroneIllustrationProps = {
  typeDrone: string;        // "tri" | "quad" | "hexa" | "octo" (ou un nombre direct via nbBras)
  nbBras?: number;          // optionnel : force le nombre de bras (sinon dérivé de typeDrone)
  materiau?: string;        // id matériau : "alu" | "carbone" | "titane" | "pla"
  size?: number;            // taille du SVG (carré)
  animateRotors?: boolean;  // légère pulsation des hélices au survol/au chargement
};

const BRAS_PAR_TYPE: Record<string, number> = {
  tri: 3, quad: 4, hexa: 6, octo: 8,
};

// Couleurs indicatives par matériau — purement visuelles, pour donner
// un feedback cohérent avec le choix fait dans "MATÉRIAU DE LA PIÈCE".
const MATERIAL_COLORS: Record<string, { body: string; accent: string }> = {
  alu:     { body: "#9aa5b1", accent: "#cbd5e1" }, // Aluminium 6061
  carbone: { body: "#2a2f3a", accent: "#4b5563" }, // Fibre de carbone
  titane:  { body: "#8b8378", accent: "#c2b8a3" }, // Titane Ti-6Al-4V
  pla:     { body: "#3b82f6", accent: "#93c5fd" }, // PLA
};

export default function DroneIllustration({
  typeDrone,
  nbBras: nbBrasOverride,
  materiau = "carbone",
  size = 260,
  animateRotors = true,
}: DroneIllustrationProps) {
  const nbBras = nbBrasOverride ?? BRAS_PAR_TYPE[typeDrone] ?? 4;
  const colors = MATERIAL_COLORS[materiau] ?? MATERIAL_COLORS["carbone"];
  const cx = size / 2;
  const cy = size / 2;

  const armLength = size * 0.34;
  const hubRadius = size * 0.11;
  const motorRadius = size * 0.052;
  const rotorRadius = size * 0.082;

  const angles = Array.from({ length: nbBras }, (_, i) => {
    // on démarre à 45° pour un look "X" plutôt que "+" sur les configs à 4 bras,
    // et on répartit uniformément pour les autres
    const offset = nbBras === 4 ? 45 : 90 / nbBras;
    return offset + (360 / nbBras) * i;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="hubGradient" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor={colors.accent} />
          <stop offset="100%" stopColor={colors.body} />
        </radialGradient>
        <radialGradient id="motorGradient" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e2235" />
        </radialGradient>
      </defs>

      {/* halo léger derrière le drone */}
      <circle cx={cx} cy={cy} r={size * 0.42} fill="#3b82f6" opacity={0.04} />

      {/* bras + moteurs + hélices */}
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const ex = cx + Math.cos(rad) * armLength;
        const ey = cy + Math.sin(rad) * armLength;

        return (
          <g key={i}>
            {/* bras */}
            <line
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={colors.body}
              strokeWidth={size * 0.028}
              strokeLinecap="round"
            />
            <line
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={colors.accent}
              strokeWidth={size * 0.01}
              strokeLinecap="round"
              opacity={0.5}
            />

            {/* hélice (rotor) — légèrement derrière le moteur */}
            <g
              style={
                animateRotors
                  ? {
                      transformOrigin: `${ex}px ${ey}px`,
                      animation: `spin-rotor-${i % 2} 0.45s linear infinite`,
                    }
                  : undefined
              }
            >
              <ellipse cx={ex} cy={ey} rx={rotorRadius} ry={rotorRadius * 0.32}
                fill="#94a3b8" opacity={0.35} />
              <ellipse cx={ex} cy={ey} rx={rotorRadius * 0.32} ry={rotorRadius}
                fill="#94a3b8" opacity={0.35} />
            </g>

            {/* moteur */}
            <circle cx={ex} cy={ey} r={motorRadius} fill="url(#motorGradient)" stroke="#0f1117" strokeWidth={1.5} />
            <circle cx={ex} cy={ey} r={motorRadius * 0.4} fill="#0f1117" />
          </g>
        );
      })}

      {/* hub central */}
      <rect
        x={cx - hubRadius} y={cy - hubRadius}
        width={hubRadius * 2} height={hubRadius * 2}
        rx={hubRadius * 0.35}
        fill="url(#hubGradient)"
        stroke="#0f1117"
        strokeWidth={1.5}
      />
      {/* vis de fixation décoratives */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <circle
          key={i}
          cx={cx + sx * hubRadius * 0.55}
          cy={cy + sy * hubRadius * 0.55}
          r={hubRadius * 0.09}
          fill="#0f1117"
          opacity={0.6}
        />
      ))}
      {/* LED centrale */}
      <circle cx={cx} cy={cy} r={hubRadius * 0.18} fill="#3b82f6">
        <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
      </circle>

      <style>{`
        @keyframes spin-rotor-0 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-rotor-1 {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
      `}</style>
    </svg>
  );
}