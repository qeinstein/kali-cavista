"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface AntigravityProps {
    count?: number;
    magnetRadius?: number;
    ringRadius?: number;
    waveSpeed?: number;
    waveAmplitude?: number;
    particleSize?: number;
    lerpSpeed?: number;
    color?: string;
    autoAnimate?: boolean;
    particleVariance?: number;
    rotationSpeed?: number;
    depthFactor?: number;
    pulseSpeed?: number;
    particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron';
    fieldStrength?: number;
}

const AntigravityInner: React.FC<AntigravityProps & { isHovered: boolean }> = ({
    count = 300,
    magnetRadius = 10,
    ringRadius = 10,
    waveSpeed = 0.4,
    waveAmplitude = 1,
    particleSize = 2,
    lerpSpeed = 0.1,
    color = '#2D6A4F', // Changed to match theme
    autoAnimate = false,
    particleVariance = 1,
    rotationSpeed = 0,
    depthFactor = 1,
    pulseSpeed = 3,
    particleShape = 'capsule',
    fieldStrength = 10,
    isHovered
}) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { viewport } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const lastMousePos = useRef({ x: 0, y: 0 });
    const lastMouseMoveTime = useRef(0);
    const virtualMouse = useRef({ x: 0, y: 0 });

    const particles = useMemo(() => {
        const temp = [];
        const width = viewport.width || 100;
        const height = viewport.height || 100;
        const maxDist = Math.sqrt(width * width + height * height) / 2;

        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;

            // Spatial distribution: Cluster in the center
            const angle = Math.random() * Math.PI * 2;
            // Use power of random to bias towards center (0)
            const rFactor = Math.pow(Math.random(), 1.5);
            const r = rFactor * maxDist;

            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const z = (Math.random() - 0.5) * 20;

            const randomRadiusOffset = (Math.random() - 0.5) * 2;

            temp.push({
                t,
                factor,
                speed,
                mx: x,
                my: y,
                mz: z,
                cx: x,
                cy: y,
                cz: z,
                rFactor, // Store distance factor (0 to 1) for differential movement
                randomRadiusOffset
            });
        }
        return temp;
    }, [count, viewport.width, viewport.height]);

    useFrame(state => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const { viewport: v, pointer: m } = state;
        const time = state.clock.getElapsedTime();

        // Only update virtual mouse if hovered
        if (isHovered) {
            const mouseDist = Math.sqrt(Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2));

            if (mouseDist > 0.001) {
                lastMouseMoveTime.current = Date.now();
                lastMousePos.current = { x: m.x, y: m.y };
            }
        }

        let destX = (m.x * v.width) / 2;
        let destY = (m.y * v.height) / 2;

        if (autoAnimate) {
            const timeSlow = time * 0.3;
            destX += Math.sin(timeSlow) * (v.width / 4);
            destY += Math.cos(timeSlow * 2) * (v.height / 4);
        }

        const smoothFactor = 0.05;
        virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
        virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

        const targetX = virtualMouse.current.x;
        const targetY = virtualMouse.current.y;

        const globalRotation = time * rotationSpeed;

        particles.forEach((particle, i) => {
            let { t, speed, mx, my, mz, cz, rFactor, randomRadiusOffset } = particle;

            t = particle.t += speed / 2;

            const projectionFactor = 1 - cz / 50;
            const projectedTargetX = targetX * projectionFactor;
            const projectedTargetY = targetY * projectionFactor;

            // Hover Extension: Expand the base positions when hovered
            const extensionScale = isHovered ? 1.2 : 1.0;

            // Differential Movement: Particles further from center move more
            const driftAmount = rFactor * 2;
            const driftX = Math.sin(t * 0.2 + mx) * driftAmount;
            const driftY = Math.cos(t * 0.2 + my) * driftAmount;

            const basePosX = (mx + driftX) * extensionScale;
            const basePosY = (my + driftY) * extensionScale;
            const basePosZ = mz * depthFactor;

            const dx = basePosX - projectedTargetX;
            const dy = basePosY - projectedTargetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetPos = { x: basePosX, y: basePosY, z: basePosZ };

            const isInteracting = isHovered && dist < magnetRadius;

            // Interaction only if hovered and within range
            if (isInteracting) {
                const angle = Math.atan2(dy, dx) + globalRotation;

                const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
                const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));

                const currentRingRadius = ringRadius + wave + deviation;

                targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
                targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
                targetPos.z = basePosZ + Math.sin(t) * (1 * waveAmplitude * depthFactor);
            }

            particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
            particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
            particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

            dummy.position.set(particle.cx, particle.cy, particle.cz);

            // Always look at target (even if mouse is far)
            dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
            dummy.rotateX(Math.PI / 2);

            let scaleFactor = 1;
            if (isHovered) {
                const currentDistToMouse = Math.sqrt(
                    Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
                );
                const distFromRing = Math.abs(currentDistToMouse - ringRadius);
                scaleFactor = Math.max(0.1, Math.min(1, 1 - distFromRing / 10));
            }

            // Shrink center particles slightly to satisfy "remain in the middle, but a bit smaller"
            const centerScale = 0.5 + (rFactor * 0.5);
            const finalScale = scaleFactor * centerScale * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;

            dummy.scale.set(finalScale, finalScale, finalScale);

            dummy.updateMatrix();

            mesh.setMatrixAt(i, dummy.matrix);
        });

    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            {particleShape === 'capsule' && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
            {particleShape === 'sphere' && <sphereGeometry args={[0.2, 16, 16]} />}
            {particleShape === 'box' && <boxGeometry args={[0.3, 0.3, 0.3]} />}
            {particleShape === 'tetrahedron' && <tetrahedronGeometry args={[0.3]} />}
            <meshBasicMaterial color={color} />
        </instancedMesh>
    );
};

const Antigravity: React.FC<AntigravityProps> = props => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <Canvas
            camera={{ position: [0, 0, 50], fov: 35 }}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            <AntigravityInner {...props} isHovered={isHovered} />
        </Canvas>
    );
};

export default Antigravity;
