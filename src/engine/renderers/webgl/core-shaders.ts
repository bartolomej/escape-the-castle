export type CoreShaderOptions = {
  numberOfLights: number; // max number of lights
}

export const createVertexShader = ({numberOfLights}: CoreShaderOptions) => {
  // language=GLSL
  return `
#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

// TODO: Should we rename "model" to "world"?
// See: https://webgl2fundamentals.org/webgl/lessons/webgl-matrix-naming.html

uniform vec3 uLightPosition[${numberOfLights}];
uniform mat4 uModel;
uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec3 vVertexViewPosition;
out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;
out vec3 vSurfaceToLight[${numberOfLights}];

void main() {
    vVertexPosition = aPosition;
    vVertexViewPosition = (uViewModel * vec4(aPosition, 1)).xyz;
    // Transform normals to update lightning calculation when vertex is transformed (rotated).
    vNormal = mat3(uModel) * aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewModel * vec4(aPosition, 1);
    
    vec3 surfaceModalPosition = (aPosition * mat3(uModel)).xyz;
    for (int i = 0; i < ${numberOfLights}; i++) {
        vec3 lightModelPosition = uLightPosition[i] * mat3(uModel);
        vSurfaceToLight[i] = lightModelPosition - surfaceModalPosition;
    }

}`.trim()
}


export const createFragmentShader = ({
  numberOfLights
}: CoreShaderOptions) => {
  // language=GLSL
  return `
#version 300 es
precision mediump float;

uniform mat4 uViewModel;
uniform mediump sampler2D uTexture;
uniform vec4 uBaseColorFactor;
uniform mat3 uBaseColorTransform;
uniform vec3 uLightPosition[${numberOfLights}];
uniform vec3 uLightDirection[${numberOfLights}];
uniform vec3 uLightColor[${numberOfLights}];
uniform float uLightIntensity[${numberOfLights}];
uniform int uLightType[${numberOfLights}];

in vec3 vSurfaceToLight[${numberOfLights}];
in vec3 vVertexViewPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

int LIGHT_TYPE_AMBIENT = 0;
int LIGHT_TYPE_DIRECTIONAL = 1;
int LIGHT_TYPE_POINT = 2;

void main() {
    vec3 summedLight = vec3(0, 0, 0);
    
    for (int i = 0; i < ${numberOfLights}; i++) {
        vec3 surfaceNormal = normalize(vNormal);
        int lightType = uLightType[i];
        vec3 light = vec3(0, 0, 0);
        
        if (lightType == LIGHT_TYPE_AMBIENT) {
            light = uLightColor[i]; 
        }
        
        if (lightType == LIGHT_TYPE_DIRECTIONAL) {
            float directionalIntensity = dot(surfaceNormal, uLightDirection[i]);
            light = uLightColor[i] * directionalIntensity;
        }
        
        if (lightType == LIGHT_TYPE_POINT) {
            float distanceToLight = length(vSurfaceToLight[i]);
            float attenuation = 1.0 / (distanceToLight * distanceToLight);
            float directionalIntensity = dot(surfaceNormal, vSurfaceToLight[i]);
            // Ignore negative factors, otherwise this step could take away light from other sources.
            light = uLightColor[i] * max(directionalIntensity, 0.0) * attenuation;
        }
        
        // Temp solution: cap intensity to avoid very bright spots on models.
        summedLight += min(light * uLightIntensity[i], 1.0);
     }
     
    vec2 uvTransformed = (vec3(vTexCoord, 1.0) * uBaseColorTransform).xy;
        
    oColor += texture(uTexture, uvTransformed) * uBaseColorFactor * vec4(summedLight, 1);
}`.trim()
}
