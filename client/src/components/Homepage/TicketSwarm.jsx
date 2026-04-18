// TicketSwarm.jsx
import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance, Text } from '@react-three/drei';

// Awwwards-level aesthetics demand category color coding
const TICKET_COLORS = {
  concert: "#DC3558", // Brand Red
  sports: "#1D4ED8",  // Blue
  movie: "#F59E0B",   // Amber
  standup: "#A855F7"  // Purple
};

const TICKET_TYPES = Object.keys(TICKET_COLORS);

// Define a simple ticket shape (rounded rectangle with a "punch" effect)
const createTicketGeometry = () => {
  const shape = new THREE.Shape();
  const width = 0.5, height = 0.8, radius = 0.05, punchR = 0.08;
  
  // Rounded rectangle
  shape.moveTo(-width/2 + radius, -height/2);
  shape.lineTo(width/2 - radius, -height/2);
  shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
  
  // Side punch cut-out
  shape.lineTo(width/2, -punchR);
  shape.absarc(width/2, 0, punchR, Math.PI / 2, -Math.PI / 2, true);
  shape.lineTo(width/2, height/2 - radius);
  
  shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
  shape.lineTo(-width/2 + radius, height/2);
  shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
  shape.lineTo(-width/2, radius + punchR);
  
  //shape.absarc(-width/2, 0, punchR, Math.PI / 2, -Math.PI / 2, false); // optional other side punch
  shape.lineTo(-width/2, -height/2 + radius);
  shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);

  return new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false });
};

function TicketInstance({ count }) {
  const ref = useRef();
  
  // Generate random data once for performance
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const type = TICKET_TYPES[Math.floor(Math.random() * TICKET_TYPES.length)];
      temp.push({
        type,
        color: TICKET_COLORS[type],
        // Position them in a sphere *around* the center text
        position: new THREE.Vector3().setFromSphericalCoords(
          2.5 + Math.random() * 4, // radius
          Math.random() * Math.PI * 2, // phi
          Math.random() * Math.PI * 2 // theta
        ),
        // Rotation speeds
        rotationSpeed: new THREE.Euler(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
        // Translation speeds (floating effect)
        velocity: new THREE.Vector3( (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01)
      });
    }
    return temp;
  }, [count]);

  const geometry = useMemo(() => createTicketGeometry(), []);

  useFrame((state, delta) => {
    // Animation logic loop
    if (!ref.current) return;
    
    // Slightly move the whole container based on mouse position
    const mouseX = state.mouse.x * 0.2;
    const mouseY = state.mouse.y * 0.2;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, mouseY, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouseX, 0.1);

    // Update individual instances (R3F Instances component handles this efficiently)
    // For raw Three.js optimization we'd use useFrame to update matrices directly, 
    // but d3ei Instances is simpler for this example.
  });

  return (
    <group ref={ref}>
      {particles.map((data, i) => (
        <TicketParticle key={i} data={data} />
      ))}
    </group>
  );
}

// Separate component for easier Framer Motion style management if needed later
function TicketParticle({ data }) {
  const meshRef = useRef();

  useFrame(() => {
    if(!meshRef.current) return;
    // Apply continuous rotation and slight float velocity
    meshRef.current.rotation.x += data.rotationSpeed.x;
    meshRef.current.rotation.y += data.rotationSpeed.y;
    meshRef.current.position.add(data.velocity);
    
    // Optionally: Keep particles within bounds by wrapping position
  });

  return (
    <mesh
      ref={meshRef}
      position={data.position}
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
    >
      <boxGeometry args={[0.5, 0.8, 0.01]} /> {/* Placeholder shape for performance in example */}
      <meshStandardMaterial color={data.color} metalness={0.6} roughness={0.2} emissive={data.color} emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function TicketSwarmScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, -10, -10]} intensity={0.5} color="white" />
      <TicketInstance count={120} />
    </>
  );
}