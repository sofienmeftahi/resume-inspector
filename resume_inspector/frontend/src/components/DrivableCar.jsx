import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";

function Car() {
  const carRef = useRef();
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(0);
  
  // Keyboard controls
  const [, get] = useKeyboardControls();
  
  useFrame((state, delta) => {
    const { forward, backward, left, right } = get();
    
    // Handle movement
    if (forward) {
      setSpeed(prev => Math.min(prev + 0.1, 2));
    } else if (backward) {
      setSpeed(prev => Math.max(prev - 0.1, -1));
    } else {
      setSpeed(prev => prev * 0.95); // Friction
    }
    
    // Handle rotation
    if (left) {
      setRotation(prev => prev + 0.05);
    }
    if (right) {
      setRotation(prev => prev - 0.05);
    }
    
    // Update position based on speed and rotation
    const newX = position[0] + Math.sin(rotation) * speed * delta;
    const newZ = position[2] + Math.cos(rotation) * speed * delta;
    
    setPosition([newX, 0, newZ]);
    
    // Update car mesh
    if (carRef.current) {
      carRef.current.position.set(newX, 0, newZ);
      carRef.current.rotation.y = rotation;
    }
  });
  
  return (
    <group ref={carRef}>
      {/* Car body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 0.5, 4]} />
        <meshStandardMaterial color="#ff4444" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 1.25, -0.5]}>
        <boxGeometry args={[1.5, 0.5, 2]} />
        <meshStandardMaterial color="#ff4444" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.8, 0.3, 1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.8, 0.3, 1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.8, 0.3, -1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.8, 0.3, -1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0, 0.5, 2.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default Car; 