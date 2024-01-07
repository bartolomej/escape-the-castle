export const createVertexShader = () => {
  // language=GLSL
  return `
#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec3 vVertexViewPosition;
out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vVertexPosition = aPosition;
    vVertexViewPosition = (uViewModel * vec4(aPosition, 1)).xyz;
    // Transform normals to update lightning calculation when vertex is transformed (rotated).
    vNormal = mat3(uModel) * aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewModel * vec4(aPosition, 1);

}`.trim()
}


type CoreFragmentShaderProps = {
  numberOfLights: number; // max number of lights
}

export const createFragmentShader = ({
  numberOfLights
}: CoreFragmentShaderProps) => {
  // GLSL array size must be greater than 0
  numberOfLights = Math.max(numberOfLights, 1);
  // language=GLSL
  return `
#version 300 es
precision mediump float;

uniform mat4 uViewModel;
uniform mediump sampler2D uTexture;
uniform vec3 uLightPosition[${numberOfLights}];
uniform vec3 uLightDirection[${numberOfLights}];
uniform vec3 uLightColor[${numberOfLights}];

in vec3 vVertexViewPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = vec4(0.0);
    
//    oColor = vec4(uLightColor[1], 1);
//    return;
    
    for (int i = 0; i < ${numberOfLights}; i++) {
        vec3 surfaceNormal = normalize(vNormal);
        
        // Ambient
        vec3 ambientLight = uLightColor[i];
        
        // Directional
        float directionalIntensity = dot(surfaceNormal, uLightDirection[i]);
        vec3 directionalLight = uLightColor[i] * directionalIntensity;
        
        vec3 light = (directionalLight + ambientLight);
      
        oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
     }
}`.trim()
}
