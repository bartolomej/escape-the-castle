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
  nLights: number; // max number of lights
}

export const createFragmentShader = ({
  nLights
}: CoreFragmentShaderProps) => {
  // GLSL array size must be greater than 0
  nLights = Math.max(nLights, 1);
  // language=GLSL
  return `
#version 300 es
precision mediump float;

uniform mat4 uViewModel;
uniform mediump sampler2D uTexture;
uniform vec3 uAmbientColor[${nLights}];
uniform vec3 uDiffuseColor[${nLights}];
uniform vec3 uSpecularColor[${nLights}];
uniform float uShininess[${nLights}];
uniform vec3 uLightPosition[${nLights}];
uniform vec3 uLightAttenuation[${nLights}];

in vec3 vVertexViewPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = vec4(0.0);
    
    for (int i = 0; i < ${nLights}; i++) {
        vec3 normal = normalize(vNormal);
        vec4 color = vec4(uAmbientColor[i], 1.0);

        // compute the light by taking the dot product
        // of the normal to the light's reverse direction
        float light = dot(normal, vec3(0.0,1.0,0.0));
      
        // Lets multiply just the color portion (not the alpha)
        // by the light
        color.rgb *= light;
        
        oColor += color;
     }
}`.trim()
}
