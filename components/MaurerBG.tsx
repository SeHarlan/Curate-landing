import { FC, memo, useRef } from "react";
import p5 from "p5";
import dynamic from "next/dynamic";
import { randomBytes } from "crypto";
import debounce from "lodash.debounce";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";
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
uniform bool inkMode;

uniform float rando;

float sRandom(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

float pattern(vec2 uv) {
  float scale = 3.0 * ((resolution.y + resolution.x) / 100.0);
  float line_width = 0.1;
  vec2 grid = fract(uv * scale);
  float dOff = sRandom(uv) * 0.5;
  float diagonal = abs(grid.x - grid.y - dOff);

  float off = 1.0 - sRandom(uv * 2.0) * 0.2;
  float anti_diagonal = abs(grid.x + grid.y - off);

  float mult = inkMode ? -1.0 : 1.0;

  float lines = min(diagonal, anti_diagonal) * mult;

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
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec2 pixel_uv = uv ;

  pixel_uv += wave(pixel_uv, 500.0, 0.0005, rando) + wave(pixel_uv, 100.0, 0.001, rando*5.0);

  float canvas_texture = pattern(pixel_uv);
  vec4 canvas_col = vec4(vec3(canvas_texture), 1.0);

  vec4 image = texture2D(texture, uv);

  gl_FragColor = mix(canvas_col, image, 0.93); 

  float noise = 0.0;

  float base = inkMode ? 0.6 : 0.4;
  noise = (base - sRandom(vec2(uv.x*25.0, uv.y*0.0075)+rando))*0.25;

  gl_FragColor.r += noise;
  gl_FragColor.g += noise;
  gl_FragColor.b += noise;
}
`;

const MaurerBG: FC<{className?: string, scale?: number}> = ({className, scale = 5}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const useWebGL = useWebGLSupported()

  const sketch = (p: p5) => {
    let paintShader: p5.Shader;
    let graphics: p5.Graphics;
    
    let gridPoints: p5.Vector[] = [];
    let gridParams: {
      radius: number,
      d: number,
      n: number,
      color: p5.Color,
      withLine: p5.Vector | null;
    }[] = [];

    let cw: number, ch: number;
    let counter = 0
    const baseNum = p.randomGaussian(0, 1000)
    
    p.setup = () => {
      if (useWebGL) {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      } else {
        p.createCanvas(p.windowWidth, p.windowHeight);
      }

      graphics = p.createGraphics(p.width, p.height);
        
      if (useWebGL) {
        //@ts-ignore
        paintShader = new p5.Shader(p._renderer, vertexShader, fragmentShader);
        p.shader(paintShader)
      }

      makeGrid(p.width, p.height)
    };

    const resizeCanvasToFitParent = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        p.resizeCanvas(clientWidth, clientHeight);

        graphics.resizeCanvas(clientWidth, clientHeight);

        makeGrid(clientWidth, clientHeight)
      }
    };

    const deboucedResize = debounce(resizeCanvasToFitParent, 250);

    p.windowResized = () => {
      deboucedResize()
    };

    p.draw = () => {
      
      if (counter < p.TWO_PI - p.radians(1)) {
        drawGrid()
      }

      if (useWebGL) {
        paintShader.setUniform("resolution", [p.width, p.height]);
        paintShader.setUniform("texture", graphics)
        paintShader.setUniform("rando", p.random())
        p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        p.image(graphics, 0, 0)

        p.fill(12, 10, 9, 255*0.3)
        p.rect(0, 0, p.width, p.height);
      }
      
    };

    function makeGrid(width: number, height: number) {
      gridParams = []
      gridPoints = []
      counter = 0
      graphics.background(12, 10, 9)
      graphics.strokeWeight(1);
      
      const depth = 0.25
      const scl = scale;

      function getRadius(noise = 0.4) {
        const base = p.min(p.height, p.width)
        const div = scl;
        return base / div * noise
      }

      // grid
      let rows: number, cols: number;
      
      if (height > width) { 
        cols = scl;
        rows = p.max(p.floor((height / width * scl)), 1);
      } else {
        rows = scl;
        cols = p.max(p.floor((width / height * scl)), 1);
      }


      const margin = p.min(height, width) * 0.1

      const gw = width - margin
      const gh = height - margin
      //cell
      cw = gw / cols;
      ch = gh / rows;
      //margin
      const mx = (width - gw) * 0.5;
      const my = (height - gh) * 0.5;

      const yNudge = ch / 2
      const xNudge = cw / 2

      const randX = p.floor(p.random(cols));
      let randY = p.floor(p.random(rows));
      while (p.abs(randY - (rows / 2)) < 1.5) {
        randY = p.floor(p.random(rows));
      }

      for (let y = 0; y < rows; y++) {
        let gy = yNudge + my + y * ch;
        for (let x = 0; x < cols; x++) {
          let gx = xNudge + mx + x * cw;
          const point = p.createVector(gx, gy);
          gridPoints.push(point)

          const d = p.randomGaussian(0, 1000)
          const n = p.randomGaussian(0, 1000)

          const ratio = 0.0009
          const rNoise = p.map(p.noise(gy * ratio, gx * ratio), 0, 1, 0.1, 0.4)
          const radius = getRadius(rNoise)

          const isRand = randX === x && randY === y
          const altCol = p.color(159, 18, 57, 255*0.4)
          const standCol = p.color(234, 231, 229, 255 * 0.15)
          const color = isRand ? altCol : standCol
          const withLine = p.random() > 0.95 ? gridPoints[p.floor(p.random(gridPoints.length))] : null

          gridParams.push({ radius, d, n, color, withLine })
        }
      }
    }

    function drawGrid() {
      const counterInc = p.radians(1)
      graphics.noFill();
      gridPoints.forEach((point, i) => {

        
        const { radius, d, n, color, withLine } = gridParams[i]
        graphics.stroke(color)
        // graphics.circle(point.x, point.y, radius*2)
        if (withLine && counter < p.PI*0.003) {
          graphics.line(withLine.x, withLine.y, point.x, point.y)
        }


        const getVector = (num: number) => {
          let k = num * d;
          let r = radius * p.sin(n * k);
          let x = point.x + r * p.cos(k);
          let y = point.y + r * p.sin(k);
          return p.createVector(x, y);
        }

        const v1 = getVector(counter)
        const v2 = getVector(counter + counterInc)  
        graphics.line(v1.x, v1.y, v2.x, v2.y)        
      })
      counter += counterInc;
    }
  };
  return (
    <div ref={containerRef} className={className}>
      <P5Wrapper sketch={sketch} />
    </div>
  )
}

export default memo(MaurerBG)

