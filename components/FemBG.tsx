import { FC, memo, useRef } from "react";
import p5 from "p5";
import dynamic from "next/dynamic";
import { randomBytes } from "crypto";
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

float pattern(vec2 uv) {
  float scale = 125.0;
  float line_width = 0.2;
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
  
  float glitchProbability = sRandom(floor(uv * blockFactor) * 5.0 + r);
  
  if (glitchProbability < 0.75) {
  }
  return vec2(0.0, yOff);
  // return vec2(0.0, 0.0);
}

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  vec2 pixel_uv = uv;

  pixel_uv += wave(pixel_uv, 500.0, 0.0007, rando) + wave(pixel_uv, 100.0, 0.0005, rando*5.0);

  float canvas_texture = pattern(pixel_uv);
  vec4 canvas_col = vec4(vec3(canvas_texture), 1.0);

  vec4 image = texture2D(texture, uv);

  if(canvas_col.r > 0.1) {
    gl_FragColor = mix(canvas_col*-1.0, image, 0.95); 
  } else {
    gl_FragColor = image;
  }

  float rDif = 255.0/255.0 - image.r;
  float gDif = 251.0/255.0 - image.g;
  float bDif = 235.0/255.0 - image.b;
  bool isBg = rDif < 0.2 && gDif < 0.2 && bDif < 0.2;

  float noise = 0.0;

  noise = (0.5 - sRandom(uv*0.00003)) * 0.03;

  gl_FragColor.r += noise;
  gl_FragColor.g += noise;
  gl_FragColor.b += noise;
}
`;

const FemBG: FC<{className?: string}> = ({className}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sketch = (p: p5) => {
    let counter = 0
    const resizeCanvasToFitParent = () => {
      counter = 0
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        p.resizeCanvas(clientWidth, clientHeight);
        // p.clear(0, 0, 0, 0)
        
        graphics?.resizeCanvas(clientWidth, clientHeight);
        graphics?.background(48, 100, 96)
      }
    };

    let paintShader: p5.Shader;
    let graphics: p5.Graphics;
    let walkers: p5.Vector[] = [];
    let walkerAngles: number[] = [];
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      resizeCanvasToFitParent();
      p.colorMode(p.HSL)

      graphics = p.createGraphics(p.width, p.height);
      graphics.colorMode(p.HSL)
      graphics.background(48, 100, 96)
        
      for (let i = 0; i < 3; i++) { 
        walkers.push(p.createVector(p.width, p.height))
        walkerAngles.push(p.radians(p.random(-100, -170)))

        walkers.push(p.createVector(0, 0))
        walkerAngles.push(p.radians(p.random(10, 80)))

      }

      //@ts-ignore
      paintShader = new p5.Shader(p._renderer, vertexShader, fragmentShader);
      p.shader(paintShader)
    };

    p.windowResized = () => {
      resizeCanvasToFitParent();
    };
   
    const max = 90

   
    p.draw = () => {
      const len = p.height * 0.2
      
      //Cloud
      if (counter < max && p.random() > 0.5) {
        const len = p.height * 0.2
        const x1 = p.width - p.constrain(p.abs(p.randomGaussian(0, p.width / 3)), 0, p.width)
        const y1 = p.constrain(p.abs(p.randomGaussian(0, p.height / 3)), 0, p.height)
        // const y1 = p.random(0, p.height*0.5)
        const x2 = p.random(x1, x1 + len)
        const y2 = p.random(y1, y1 - len);

        const colors = [p.color(240, 30, 45), p.color(300, 25, 40), p.color(350, 50, 70)]
        // const colors = [p.color(240, 70, 45), p.color(120, 35, 40), p.color(60, 80, 60)]
        const randI = p.floor(p.random(colors.length))
        const bgC = colors[randI]

        const range = len / 4
        cloud(x1, y1, x2, y2, bgC, range)
        counter++



      } 


      //Rect
      if (p.random() > 0.5) {
        const len = p.height * 0.15
        const x1 = p.constrain(p.abs(p.randomGaussian(0, p.width / 3)), 0, p.width)
        const y1 = p.random(p.height * 0.6, p.height);
        const x2 = p.random(x1, x1 + len);
        const y2 = p.random(y1, y1 - len);

        const colors = [p.color(240, 30, 45), p.color(300, 25, 10), p.color(350, 70, 50)]
        // const colors = [p.color(240, 70, 45), p.color(120, 35, 40), p.color(60, 80, 60)]
        const randI = p.floor(p.random(colors.length))
        const bgC = colors[randI]

        const range = len / 4
        // rectangle(x1, y1, x2, y2, bgC, range)
      }

      graphics.stroke(50, 5, 15, 0.15)
      graphics.strokeWeight(2.5)
      const ratio = 0.0005
      const dist = 4
      walkers.forEach((walker, j) => {

        const angle = walkerAngles[j]

        const newx = walker.x + p.cos(angle) * dist
        const newy = walker.y + p.sin(angle) * dist
  
        graphics.line(walker.x, walker.y, newx, newy)
  
        walker.x = newx + p.cos(angle)*2;
        walker.y = newy + p.sin(angle)*2;
        walkerAngles[j] = angle + p.map(p.noise(newx*ratio + j, newy*ratio + j), 0, 1, p.radians(-7), p.radians(7))

      })

    

      paintShader.setUniform("resolution", [p.width, p.height]); 
      paintShader.setUniform("texture", graphics)
      paintShader.setUniform("rando", p.random())
      p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
    };



    function cloud(x1: number, y1: number, x2: number, y2: number, bgC: p5.Color, range: number) {
      graphics.noStroke();

      for (let i = 0; i < 4; i++) {        
        const c1x = p.lerp(x1, x2, 0.3) + p.random(-range/2, range)
        const c1y = p.lerp(y1, y2, 0.3) + p.random(-range/2, range)
        const c2x = p.lerp(x1, x2, 0.7) + p.random(-range/2, range)
        const c2y = p.lerp(y1, y2, 0.7) + p.random(-range/2, range)

        
        const c3x = p.lerp(x1, x2, 0.7) + p.random(-range, range/2)
        const c3y = p.lerp(y1, y2, 0.7) + p.random(-range, range/2)
        const c4x = p.lerp(x1, x2, 0.3) + p.random(-range, range/2)
        const c4y = p.lerp(y1, y2, 0.3) + p.random(-range, range/2)

        for (let j = 0; j < 13; j++) {
          const h = p.hue(bgC) + p.random(-10, 10)
          const s = p.saturation(bgC) + p.random(-10, 10)
          const l = p.lightness(bgC) + p.random(-10, 10)
          const a = p.random(0.01, 0.1)
          graphics.noStroke()
          graphics.fill(p.color(h, s, l, a))
          graphics.beginShape()
          const offRange = 3
          const off1 = p.random(-offRange, offRange)
          const off2 = p.random(-offRange, offRange)
          graphics.vertex(x1+off1, y1+off1);
          graphics.bezierVertex(c1x + off1, c1y + off1, c2x + off1, c2y + off1, x2+off2, y2+off2);
          graphics.bezierVertex(c3x + off2, c3y + off2, c4x + off2, c4y + off2, x1+off1, y1+off1);
          graphics.endShape()
        }
      }
    }

    function rectangle(x1: number, y1: number, x2: number, y2: number, bgC: p5.Color, range: number) {
      const h = p.hue(bgC) + p.random(-10, 10)
      const s = p.saturation(bgC) + p.random(-10, 10)
      const l = p.lightness(bgC) + p.random(-10, 10)
      const a = 0.9//p.random(0.1, 0.8)
      graphics.noStroke()
      graphics.fill(p.color(h, s, l, a))
      graphics.beginShape();
      const step = 0.01

      function getNoise(x: number, y: number, off: number) {
        const ratio = 0.05;
        const range = 2;
        return p.map(p.noise(x*ratio+off, y*ratio+off), 0,1, -range, range)
      }

      for (let t = 0; t <= 1-step; t += step) {
        let x = p.lerp(x1, x2, t)
        let y = y1;

        x += getNoise(x, y, 0);
        y += getNoise(x, y, 100);
        graphics.vertex(x,y)
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

      for (let i = 0; i < 1000; i++) {
        const h = p.hue(bgC) + p.random(-10, 10)
        const s = p.saturation(bgC) + p.random(-10, 10)
        const l = p.lightness(bgC) + p.random(-10, 10)
        const a = p.random(0.25, 0.8)
        graphics.noStroke()
        graphics.fill(p.color(h, s, l, a))
        graphics.rectMode(p.CENTER)
        graphics.circle(p.random(x1,x2), p.random(y1,y2), p.random(1,4))
      }
    }

    setTimeout(() => {
      graphics.stroke(50, 5, 15, 0.5)
      const d = 1350.5;
      const n = 1349.5;
      const radius = 75
      walkers.forEach((walker, j) => { 
        graphics.noFill();
        graphics.strokeWeight(1);
        graphics.beginShape();
        const angle = walkerAngles[j]
        const newx = walker.x + p.cos(angle) * (radius + 8)
        const newy = walker.y + p.sin(angle) * (radius + 8)
        for (let i = p.radians(1); i < p.TWO_PI - p.radians(1); i+=p.radians(1)) {
          let k = i * d;
          let r = radius * p.sin(n * k);
          let x = newx + r * p.cos(k);
          let y = newy + r * p.sin(k);
          graphics.vertex(x, y);
        }
        graphics.endShape();
      })

      p.noLoop()
    }, 3000)

  };
  return (
    <div ref={containerRef} className={className}>
      <P5Wrapper sketch={sketch} />
    </div>
  )
}

export default memo(FemBG)

