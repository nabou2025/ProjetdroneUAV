'use client'

export default function DroneSVG() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '520px',
        height: 'auto',
        zIndex: 2,
        opacity: 0.9,
      }}
    >
      <img
        src="/drone.png"
        alt="Drone UAV"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          animation: 'spinDrone 20s linear infinite',
        }}
      />
    </div>
  )
}
