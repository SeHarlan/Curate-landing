import { FC, memo, useRef } from "react";
import p5 from "p5";
import dynamic from "next/dynamic";
import { randomBytes } from "crypto";
import debounce from "lodash.debounce";
const P5Wrapper = dynamic(() => import('./P5Wrapper'), { ssr: false });

const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  
  gl_Position = positionVec4;
}
`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 resolution;
uniform sampler2D texture;
uniform float rando;
uniform float time;
uniform float uRotation;

float sRandom(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}
float map(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float pattern(vec2 uv) {
  float scale = 3.0 * ((resolution.y + resolution.x) / 100.0);
  float line_width = 0.1;
  vec2 grid = fract(uv * scale);
  float dOff = sRandom(uv) * 0.5;
  float diagonal = abs(grid.x - grid.y - dOff);

  float off = 1.0 - sRandom(uv * 2.0) * 0.2;
  float anti_diagonal = abs(grid.x + grid.y - off);

  float lines = min(diagonal, anti_diagonal);

  return smoothstep(line_width, -line_width, lines);
}

vec2 wave(vec2 uv, float frequency, float amplitude, float r) {
  float f = frequency;
  
  float xFac = sRandom(vec2(r, uv.y*0.000001)) * 50.0;
  float yFac = sRandom(vec2(uv.x*0.000001, r)) * 50.0;
    
  vec2 blockFactor = vec2(xFac,yFac);
  float yOff = sin(uv.x * f + yFac) * amplitude;
  
  return vec2(0.0, yOff);
}

void main() {
  mat2 rotationMatrix = mat2(
    cos(uRotation), -sin(uRotation),
    sin(uRotation), cos(uRotation)
  );

  vec2 uv = vTexCoord - 0.5; // Shift the texture coordinates to the origin
  uv *= rotationMatrix; // Rotate the texture coordinates
  uv += 0.5; // Shift the texture coordinates back


  uv += wave(uv, 500.0, 0.0005, 1.0) + wave(uv, 100.0, 0.001, 5.0);

  float canvas_texture = pattern(uv);
  vec4 canvas_col = vec4(vec3(canvas_texture), 1.0);

  vec4 col = texture2D(texture, uv);

  if(canvas_col.r > 0.2) col = mix(canvas_col, col, 0.75); 


  float noise = (0.5 - sRandom(vec2(uv.x*25.0, uv.y*0.0075)+2.0))*0.25;

  col.r += noise;
  col.g += noise;
  col.b += noise;

  float lum = col.r + col.g + col.b;

  float opacity = 0.0 + time * 0.03;

  opacity -= map(uv.y, 0.0, 1.0, 0.0, 1.0);
  // opacity -= map(lum, 3.0, 0.0, 0.0, 0.5);
  
  if (opacity < 0.05) opacity = 0.0;
  // if (lum < 0.2) opacity -= 0.1;

  opacity = min(1.0, opacity);
  gl_FragColor = (col * opacity) + (vec4(245.0/255.0, 245.0/255.0, 244.0/255.0,1.0) * (1.0 - opacity));

}
`;

const MaurerBG: FC<{className?: string}> = ({className}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sketch = (p: p5) => {
    let paintShader: p5.Shader;
    let image: p5.Image;
    let counter = 0;
    
    p.preload = () => { 
      image = p.loadImage("/delux.png")
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.frameRate(24)
      //@ts-ignore
      paintShader = new p5.Shader(p._renderer, vertexShader, fragmentShader);
      p.shader(paintShader)

      resizeCanvasToFitParent()
    };

    const resizeCanvasToFitParent = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        p.resizeCanvas(clientWidth, clientHeight);

        initPainting(clientWidth, clientHeight);
      }
    };

    const deboucedResize = debounce(resizeCanvasToFitParent, 250);

    p.windowResized = () => {
      deboucedResize()
    };

    p.draw = () => {
      const rotation = p.width > p.height ? 0 : p.radians(90);
      paintShader.setUniform('uRotation', rotation);
      paintShader.setUniform("resolution", [p.width, p.height]);
      paintShader.setUniform("time", counter);
      paintShader.setUniform("rando", p.random())
      paintShader.setUniform("texture", image)
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      counter++
    };
    
    function initPainting(width: number, height: number) {
      counter = 0;
    }

  };
  return (
    <div ref={containerRef} className={className}>
      <P5Wrapper sketch={sketch} />
    </div>
  )
}

export default memo(MaurerBG)

