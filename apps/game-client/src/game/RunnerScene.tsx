import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { tokens } from '../theme/tokens';
import type { RunnerEngine, WorldEntity } from './RunnerEngine';
import { CHUNK_LENGTH, LANE_WIDTH, laneX } from './DifficultyCurve';
import { useRunStore } from '../state/runStore';

interface Props {
  mode: 'idle' | 'run';
  engineRef?: MutableRefObject<RunnerEngine | null>;
  className?: string;
}

export function RunnerScene({ mode, engineRef, className }: Props) {
  return (
    <div className={className ?? 'scene-layer'} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 5.2, 8.5], fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <color attach="background" args={[tokens.skyTop]} />
        <fog attach="fog" args={['#8ec8ff', 32, 110]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 14, 6]} intensity={1.25} castShadow={false} />
        <hemisphereLight args={['#9ad0ff', '#6b8f3a', 0.5]} />
        <World mode={mode} engineRef={engineRef} />
      </Canvas>
    </div>
  );
}

function World({
  mode,
  engineRef,
}: {
  mode: 'idle' | 'run';
  engineRef?: MutableRefObject<RunnerEngine | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group>(null);
  const entitiesGroup = useRef<THREE.Group>(null);
  const camTarget = useRef(new THREE.Vector3());
  const hudZ = useRunStore((s) => s.z);
  const entities = useRunStore((s) => s.entities);
  const px = useRunStore((s) => s.x);
  const py = useRunStore((s) => s.y);
  const sliding = useRunStore((s) => s.sliding);
  const skating = useRunStore((s) => s.skating);

  useFrame((state, dt) => {
    const eng = engineRef?.current;
    let x = px;
    let y = py;
    let z = hudZ;
    let slide = sliding;
    let skate = skating;

    if (mode === 'run' && eng) {
      const s = eng.snapshot();
      x = s.x;
      y = s.y;
      z = s.z;
      slide = s.sliding;
      skate = s.skating;
    }

    if (mode === 'idle' && group.current) {
      group.current.position.z = -((state.clock.elapsedTime * 6) % CHUNK_LENGTH);
    } else if (group.current) {
      group.current.position.z = 0;
    }

    if (playerRef.current) {
      if (mode === 'idle') {
        const t = state.clock.elapsedTime;
        playerRef.current.position.x = Math.sin(t * 0.7) * LANE_WIDTH * 0.4;
        playerRef.current.position.y = 0.9 + Math.abs(Math.sin(t * 6)) * 0.15;
        playerRef.current.position.z = -2;
        playerRef.current.rotation.x = 0;
      } else {
        playerRef.current.position.set(x, 0.85 + y - (slide ? 0.35 : 0), 0);
        playerRef.current.rotation.x = slide ? 0.6 : skate ? -0.15 : 0;
      }
    }

    const desired = camTarget.current;
    desired.set(x * 0.35, 4.6 + y * 0.2, mode === 'run' ? 7.8 : 8.5);
    state.camera.position.lerp(desired, 1 - Math.exp(-4 * dt));
    state.camera.lookAt(x * 0.2, 1.2 + y * 0.3, mode === 'run' ? -6 : -4);
  });

  const buildings = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        z: -i * 8.5,
        side: i % 2 === 0 ? -1 : 1,
        h: 3.2 + (i % 5) * 0.85,
        color: ['#f0c24b', '#4aa3ff', '#f28ab2', '#fff4e0', '#7ec8a3'][i % 5],
        colmado: i % 5 === 1 && i % 2 === 1,
      })),
    [],
  );

  return (
    <group ref={group}>
      <TrackRibbon length={180} />
      <SideDressing buildings={buildings} />
      <LandmarkProps />
      <group ref={playerRef}>
        <PlayerBody skating={mode === 'run' ? skating : false} />
      </group>
      <group ref={entitiesGroup}>
        {mode === 'run'
          ? entities.map((e) => <EntityMesh key={e.id} entity={e} playerZ={hudZ} />)
          : null}
      </group>
      {mode === 'idle' ? <IdleProps /> : null}
    </group>
  );
}

function TrackRibbon({ length }: { length: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2]}>
        <planeGeometry args={[LANE_WIDTH * 3.8, length]} />
        <meshStandardMaterial color="#5c4030" />
      </mesh>
      {[-1, 0, 1].map((lane) => (
        <group key={lane} position={[laneX(lane + 1), 0.02, -length / 2]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, length]} />
            <meshStandardMaterial color="#b8bec8" metalness={0.55} roughness={0.4} />
          </mesh>
          <mesh position={[-0.58, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, length]} />
            <meshStandardMaterial color="#b8bec8" metalness={0.55} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 45 }).map((_, i) => (
        <mesh key={i} position={[0, 0.03, -i * 4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LANE_WIDTH * 3.4, 0.35]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
    </group>
  );
}

function SideDressing({
  buildings,
}: {
  buildings: { z: number; side: number; h: number; color: string; colmado: boolean }[];
}) {
  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.side * 7.4, b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[3.4, b.h, 3.2]} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          {/* Windows */}
          {Array.from({ length: Math.max(1, Math.floor(b.h) - 1) }).map((_, w) => (
            <mesh key={w} position={[b.side > 0 ? -1.72 : 1.72, -b.h / 2 + 1.1 + w * 1.1, 0.4]}>
              <boxGeometry args={[0.08, 0.55, 0.7]} />
              <meshStandardMaterial color="#87ceeb" emissive="#3a6ea5" emissiveIntensity={0.2} />
            </mesh>
          ))}
          {b.colmado ? (
            <group position={[b.side > 0 ? -1.75 : 1.75, -b.h / 2 + 2.1, 0]}>
              <mesh>
                <boxGeometry args={[0.12, 0.7, 2.4]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <Text
                position={[b.side > 0 ? -0.1 : 0.1, 0, 0]}
                rotation={[0, b.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}
                fontSize={0.38}
                color="#FFD23F"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000"
              >
                COLMADO
              </Text>
            </group>
          ) : null}
          {i % 4 === 0 ? (
            <mesh position={[0, b.h / 2 + 0.4, 1.6]}>
              <boxGeometry args={[2.4, 0.55, 0.12]} />
              <meshStandardMaterial color={tokens.rdRed} />
            </mesh>
          ) : null}
        </group>
      ))}

      {/* Retaining walls */}
      {[-5.4, 5.4].map((x) => (
        <mesh key={x} position={[x, 2.1, -50]}>
          <boxGeometry args={[0.45, 4.2, 110]} />
          <meshStandardMaterial color="#8a9099" />
        </mesh>
      ))}

      {/* Palm trees */}
      {Array.from({ length: 12 }).map((_, i) => (
        <PalmTree key={`p${i}`} position={[i % 2 === 0 ? -8.8 : 8.8, 0, -i * 11 - 4]} />
      ))}
    </group>
  );
}

function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 3.4, 7]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[Math.cos((i / 5) * Math.PI * 2) * 0.55, 3.35, Math.sin((i / 5) * Math.PI * 2) * 0.55]}
          rotation={[0.55, (i / 5) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.15, 0.08, 1.5]} />
          <meshStandardMaterial color="#2f9e44" />
        </mesh>
      ))}
    </group>
  );
}

function LandmarkProps() {
  return (
    <group>
      {/* Banner: ¡QUÍTATE DEL MEDIO! */}
      <group position={[0, 5.1, -10]}>
        <mesh>
          <boxGeometry args={[7.2, 0.7, 0.1]} />
          <meshStandardMaterial color={tokens.uiGold} />
        </mesh>
        <Text
          position={[0, 0, 0.08]}
          fontSize={0.42}
          color="#111"
          anchorX="center"
          anchorY="middle"
        >
          ¡QUÍTATE DEL MEDIO!
        </Text>
      </group>

      {/* Wall: REPÚBLICA DOMINICANA */}
      <group position={[5.35, 2.6, -22]}>
        <mesh>
          <boxGeometry args={[0.35, 3.6, 8]} />
          <meshStandardMaterial color="#9aa3ad" />
        </mesh>
        <Text
          position={[-0.22, 0.4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.32}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          maxWidth={6}
          outlineWidth={0.015}
          outlineColor="#0033A0"
        >
          REPÚBLICA DOMINICANA
        </Text>
        {/* Mini RD flag block */}
        <mesh position={[-0.25, 1.35, 2.2]}>
          <boxGeometry args={[0.08, 0.55, 0.9]} />
          <meshStandardMaterial color={tokens.rdBlue} />
        </mesh>
        <mesh position={[-0.25, 1.35, 2.2]}>
          <boxGeometry args={[0.09, 0.12, 0.9]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[-0.25, 1.35, 2.2]}>
          <boxGeometry args={[0.09, 0.55, 0.12]} />
          <meshStandardMaterial color={tokens.rdRed} />
        </mesh>
      </group>
    </group>
  );
}

/** Corredor RD: camisa blanca, pantalón azul, gorra bandera, mochila RD */
function PlayerBody({ skating }: { skating: boolean }) {
  return (
    <group>
      {/* Legs / pants */}
      <mesh position={[-0.12, 0.28, 0]}>
        <capsuleGeometry args={[0.1, 0.32, 4, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0.12, 0.28, 0]}>
        <capsuleGeometry args={[0.1, 0.32, 4, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      {/* Sneakers red/white */}
      <mesh position={[-0.12, 0.02, 0.08]}>
        <boxGeometry args={[0.18, 0.1, 0.28]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.12, 0.02, 0.08]}>
        <boxGeometry args={[0.18, 0.1, 0.28]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.12, 0.02, 0.18]}>
        <boxGeometry args={[0.18, 0.1, 0.08]} />
        <meshStandardMaterial color={tokens.rdRed} />
      </mesh>
      <mesh position={[0.12, 0.02, 0.18]}>
        <boxGeometry args={[0.18, 0.1, 0.08]} />
        <meshStandardMaterial color={tokens.rdRed} />
      </mesh>
      {/* Torso white */}
      <mesh position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.26, 0.42, 4, 8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.38, 0.7, 0]} rotation={[0, 0, 0.35]}>
        <capsuleGeometry args={[0.08, 0.28, 4, 6]} />
        <meshStandardMaterial color="#f0c7a0" />
      </mesh>
      <mesh position={[0.38, 0.7, 0]} rotation={[0, 0, -0.35]}>
        <capsuleGeometry args={[0.08, 0.28, 4, 6]} />
        <meshStandardMaterial color="#f0c7a0" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshStandardMaterial color="#f0c7a0" />
      </mesh>
      {/* Cap — Dominican flag colors */}
      <mesh position={[0, 1.4, 0.02]}>
        <cylinderGeometry args={[0.28, 0.3, 0.14, 14]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 1.4, 0.02]}>
        <boxGeometry args={[0.58, 0.05, 0.05]} />
        <meshStandardMaterial color={tokens.rdRed} />
      </mesh>
      <mesh position={[0, 1.4, 0.02]}>
        <boxGeometry args={[0.05, 0.05, 0.58]} />
        <meshStandardMaterial color={tokens.rdBlue} />
      </mesh>
      <mesh position={[0, 1.36, 0.28]}>
        <boxGeometry args={[0.34, 0.05, 0.18]} />
        <meshStandardMaterial color={tokens.rdBlue} />
      </mesh>
      {/* Backpack RD */}
      <mesh position={[0, 0.78, -0.3]}>
        <boxGeometry args={[0.38, 0.48, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <Text
        position={[0, 0.78, -0.42]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.18}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        RD
      </Text>
      {skating ? (
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.75, 0.08, 0.24]} />
          <meshStandardMaterial color="#222" emissive="#ff6600" emissiveIntensity={0.45} />
        </mesh>
      ) : null}
    </group>
  );
}

function EntityMesh({ entity, playerZ }: { entity: WorldEntity; playerZ: number }) {
  const z = -(entity.z - playerZ);
  const x = laneX(entity.lane);

  if (entity.isCollectible) {
    return (
      <group position={[x, entity.y, z]}>
        <CollectibleMesh kind={entity.kind} />
      </group>
    );
  }

  if (entity.kind === 'train') {
    return (
      <group position={[x, 0, z]}>
        <OmsaTrain />
      </group>
    );
  }

  const h =
    entity.kind === 'barrier_low' ? 0.7 : entity.kind === 'gap' ? 0.2 : entity.kind === 'container' ? 1.7 : 1.55;
  const w = entity.kind === 'container' ? 1.65 : 1.2;
  const color =
    entity.kind === 'barrier_high'
      ? '#e8e8e8'
      : entity.kind === 'barrier_low'
        ? tokens.rdRed
        : entity.kind === 'container'
          ? tokens.rdRed
          : '#333';

  return (
    <group position={[x, h / 2, z]}>
      <mesh>
        <boxGeometry args={[w, h, entity.kind === 'container' ? 1.4 : 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {entity.kind === 'barrier_low' ? (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.45, 0.14, 0.14]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ) : null}
    </group>
  );
}

function CollectibleMesh({ kind }: { kind: WorldEntity['kind'] }) {
  if (kind === 'banana') {
    return (
      <mesh rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.12, 0.28, 4, 8]} />
        <meshStandardMaterial color={tokens.bananaYellow} emissive={tokens.bananaYellow} emissiveIntensity={0.12} />
      </mesh>
    );
  }
  if (kind === 'coin') {
    return (
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
        <meshStandardMaterial color={tokens.coinGold} metalness={0.7} roughness={0.25} emissive="#aa8800" emissiveIntensity={0.15} />
      </mesh>
    );
  }
  if (kind === 'pica_pollo') {
    return (
      <group>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.35, 12]} />
          <meshStandardMaterial color={tokens.picaPolloRed} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 12]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <Text position={[0, 0.05, 0.33]} fontSize={0.1} color="#fff" anchorX="center" anchorY="middle">
          PICA
        </Text>
      </group>
    );
  }
  if (kind === 'mangu') {
    return (
      <group>
        <mesh>
          <cylinderGeometry args={[0.32, 0.28, 0.08, 12]} />
          <meshStandardMaterial color="#eee" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#c4a35a" />
        </mesh>
        <mesh position={[0.12, 0.1, 0.05]}>
          <boxGeometry args={[0.12, 0.05, 0.18]} />
          <meshStandardMaterial color="#c1272d" />
        </mesh>
        <mesh position={[-0.1, 0.12, -0.05]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#f5d76e" />
        </mesh>
      </group>
    );
  }
  if (kind === 'skate_charge') {
    return (
      <mesh>
        <boxGeometry args={[0.55, 0.1, 0.18]} />
        <meshStandardMaterial color="#ff7a18" emissive="#ff5500" emissiveIntensity={0.35} />
      </mesh>
    );
  }
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#aaa" />
    </mesh>
  );
}

function OmsaTrain() {
  return (
    <group>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.85, 2.1, 4.2]} />
        <meshStandardMaterial color="#dfe6ef" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.9, 2.05]}>
        <boxGeometry args={[1.5, 0.55, 0.12]} />
        <meshStandardMaterial color={tokens.rdBlue} />
      </mesh>
      <Text position={[0, 1.9, 2.15]} fontSize={0.28} color="#fff" anchorX="center" anchorY="middle">
        OMSA
      </Text>
      <mesh position={[-0.55, 0.35, 1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.55, 0.35, 1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.55, 0.35, -1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.55, 0.35, -1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Cab windows */}
      <mesh position={[0, 1.5, 2.05]}>
        <boxGeometry args={[1.2, 0.55, 0.08]} />
        <meshStandardMaterial color="#5dade2" emissive="#1a5276" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function IdleProps() {
  return (
    <group position={[0, 0, -14]}>
      {/* OMSA bus */}
      <group position={[-3.2, 0, 2]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.9, 2.2, 4.6]} />
          <meshStandardMaterial color="#1d4ea8" />
        </mesh>
        <mesh position={[0, 2.1, 2.35]}>
          <boxGeometry args={[1.5, 0.35, 0.08]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <Text position={[0, 2.1, 2.42]} fontSize={0.22} color="#fff" anchorX="center" anchorY="middle">
          27 COLMADO
        </Text>
        <Text position={[0, 1.4, 2.35]} fontSize={0.35} color="#fff" anchorX="center" anchorY="middle">
          OMSA
        </Text>
      </group>
      {/* Taxi */}
      <group position={[0.4, 0, 6]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.5, 1.2, 2.6]} />
          <meshStandardMaterial color={tokens.bananaYellow} />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[0.7, 0.25, 0.5]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <Text position={[0, 1.45, 0.35]} fontSize={0.16} color="#fff" anchorX="center">
          TAXI
        </Text>
      </group>
      {/* Jeepeta */}
      <mesh position={[3.1, 0.85, 4]}>
        <boxGeometry args={[1.55, 1.5, 2.8]} />
        <meshStandardMaterial color={tokens.rdRed} />
      </mesh>
      {/* Motoconcho */}
      <group position={[-0.8, 0.35, 9]}>
        <mesh>
          <boxGeometry args={[0.35, 0.55, 1.1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0.55, -0.1]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#f0c7a0" />
        </mesh>
        <mesh position={[0, 0.75, -0.1]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color={tokens.rdRed} />
        </mesh>
      </group>
    </group>
  );
}
