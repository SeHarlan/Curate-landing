#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D texture;
uniform float noise;
uniform float rando;


float sRandom(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

float randomGlitch(vec2 st) {
  if(sRandom(st+1.0) > 0.25) {
    return 0.0;
  } else {
    return 1.0 - sRandom(st) * 2.0;
  }
}

void main() {
  // gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 1.0, 0.0);
  
  
  
  vec2 uv = vTexCoord;
  float rand = randomGlitch(uv) * 0.05;
  uv.y = 1.0 - uv.y;
  uv.x = uv.x + rand;
  
  
  vec2 offset = vec2(noise, 0.0);
  
  vec4 col;
  col.r = texture2D(texture, uv + offset).r;
  col.g = texture2D(texture, uv).g;
  col.b = texture2D(texture, uv - offset).b;
  col.a = texture2D(texture, uv).a;
  
  gl_FragColor = vec4(col);
}