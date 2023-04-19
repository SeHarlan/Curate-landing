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

const glitchShader = `
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

vec2 wave(vec2 uv, float frequency, float amplitude, float r) {
  float f = frequency;
  
  float xFac = sRandom(vec2(r, uv.y*0.000001)) * 50.0;
  float yFac = sRandom(vec2(uv.x*0.000001, r)) * 50.0;
    
  vec2 blockFactor = vec2(xFac,yFac);
  float yOff = sin(uv.x * f + yFac) * amplitude;
  
  float glitchProbability = sRandom(floor(uv * blockFactor) * 5.0 + r);
  
  if (glitchProbability < 0.75) {
    return vec2(0.0, yOff);
  }
  return vec2(0.0, 0.0);
}

float randomHaze(vec2 uv, float r) {
  // return 0.0;
  float threshold = 0.025;
  bool row = abs(mod(uv.y*10.0,0.05)) < threshold;
  bool rand = sRandom(uv + 1.0) > 0.3;
  if(row || rand) {
    return 0.0;
  } else {
    //HAZE
    if(sRandom(uv*10.0) > 0.5) {
      return (0.8 - (sRandom(uv) * 2.0)) * 0.06;
    }
    
    //lines
    float xFac = sRandom(vec2(r, r)) * 50.0;
    float yFac = sRandom(vec2(r, uv.y)) * 50.0;

    vec2 blockFactor = vec2(xFac,yFac);
    float len = 0.06;
    return (0.6 - sRandom(floor(uv * blockFactor) + r) * 2.0) * len;
  }
}

vec2 blocks(vec2 uv, float r, float mult, float prob) {
  // return vec2(0.0,0.0);
  float xFac = sRandom(vec2(r, uv.y*0.000001)) * mult;
  float yFac = sRandom(vec2(uv.x*0.000001, r)) * mult;
    
  vec2 blockFactor = vec2(xFac,yFac);
  float randValue = (1.0 - sRandom(floor(uv * blockFactor) + r) * 2.0) * 0.05;
  
  float glitchProbability = sRandom(floor(uv * blockFactor) * 5.0 + r);
  
  vec2 offset = vec2(0.0);

  if (glitchProbability < prob) {
    offset.x = randValue;
  }
  return offset;
}

float opacityBloc(vec2 uv, float r, float mult, float prob) {
  float xFac = sRandom(vec2(r, uv.y*0.000001)) * mult;
  float yFac = sRandom(vec2(uv.x*0.000001, r)) * mult;
    
  vec2 blockFactor = vec2(xFac,yFac);
  float randValue = sRandom(floor(uv * blockFactor) + r);

  float glitchProbability = sRandom(floor(uv * blockFactor) * 5.0 + r);
  

  if (glitchProbability < prob) {
    return randValue;
  }
  return 1.0;
}


void main() {
  mat2 rotationMatrix = mat2(
    cos(uRotation), -sin(uRotation),
    sin(uRotation), cos(uRotation)
  );

  vec2 uv = vTexCoord - 0.5; // Shift the texture coordinates to the origin
  uv *= rotationMatrix; // Rotate the texture coordinates
  uv += 0.5; // Shift the texture coordinates back

  //Blocks
  float blockRan = rando < 0.1 ? rando*4.0 : 0.75;
  vec2 blockOff = blocks(uv, blockRan, 10.0, 0.15) + blocks(uv, blockRan*5.0, 100.0, 0.04) + blocks(uv, blockRan*10.0, 100.0, 0.04);
  uv+= blockOff;

  //Wave
  float WaveRan = rando > 0.75 ? rando : 0.25;
  uv += wave(uv, 700.0, 0.0005, WaveRan) + wave(uv, 100.0, 0.002, WaveRan*5.0);
  
  //Haze
  float HazeRan = rando > 0.75 ? rando : 0.25;
  float rand = randomHaze(uv, HazeRan);
  uv.y += rand;

  vec4 col = texture2D(texture, uv);

  //Opacity
  float timeOff = 1.5 + time * 0.02;
  float opRan = rando < 0.2 ? rando*4.0 : 0.5;
  float opacity = timeOff - opacityBloc(uv, opRan, 2.0, 0.1) - opacityBloc(uv, opRan, 100.0, 0.01) - opacityBloc(uv, opRan, 200.0, 0.04);
  opacity = min(opacity, 1.0);

  gl_FragColor = (col * opacity) + (vec4(12.0/255.0, 10.0/255.0, 9.0/255.0,1.0) * (1.0 - opacity));
}
`;

const MaurerBG: FC<{className?: string}> = ({className}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sketch = (p: p5) => {
    let paintShader: p5.Shader;
    let image: p5.Image;
    let counter: number = 0;
    p.preload = () => { 
      image = p.loadImage("/delux.png")
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      p.frameRate(24)
      //@ts-ignore
      paintShader = new p5.Shader(p._renderer, vertexShader, glitchShader);
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
      counter = 0
    }

  };
  return (
    <div ref={containerRef} className={className}>
      <P5Wrapper sketch={sketch} />
    </div>
  )
}

export default memo(MaurerBG)

