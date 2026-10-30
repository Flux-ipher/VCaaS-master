'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import * as THREE from 'three';

type Uniforms = {
  [key: string]: {
    value: number[] | number[][] | number;
    type: string;
  };
};

interface ShaderProps {
  source: string;
  uniforms: Uniforms;
  maxFps?: number;
}

export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  const [fiber, setFiber] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    if (typeof window !== 'undefined') {
      import('@react-three/fiber').then((m) => mounted && setFiber(m)).catch(() => {});
    }
    return () => { mounted = false };
  }, []);

  return (
    <div className={clsx('h-full relative w-full', containerClassName)}>
      <div className="h-full w-full">
        {fiber && (
          <DotMatrix
            fiber={fiber}
            colors={colors ?? [[0, 255, 255]]}
            dotSize={dotSize ?? 3}
            opacities={opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
            shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
            center={["x", "y"]}
          />
        )}
      </div>
      {showGradient && <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />}
    </div>
  );
};

interface DotMatrixProps {
  fiber: any;
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ('x' | 'y')[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  fiber,
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = '',
  center = ['x', 'y'],
}) => {
  const uniforms = useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length === 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [color[0] / 255, color[1] / 255, color[2] / 255]),
        type: 'uniform3fv',
      },
      u_opacities: {
        value: opacities,
        type: 'uniform1fv',
      },
      u_total_size: {
        value: totalSize,
        type: 'uniform1f',
      },
      u_dot_size: {
        value: dotSize,
        type: 'uniform1f',
      },
      u_reverse: {
        value: shader.includes('u_reverse_active') ? 1 : 0,
        type: 'uniform1i',
      },
    } as Uniforms;
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      fiber={fiber}
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes('x') ? 'st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));' : ''}
            ${center.includes('y') ? 'st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));' : ''}

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  );
};

const ShaderMaterial = ({ fiber, source, uniforms, maxFps = 60 }: { fiber: any; source: string; hovered?: boolean; maxFps?: number; uniforms: Uniforms }) => {
  if (!fiber) return null;
  const { useThree, useFrame } = fiber as any;
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  let lastFrameTime = 0;

  useFrame(({ clock }: any) => {
    if (!ref.current) return;
    const timestamp = clock.getElapsedTime();
    lastFrameTime = timestamp;
    const material: any = (ref.current as any).material;
    const timeLocation = material.uniforms.u_time;
    timeLocation.value = timestamp;
  });

  const preparedUniforms = useMemo(() => {
    const out: any = {};
    for (const uniformName in uniforms) {
      const uniform: any = (uniforms as any)[uniformName];
      switch (uniform.type) {
        case 'uniform1f':
          out[uniformName] = { value: uniform.value };
          break;
        case 'uniform1i':
          out[uniformName] = { value: uniform.value };
          break;
        case 'uniform3f':
          out[uniformName] = { value: new THREE.Vector3().fromArray(uniform.value) };
          break;
        case 'uniform1fv':
          out[uniformName] = { value: uniform.value };
          break;
        case 'uniform3fv':
          out[uniformName] = { value: uniform.value.map((v: number[]) => new THREE.Vector3().fromArray(v)) };
          break;
        case 'uniform2f':
          out[uniformName] = { value: new THREE.Vector2().fromArray(uniform.value) };
          break;
      }
    }
    out['u_time'] = { value: 0 };
    out['u_resolution'] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return out;
  }, [size.width, size.height, uniforms]);

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        gl_Position = vec4(position.x, position.y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }`,
      fragmentShader: source,
      uniforms: preparedUniforms,
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
    return mat;
  }, [preparedUniforms, size.width, size.height, source]);

  return (
    React.createElement('mesh', { ref: ref as any },
      React.createElement('planeGeometry', { args: [2, 2] } as any),
      React.createElement('primitive', { object: material, attach: 'material' } as any)
    )
  );
};

const Shader: React.FC<ShaderProps & { fiber: any }> = ({ fiber, source, uniforms, maxFps = 60 }) => {
  if (!fiber) return null;
  const { Canvas } = fiber as any;
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterial fiber={fiber} source={source} uniforms={uniforms} maxFps={60} />
    </Canvas>
  );
};
