#ifdef GL_ES
    precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;

uniform sampler2D uImage0;

float iShowScanlines = 1.0;
float iBlurSample = 1.0;
float iLight = 5.;

bool iCurvature = true;
bool iFullScreen = true;

float iGamma = 1.0;
float iContrast = 1.0;
float iSaturation = 1.5;
float iBrightness = 1.0;

// post effects colour correct routine by Dave Hostkins on Shadertoy.
vec3 postEffects(in vec3 rgb, in vec2 xy) {
    rgb = pow(rgb, vec3(iGamma));
    rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb*iBrightness)), rgb*iBrightness, iSaturation), iContrast);

    return rgb;
}

// Sigma 1. Size 3
vec3 gaussian(in vec2 uv) {
    float b = iBlurSample / (uResolution.x / uResolution.y);

    uv+= .5;

    vec3 col = texture2D(uImage0, vec2(uv.x - b/uResolution.x, uv.y - b/uResolution.y) ).rgb * 0.077847;
    col += texture2D(uImage0, vec2(uv.x - b/uResolution.x, uv.y) ).rgb * 0.123317;
    col += texture2D(uImage0, vec2(uv.x - b/uResolution.x, uv.y + b/uResolution.y) ).rgb * 0.077847;

    col += texture2D(uImage0, vec2(uv.x, uv.y - b/uResolution.y) ).rgb * 0.123317;
    col += texture2D(uImage0, vec2(uv.x, uv.y) ).rgb * 0.195346;
    col += texture2D(uImage0, vec2(uv.x, uv.y + b/uResolution.y) ).rgb * 0.123317;

    col += texture2D(uImage0, vec2(uv.x + b/uResolution.x, uv.y - b/uResolution.y) ).rgb * 0.077847;
    col += texture2D(uImage0, vec2(uv.x + b/uResolution.x, uv.y) ).rgb * 0.123317;
    col += texture2D(uImage0, vec2(uv.x + b/uResolution.x, uv.y + b/uResolution.y) ).rgb * 0.077847;

    return col;
}

void main() {
    vec2 st = (gl_FragCoord.xy / uResolution.xy) - vec2(.5);

    // Curvature/light
    float d = length(st*.5 * st*.5);
    vec2 uv = st*d + st*.935;

    if (! iCurvature) uv = st;

    // CRT color blur
    vec3 color = gaussian(uv);

    // Light
    float l = 1. - min(1., d*iLight);
    color *= l;

    // Scanlines
    float y = uv.y; // change this to st.y for non-curved scanlines.
	
    float s = 1. - smoothstep(360., 1440., uResolution.y) + 1.;
    float j = cos(y*uResolution.y*s)*.1; // values between .01 to .25 are ok.
    color = abs(iShowScanlines-1.)*color + iShowScanlines*(color - color*j);
    color *= 1. + ( .02 + ceil(mod( (st.x+.5)*uResolution.x, 3.) ) * (.995-1.02) )*iShowScanlines;

    // Border mask
    if (iCurvature) {
        float m = max(0.0, 1. - 2.*max(abs(uv.x), abs(uv.y) ) );
        m = min(m*200., 1.);
        color *= m;
    }

    // Color correction
    color = postEffects(color, st);

    gl_FragColor = vec4(max(vec3(.0), min(vec3(1.), color)), 1.);
}