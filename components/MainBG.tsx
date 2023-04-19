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

float rando = 1.0;

float sRandom(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

float pattern2(vec2 uv) {
  float scale = 125.0;
  float line_width = 0.2;
  vec2 grid = fract(uv * scale);
  float dOff = sRandom(uv) * 0.5;
  float diagonal = abs(grid.x - grid.y - dOff);

  float off = 1.0 - sRandom(uv * 2.0) * 0.2;
  float anti_diagonal = abs(grid.x + grid.y - off);
  float lines = min(diagonal, anti_diagonal) ;

  return smoothstep(line_width, -line_width, lines);
}

float pattern(vec2 uv) {
    float scale = 300.0;
    float lineWidth = 0.0001;
    vec2 grid = fract(uv * scale) - 0.5;
    float hLine = smoothstep(lineWidth, -lineWidth, grid.x);
    float vLine = smoothstep(lineWidth, -lineWidth, grid.y);
    return hLine * vLine;
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
  vec2 pixel_uv = uv;

  pixel_uv += wave(pixel_uv, 500.0, 0.0002, rando) + wave(pixel_uv, 100.0, 0.0002, rando*5.0);

  float canvas_texture = pattern(pixel_uv);
  vec4 canvas_col = vec4(vec3(canvas_texture), 1.0);

  vec4 image = texture2D(texture, uv);

  vec4 finalColor = vec4(image.rgb + canvas_texture * 0.01, image.a);

  gl_FragColor = finalColor;

  // float noise = (0.5 - sRandom(vec2(uv.x*25.0, uv.y*0.0075))) * 0.05;

  // gl_FragColor.r += noise;
  // gl_FragColor.g += noise;
  // gl_FragColor.b += noise;
}
`;

const MainBG: FC<{className?: string}> = ({className}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sketch = (p: p5) => {
    let paintShader: p5.Shader;
    let graphics: p5.Graphics;
    
    let counter = 0
    
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.colorMode(p.HSL)
      graphics = p.createGraphics(p.width, p.height);
      graphics.colorMode(p.HSL)
      //@ts-ignore
      paintShader = new p5.Shader(p._renderer, vertexShader, fragmentShader);
      p.shader(paintShader)

      graphics.background(60,5,91)
    };

    const resizeCanvasToFitParent = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        p.resizeCanvas(clientWidth, clientHeight);

        graphics?.resizeCanvas(clientWidth, clientHeight);
        graphics.background(60,5,91)
        let counter = 0
      }
    };

    const deboucedResize = debounce(resizeCanvasToFitParent, 250);

    p.windowResized = () => {
      deboucedResize()
    };

    p.draw = () => {

      const make = () => {
        const colors = [ p.color(24, 11, 99), p.color(12, 7, 15)]
  
        const randI = p.floor(p.random(colors.length))
        let bgC = p.random() > 0.9 ? p.color(343, 78, 35) : colors[randI]
  
        let x1 = p.randomGaussian(p.width / 2, p.width / 4)
        let y1 = (p.randomGaussian(p.height / 2, p.height / 4)) 
  
        if (counter % 2 === 0 || counter > 90) {
          bgC = p.color(24, 11, 99)
          x1 = p.randomGaussian(p.width / 2, p.width *0.15)
          y1 = p.abs(p.randomGaussian(p.height / 2, p.height *0.01)) 
        }
  
        if (p.random() > 0.5) {
          const range = p.width * 0.12
          const x2 = x1 + p.random(0, range)
          const y2 = y1 + p.random(0, -range)
          cloud(x1, y1, x2, y2, bgC, range*0.3)
        } else {
          const range = p.width * 0.20
          let x2 = x1 + p.random(-range, range)
          let y2 = y1 + p.random(-range, range)
  
          if (p.dist(x1, y1, x2, y2) > range) {
            if (p.random() > 0.5) {
              x2 = x1+2;
            } else {
              y2 = y1+2;
            }
          }
  
          rectangle(x1, y1, x2, y2, bgC)
        }
      }
      if (counter < 100) {
        make()
        make()
        make()
      }
      counter++
      paintShader.setUniform("resolution", [p.width, p.height]);
      paintShader.setUniform("texture", graphics)
      paintShader.setUniform("rando", p.random())
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
    };

    function cloud(x1: number, y1: number, x2: number, y2: number, bgC: p5.Color, range: number) {
      graphics.noStroke();

      for (let i = 0; i < 4; i++) {
        const c1x = p.lerp(x1, x2, 0.3) + p.random(-range / 2, range)
        const c1y = p.lerp(y1, y2, 0.3) + p.random(-range / 2, range)
        const c2x = p.lerp(x1, x2, 0.7) + p.random(-range / 2, range)
        const c2y = p.lerp(y1, y2, 0.7) + p.random(-range / 2, range)


        const c3x = p.lerp(x1, x2, 0.7) + p.random(-range, range / 2)
        const c3y = p.lerp(y1, y2, 0.7) + p.random(-range, range / 2)
        const c4x = p.lerp(x1, x2, 0.3) + p.random(-range, range / 2)
        const c4y = p.lerp(y1, y2, 0.3) + p.random(-range, range / 2)

        for (let j = 0; j < 20; j++) {
          const h = p.hue(bgC) + p.random(-2, 2)
          const s = p.saturation(bgC) + p.random(-10, 10)
          const l = p.lightness(bgC) + p.random(-10, 10)
          const a = p.random(0.01, 0.4)
          graphics.noStroke()
          graphics.fill(p.color(h, s, l, a))
          graphics.beginShape()
          const offRange = 8
          const off1 = p.random(-offRange, 0)
          const off2 = p.random(offRange, 0)
          const off3 = p.random(-offRange, offRange)
          const off4 = p.random(-offRange, offRange)
          graphics.vertex(x1 + off1, y1 + off1);
          graphics.bezierVertex(c1x, c1y, c2x, c2y, x2 + off2, y2 + off2);
          graphics.bezierVertex(c3x, c3y, c4x, c4y, x1 + off1, y1 + off1);
          graphics.endShape()
        }
      }
    }

    function rectangle(x1: number, y1: number, x2: number, y2: number, bgC: p5.Color) {
      const h = p.hue(bgC) + p.random(-10, 10)
      const s = p.saturation(bgC) + p.random(-5, 5)
      const l = p.lightness(bgC) + p.random(-5, 5)
      const a = .95//p.random(0.1, 0.8)
      graphics.noStroke()
      graphics.fill(p.color(h, s, l, a))
      graphics.beginShape();
      const step = 0.01

      function getNoise(x: number, y: number, off: number, range = 2) {
        const ratio = 0.001;
        return p.map(p.noise(x * ratio + off, y * ratio + off), 0, 1, -range, range)
      }

      for (let t = 0; t <= 1 - step; t += step) {
        let x = p.lerp(x1, x2, t)
        let y = y1;

        x += getNoise(x, y, 0);
        y += getNoise(x, y, 100);
        graphics.vertex(x, y)
      }
      for (let t = 0; t <= 1 - step; t += step) {
        let x = x2;
        let y = p.lerp(y1, y2, t);
        x += getNoise(x, y, 0);
        y += getNoise(x, y, 100);
        graphics.vertex(x, y)
      }
      for (let t = 0; t <= 1 - step; t += step) {
        let x = p.lerp(x2, x1, t)
        let y = y2;
        x += getNoise(x, y, 0);
        y += getNoise(x, y, 100);
        graphics.vertex(x, y)
      }
      for (let t = 0; t <= 1 - step; t += step) {
        let x = x1;
        let y = p.lerp(y2, y1, t);
        x += getNoise(x, y, 0);
        y += getNoise(x, y, 100);
        graphics.vertex(x, y)
      }
      graphics.endShape()

      const isVert = p.random() > 0.5
      const dist = p.dist(x1, y1, x2, y2)
      const num = dist * 150
      for (let i = 0; i < num; i++) {

        const xs = p.random(x1, x2)
        const ys = p.random(y1, y2)
        const h = p.hue(bgC) + getNoise(xs, ys, 0, 2)
        const s = p.saturation(bgC) + getNoise(xs, ys, 10, 2)
        const l = p.lightness(bgC) + getNoise(xs, ys, 30, 5)
        const a = 0.2 + getNoise(xs, ys, 100, 0.2)
        graphics.noStroke()
        graphics.fill(p.color(h, s, l, a))
        graphics.rectMode(p.CENTER)

        const range = dist*0.03
        graphics.rect(
          xs,
          ys,
          isVert ? p.random(1, range) : 1,
          isVert ? 1 : p.random(1, range)
        )
      }
    }
  };
  return (
    <div ref={containerRef} className={className}>
      <P5Wrapper sketch={sketch} />
    </div>
  )
}

export default memo(MainBG)

