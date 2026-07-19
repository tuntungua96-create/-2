(function() {
        'use strict';

        const CONFIG = Object.freeze({
            particle: {
                count: 400000,
                radius: 1.8,
                size: 0.0015,
                blackholeStrength: 8.0,
                spiralSpeed: 0.0,
                shrinkRadius: 0.5,
                attractStrength: 0.0,
                attractFalloff: 0.5,
                attractRadius: 7.0,
                radialForce: 0.0,
                snapStrength: 0.01,
                noiseAmplitude: 0.0,
                yWaveStrength: 0.0,
                originScale: 0.0
            },
            glow: {
                intensity: 1.2
            },
            interaction: {
                strengthSpeed: 0.8,
                releaseSpeed: 0.97
            },
            animation: {
                timeSpeed: 0.001,
                rotationSpeed: 0.0008,
                audioInfluence: 1.0,
                audioVibrate: 0.6,
                audioSizeInfl: 0.6,
                audioDisplacement: 0.0,
                blackholePulseStrength: 0.3
            },
            svg: {
                path: '',
                normalizeScale: 400
            },
            // 形状配置
            shape: {
                type: 'cube',
                cameraDistance: 3
            }
        });

        const SHADERS = {
            vertex: `
                attribute float aRandomSeed;
                uniform float uTime;
                uniform float uRadius;
                uniform vec3 uMouse;
                uniform float uMousePressed;
                uniform float uMouseStrength;
                uniform float uMouseRelease;
                uniform float uRightExplode;
                uniform float uGalaxyFactor;
                 uniform sampler2D uSVGTexture;
                 uniform float uSVGPointCount;
                 uniform float uUseCustomSVG;
                  uniform float uAudioLevel;
                  uniform float uBassLevel;
                   uniform float uMelodyLevel;
                   uniform float uTrebleLevel;
                    uniform float uBeat;
                    uniform float uBeatPhase;
                  uniform float uSpiralSpeed;
                 uniform float uShrinkRadius;
                 uniform float uAttractStrength;
                 uniform float uAttractFalloff;
                 uniform float uAttractRadius;
                 uniform float uRadialForce;
                 uniform float uSnapStrength;
                 uniform float uNoiseAmplitude;
                 uniform float uYWaveStrength;
                 uniform float uOriginScale;
                 uniform float uSize;
                 uniform float uAudioVibrate;
                 uniform float uAudioDisplacement;
                   uniform float uSizeBoost;
                   uniform float uClimax;
                   uniform int uEffectMode;
                  uniform float uEffectIntensity;
                  varying float vDepth;
                  varying float vAlpha;
                  varying float vDistFromCenter;
                    varying float vBassLevel;
                    varying float vMelodyLevel;
                     varying float vTrebleLevel;
                      varying float vBeat;
                      varying float vBeatPhase;
                      varying float vParticleLightPulse;
                     varying float vTime;
                                     varying float vMouseBrightness;
                
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                vec2 sampleSVGPath(float t) {
                    if (uUseCustomSVG < 0.5 || uSVGPointCount < 1.0) return vec2(0.0);
                    float idx = t * (uSVGPointCount - 1.0);
                    int texSize = int(sqrt(uSVGPointCount)) + 1;
                    int x = int(mod(idx, float(texSize)));
                    int y = int(idx / float(texSize));
                    vec4 texData = texelFetch(uSVGTexture, ivec2(x, y), 0);
                    return texData.xy;
                }
                
                void main() {
                    vec3 pos = position;
                    float distFromCenter = length(pos);
                    float normalizedDist = distFromCenter / uRadius;
                    vDistFromCenter = normalizedDist;
                    
                    float edgeFactor = smoothstep(0.6, 1.2, normalizedDist);
                    float posLen = length(pos);
                    vec3 radialDir = posLen > 0.001 ? normalize(pos) : vec3(0.0, 0.0, 1.0);
                    vec3 tangentAxis = abs(radialDir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
                    vec3 tangentDir = normalize(cross(radialDir, tangentAxis));
                    vec3 bitangentDir = cross(radialDir, tangentDir);

                    // 默认保持原始几何；只有用户主动调高参数时才产生形变。
                    if (uNoiseAmplitude > 0.0001) {
                        float surfaceNoise = snoise(pos * 6.0 + uTime * 0.112);
                        float noise1 = snoise(pos * 8.0 + uTime * 0.21 + aRandomSeed * 5.0);
                        float noise2 = snoise(pos * 12.0 - uTime * 0.168 + aRandomSeed * 8.0);
                        float noise3 = snoise(pos * 18.0 + uTime * 0.35);
                        float totalDistortion = edgeFactor * (noise1 * 0.15 + noise2 * 0.1 + noise3 * 0.06) * uNoiseAmplitude;
                        pos += radialDir * totalDistortion;
                        pos += tangentDir * noise2 * edgeFactor * 0.08 * uNoiseAmplitude;
                        pos += bitangentDir * noise3 * edgeFactor * 0.06 * uNoiseAmplitude;
                        pos += radialDir * surfaceNoise * 0.05 * uNoiseAmplitude;
                    }

                    if (uYWaveStrength > 0.0001) {
                        float yWave = sin(uTime * 1.2 + pos.x * 0.8 + pos.z * 0.6) * 0.1;
                        float yNoise = snoise(vec3(pos.x * 0.5, pos.z * 0.5, uTime * 0.15)) * 0.06;
                        pos.y += (yWave + yNoise) * uYWaveStrength;
                    }

                    if (uSpiralSpeed > 0.0001) {
                        float distFactor = max(0.0, 1.0 - normalizedDist);
                        float spiralAngle = length(pos.xz) * uSpiralSpeed + uTime * 0.8;
                        float spiralStrength = distFactor * 0.6 * clamp(uSpiralSpeed / 12.0, 0.0, 1.0);
                        float cosA = cos(spiralAngle * spiralStrength);
                        float sinA = sin(spiralAngle * spiralStrength);
                        pos.xz = vec2(
                            pos.x * cosA - pos.z * sinA,
                            pos.x * sinA + pos.z * cosA
                        );
                    }

                    if (uOriginScale > 0.0001) {
                        float originFactor = max(0.0, 1.0 - length(pos) / uRadius);
                        pos *= 1.0 + originFactor * uOriginScale;
                    }
                    
                    // Point Attract
                    float attractDist = length(pos);
                    float normAttract = clamp(attractDist / uAttractRadius, 0.0, 1.0);
                    float falloff = 1.0 - pow(normAttract, 1.0 / uAttractFalloff);
                    float force = uAttractStrength * falloff;
                    vec3 centerDir = attractDist > 0.001 ? normalize(-pos) : vec3(0.0, 0.0, 0.0);
                    pos += centerDir * force;
                    
                    // Radial Force
                    pos *= (1.0 + uRadialForce);
                    
                    // Effect Modes
                    float effectMix = uEffectIntensity;
                    vec3 originalPos = pos;

                    // Effect 1: 爆炸脉冲
                    if (uEffectMode == 1) {
                        float pulsePhase = sin(uTime * 2.0 + aRandomSeed * 6.28);
                        float pulseNorm = pulsePhase * 0.5 + 0.5;
                        float distNorm = length(pos) / uRadius;
                        vec3 pulseDir = length(pos) > 0.001 ? normalize(pos) : vec3(0.0, 1.0, 0.0);
                        float explosionStrength = pulseNorm * uEffectIntensity * 1.5 * (0.5 + distNorm * 0.5);
                        pos += pulseDir * explosionStrength;
                    }

                    // Effect 2: 波纹扩散
                    if (uEffectMode == 2) {
                        float distFromCenter = length(pos);
                        float ripplePhase = distFromCenter * 4.0 - uTime * 3.0;
                        float ripple = sin(ripplePhase) * exp(-distFromCenter * 0.25) * uEffectIntensity * 1.2;
                        if (length(pos) > 0.001) {
                            pos += normalize(pos) * ripple;
                        }
                        // 波纹方向扰动
                        float twistAngle = sin(uTime * 1.5 + distFromCenter * 2.0) * 0.1 * uEffectIntensity;
                        float cosT = cos(twistAngle);
                        float sinT = sin(twistAngle);
                        pos.xz = mat2(cosT, -sinT, sinT, cosT) * pos.xz;
                    }


                    
                        if (uMouseStrength > 0.01) {
                            vec3 toMouse = pos - uMouse;
                            float distToMouse = length(toMouse);
                            
                            if (distToMouse < 5.0) {
                                // 左键：范围排斥
                                float strength = (1.0 - smoothstep(0.0, 5.0, distToMouse)) * 1.5 * uMouseStrength;
                                vec3 repelDir = normalize(toMouse);
                                pos += repelDir * strength;
                            }
                            
                            float wave1 = sin(uTime * 4.2 + pos.x * 3.0 + aRandomSeed * 6.28) * 0.3;
                            float wave2 = cos(uTime * 3.5 + pos.y * 3.0 + aRandomSeed * 3.14) * 0.24;
                            float wave3 = sin(uTime * 5.6 + pos.z * 3.0 + aRandomSeed * 9.42) * 0.18;
                            
                            pos.x += wave1 * uMouseStrength;
                            pos.y += wave2 * uMouseStrength;
                            pos.z += wave3 * uMouseStrength;
                            
                            float jump = sin(uTime * 7.0 + aRandomSeed * 12.56) * 0.36 * uMouseStrength;
                            pos.y += jump;
                        }
                        
                        
                    if (uMouseRelease > 0.01) {
                        float posLen2 = length(pos);
                        vec3 outwardDir = posLen2 > 0.001 ? normalize(pos) : vec3(0.0, 1.0, 0.0);
                        float bounceAmount = uMouseRelease * 0.5;
                        float bounceNoise = snoise(pos * 8.0 + uTime * 2.8) * 0.1;
                        pos += outwardDir * bounceAmount * (1.0 + bounceNoise);
                    }
                        
                    // 音乐只做等比呼吸，不再对单个粒子施加方向不同的位移。
                    if (uAudioLevel > 0.01 || uBeat > 0.1) {
                        float beatEnvelope = exp(-uBeatPhase * 7.0);
                        float shapeBreath = (uBassLevel * 0.018 + uBeat * beatEnvelope * 0.025) * uAudioVibrate;
                        pos *= 1.0 + shapeBreath;

                        if (uAudioDisplacement > 0.0001) {
                            float displacementAmount = uAudioDisplacement * uAudioVibrate;
                            float bassNoise = snoise(vec3(position * 15.0 + uTime * 6.0 + aRandomSeed * 40.0));
                            pos += radialDir * bassNoise * (uBassLevel * 0.18 + uBeat * beatEnvelope * 0.12) * displacementAmount;
                            float melodyOffset = sin(uTime * 1.2 + aRandomSeed * 12.0 + normalizedDist * 5.0) * uMelodyLevel * 0.12 * displacementAmount;
                            pos += tangentDir * melodyOffset;
                            pos += bitangentDir * melodyOffset * 0.6;
                            float trebleOffset = snoise(vec3(position * 25.0 + uTime * 12.0 + aRandomSeed * 60.0)) * uTrebleLevel * 0.08 * displacementAmount;
                            pos += radialDir * trebleOffset;
                        }
                    }
                        
                        // 4. 大小变化 - 粒子大小随音乐动态改变（在下方处理）
                        
                        // 几何回正（卡在几何线条上）
                        pos += (position - pos) * uSnapStrength;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    float size = uSize;
                    
                    float randomSize = 0.9 + aRandomSeed * 0.2;
                    size *= randomSize;

                    // 光只作用于粒子颜色：从中心向外扫过，不改变粒子大小或位置。
                    float lightProgress = clamp(uBeatPhase * 1.35, 0.0, 1.0);
                    float lightRadius = lightProgress * 1.82;
                    float lightJitter = sin(aRandomSeed * 83.0 + normalizedDist * 48.0 - uBeatPhase * 24.0) * 0.018;
                    float lightWave = exp(-abs(normalizedDist - lightRadius + lightJitter) * 24.0);
                    float lightGate = step(0.012, uBeat);
                    float lightEnvelope = lightGate * max(uBeat, exp(-uBeatPhase * 2.2));
                    vParticleLightPulse = lightWave * lightEnvelope;

                    size *= (1.0 + uSizeBoost + uClimax * 0.5);
                    
                    float perspectiveScale = 1500.0;
                    gl_PointSize = size * perspectiveScale;
                    gl_PointSize = clamp(gl_PointSize, 0.5, 15.0);
                    
                    vDepth = (-mvPosition.z + 8.0) / 16.0;
                    
                    vAlpha = 1.0;
                    float finalDist = length(pos);
                    float blackholeRadius = uShrinkRadius * 2.5;
                    if (finalDist < blackholeRadius) {
                        vAlpha = smoothstep(0.0, blackholeRadius, finalDist) * 0.9 + 0.1;
                    }
                    
                    vBassLevel = uBassLevel;
                    vMelodyLevel = uMelodyLevel;
                    vTrebleLevel = uTrebleLevel;
                    vBeat = uBeat;
                    vBeatPhase = uBeatPhase;
                    vTime = uTime;
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragment: `
                uniform float uBrightnessBase;
                uniform float uGlowIntensity;
                uniform vec3 uGlowColor;
                uniform float uClimax;
                uniform vec3 uParticleColor;
                varying float vDepth;
                varying float vAlpha;
                varying float vDistFromCenter;
                varying float vBassLevel;
                varying float vMelodyLevel;
                varying float vTrebleLevel;
                varying float vBeat;
                varying float vBeatPhase;
                varying float vParticleLightPulse;
                varying float vTime;
                varying float vMouseBrightness;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    // 柔和边缘 - 使用高斯衰减
                    float softEdge = exp(-dist * dist * 40.0);
                    
                    // 核心区域
                    float core = smoothstep(0.25, 0.0, dist);
                    
                    // 边缘衰减
                    float alpha = softEdge * vAlpha;
                    if (alpha < 0.01) discard;
                    
                     // ─── 各频段对颜色的贡献 ───
                     // 节拍 → 亮度爆发
                     float beatBright = vBeat * 1.5;
                     // 低频 → 暖色脉冲
                     float bassWarmth = vBassLevel * 0.8;
                      // 中频 → 持续亮度
                      float melodyGlow = vMelodyLevel * 0.6;
                     // 高频 → 闪烁光泽
                     float trebleSparkle = vTrebleLevel * 0.6 * (sin(vTime * 25.0 + vDistFromCenter * 10.0) * 0.5 + 0.5);

                     // 鼓点触发式发光 - 只有节拍/低频时才亮
                     float drumPulse = vBeat * 2.5 + vBassLevel * 2.0;
                     float beatGate = smoothstep(0.3, 1.5, drumPulse);
                     float waveProgress = vBeatPhase;
                     float waveR1 = waveProgress * 2.0 + 0.15;
                     float waveR2 = max(0.0, (waveProgress - 0.12) / 0.88) * 2.0 + 0.15;
                     float lp1 = 0.0, lp2 = 0.0;
                     if (vDistFromCenter < waveR1) {
                         lp1 = max(0.0, min(1.0, (waveR1 - vDistFromCenter) / 0.5));
                         lp1 = 1.0 - pow(1.0 - lp1, 2.0);
                     }
                     if (vDistFromCenter < waveR2) {
                         lp2 = max(0.0, min(1.0, (waveR2 - vDistFromCenter) / 0.45));
                         lp2 = 1.0 - pow(1.0 - lp2, 2.0);
                     }
                     float waveGlow = max(lp1 * 0.5, lp2 * 0.4);
                     float currentGlow = waveGlow * (0.6 + drumPulse * beatGate * 2.5) * 0.8;
                    
                    vec3 baseColor = uParticleColor;
                    
                    float depthFade = clamp(1.0 - vDepth * 0.3, 0.5, 1.0);
                    
                    vec3 innerColor = baseColor * 2.5;
                    vec3 outerColor = baseColor * 2.0;
                    vec3 color = mix(innerColor, outerColor, 1.0 - core);
                    color *= depthFade;
                    
                    // 边缘暗化
                    color *= (1.0 - vDistFromCenter * 0.25);
                    
                    float brightness = uBrightnessBase;
                    color *= brightness;
                    
                    // 螺旋纹理可见度增强
                    float spiralPattern = sin(vDistFromCenter * 20.0 - vTime * 0.5);
                    spiralPattern = smoothstep(-0.3, 0.7, spiralPattern);
                    color *= (0.3 + spiralPattern * 0.7);
                    
                    color *= (1.0 + vMouseBrightness * 2.0);
                    
                    float blackHole = smoothstep(0.1, 0.0, dist);
                    color = mix(color, vec3(0.0), blackHole * 0.3);
                    
                    float totalBoost = min(1.0 + beatBright + bassWarmth + melodyGlow + trebleSparkle + uClimax * 1.0, 1.6);
                    color *= totalBoost;
                    color *= uGlowIntensity;
                    color += uGlowColor * currentGlow;

                    // 仅给粒子增加蓝白受光，不改变尺寸和透明度。
                    vec3 pulseLightColor = mix(uGlowColor, vec3(0.78, 0.91, 1.0), 0.62);
                    color += pulseLightColor * vParticleLightPulse * 1.65;

                    gl_FragColor = vec4(color, alpha);
                }
            `,
            burstVertex: `
                attribute vec3 aTargetPos;
                attribute float aDelay;
                attribute float aRandomSeed;
                uniform float uTime;
                uniform float uBurstTime;
                uniform float uBurstDuration;
                uniform float uSize;
                uniform float uAudioLevel;
                uniform float uBassLevel;
                uniform float uBeat;
                uniform float uAudioVibrate;
                varying float vAlpha;
                void main() {
                    float elapsed = uTime - uBurstTime;
                    float delay = aDelay;
                    float duration = uBurstDuration;
                    float progress = clamp((elapsed - delay) / duration, 0.0, 1.0);
                    vec3 pos = mix(position, aTargetPos, progress);
                    if (uAudioLevel > 0.01 || uBeat > 0.1) {
                        vec3 radialDir = normalize(pos);
                        float vibAmount = sin(uTime * 6.0 + aRandomSeed * 40.0) * (uBassLevel * 0.8 + uBeat * 0.5) * uAudioVibrate;
                        pos += radialDir * vibAmount;
                        float zPulse = (uBassLevel * 0.8 + uBeat * 0.5) * uAudioVibrate * sin(uTime * 1.68);
                        pos.z += zPulse;
                    }
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float s = uSize * 1500.0 * (0.8 + aRandomSeed * 0.4) * (1.0 - progress * 0.6);
                    gl_PointSize = clamp(s, 0.5, 15.0);
                    gl_Position = projectionMatrix * mvPosition;
                    vAlpha = 1.0 - progress;
                }
            `,
            burstFragment: `
                varying float vAlpha;
                uniform vec3 uColor;
                void main() {
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    float r = dot(cxy, cxy);
                    if (r > 1.0) discard;
                    float alpha = (1.0 - r) * vAlpha;
                    gl_FragColor = vec4(uColor, alpha);
                }
            `
        };

            class AudioEngine {
                constructor() {
                    this.audioCtx = null;
                    this.analyser = null;
                    this.dataArray = new Uint8Array(0);
                    this.currentNormalizedData = new Float32Array(0);
                    this.prevNormalizedData = new Float32Array(0);
                    this.fluxHistory = [];
                    this.maxHistoryMs = 900;
                    this.lastBeatTime = 0;
                    this.minBeatInterval = 150;
                    this.thresholdMultiplier = 3.2;
                    this.beatStrength = 0;
                    this.beatIntervals = [];
                    this.beatInterval = 500;
                    this.beatPhase = 0;
                    this.lastUpdateTime = performance.now();
                    this.peakEnergy = 0.12;
                    this.autoGain = 1;
                    this.binHz = 0;
                    this.BAND_LIMITS = [20, 60, 250, 500, 2000, 4000, 6000, 12000, 20000];
                    this.bandIndices = [];
                }

                async init(audioElement) {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    this.analyser = this.audioCtx.createAnalyser();
                    this.analyser.fftSize = 2048;
                    this.analyser.smoothingTimeConstant = 0.42;
                    this.analyser.minDecibels = -95;
                    this.analyser.maxDecibels = -15;
                    const bufferLength = this.analyser.frequencyBinCount;
                    this.dataArray = new Uint8Array(bufferLength);
                    this.currentNormalizedData = new Float32Array(bufferLength);
                    this.prevNormalizedData = new Float32Array(bufferLength);
                    this.calculateBandIndices(this.audioCtx.sampleRate);
                    const source = this.audioCtx.createMediaElementSource(audioElement);
                    source.connect(this.analyser);
                    this.analyser.connect(this.audioCtx.destination);
                }

                calculateBandIndices(sampleRate) {
                    const fftSize = this.analyser.fftSize;
                    this.binHz = sampleRate / fftSize;
                    this.bandIndices = [];
                    for (let i = 0; i < this.BAND_LIMITS.length - 1; i++) {
                        let startBin = Math.max(1, Math.floor(this.BAND_LIMITS[i] / this.binHz));
                        let endBin = Math.min(this.analyser.frequencyBinCount, Math.ceil(this.BAND_LIMITS[i + 1] / this.binHz));
                        if (startBin >= endBin) endBin = Math.min(this.analyser.frequencyBinCount, startBin + 1);
                        this.bandIndices.push({ start: startBin, end: endBin });
                    }
                }

                update() {
                    if (!this.analyser) return null;
                    const currentTime = performance.now();
                    const deltaTime = Math.min(0.1, Math.max(0.001, (currentTime - this.lastUpdateTime) / 1000));
                    this.lastUpdateTime = currentTime;
                    this.analyser.getByteFrequencyData(this.dataArray);
                    const currentNormalized = this.currentNormalizedData;
                    for (let i = 0; i < this.dataArray.length; i++) {
                        currentNormalized[i] = this.dataArray[i] / 255;
                    }
                    let bandValues = this.bandIndices.map(range => {
                        let sum = 0;
                        for (let i = range.start; i < range.end; i++) {
                            sum += currentNormalized[i];
                        }
                        return sum / (range.end - range.start);
                    });

                    // 慢速自动增益：不同音乐文件的整体音量不同，也能保持接近的视觉幅度。
                    const rawEnergy = bandValues.reduce((sum, value) => sum + value, 0) / bandValues.length;
                    this.peakEnergy = Math.max(rawEnergy, this.peakEnergy * Math.exp(-deltaTime / 3));
                    const targetGain = Math.max(0.75, Math.min(2.2, 0.38 / Math.max(0.08, this.peakEnergy)));
                    this.autoGain += (targetGain - this.autoGain) * (1 - Math.exp(-deltaTime / 1.2));
                    bandValues = bandValues.map(value => Math.min(1, value * this.autoGain));

                    // 40Hz–5kHz 的正向频谱通量。低频权重略高，让底鼓更容易形成清晰起音。
                    let currentFlux = 0;
                    let fluxWeight = 0;
                    const detectionStart = Math.max(1, Math.floor(40 / this.binHz));
                    const detectionEnd = Math.min(currentNormalized.length, Math.ceil(5000 / this.binHz));
                    for (let i = detectionStart; i < detectionEnd; i++) {
                        const diff = currentNormalized[i] - this.prevNormalizedData[i];
                        const frequency = i * this.binHz;
                        const weight = frequency < 280 ? 1.35 : (frequency < 2000 ? 1 : 0.65);
                        fluxWeight += weight;
                        if (diff > 0) {
                            currentFlux += diff * weight;
                        }
                    }
                    currentFlux = fluxWeight > 0 ? currentFlux / fluxWeight : 0;

                    // 使用最近 900ms 的中位数与 MAD 作为自适应阈值，减少持续响亮段落的误触发。
                    this.fluxHistory = this.fluxHistory.filter(item => currentTime - item.time <= this.maxHistoryMs);
                    let isBeat = false;
                    let adaptiveThreshold = 0.003;
                    if (this.fluxHistory.length >= 10) {
                        const values = this.fluxHistory.map(item => item.value).sort((a, b) => a - b);
                        const median = values[Math.floor(values.length / 2)];
                        const deviations = values.map(value => Math.abs(value - median)).sort((a, b) => a - b);
                        const mad = deviations[Math.floor(deviations.length / 2)];
                        adaptiveThreshold = median + Math.max(0.0015, mad * this.thresholdMultiplier);
                        if (currentFlux > adaptiveThreshold && currentFlux > 0.003 && (currentTime - this.lastBeatTime) > this.minBeatInterval) {
                            isBeat = true;
                            const interval = this.lastBeatTime > 0 ? currentTime - this.lastBeatTime : 0;
                            if (interval > 0 && interval < 1500) {
                                let normalizedInterval = interval;
                                while (normalizedInterval < 333) normalizedInterval *= 2;
                                while (normalizedInterval > 857) normalizedInterval /= 2;
                                if (normalizedInterval >= 333 && normalizedInterval <= 857) {
                                    this.beatIntervals.push(normalizedInterval);
                                    if (this.beatIntervals.length > 8) this.beatIntervals.shift();
                                    const sortedIntervals = this.beatIntervals.slice().sort((a, b) => a - b);
                                    this.beatInterval = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
                                }
                            }
                            this.lastBeatTime = currentTime;
                            this.beatStrength = Math.max(0.65, Math.min(1, currentFlux / Math.max(adaptiveThreshold * 2.2, 0.006)));
                        }
                    }
                    this.fluxHistory.push({ value: currentFlux, time: currentTime });
                    this.prevNormalizedData.set(currentNormalized);
                    this.beatPhase = this.lastBeatTime > 0 ? ((currentTime - this.lastBeatTime) / this.beatInterval) % 1 : 0;
                    return {
                        bands: {
                            subBass: bandValues[0],
                            bass: bandValues[1],
                            lowMid: bandValues[2],
                            mid: bandValues[3],
                            highMid: bandValues[4],
                            presence: bandValues[5],
                            brilliance: bandValues[6],
                            air: bandValues[7]
                        },
                        isBeat: isBeat,
                        beatStrength: isBeat ? this.beatStrength : 0,
                        beatPhase: this.beatPhase
                    };
                }
            }

            class ParticleSystem {
            constructor() {
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.points = null;
                this.mouse = { x: 0, y: 0, isPressed: false, button: -1, lastButton: -1, pressEffective: false };
                this.mousePressStart = 0;
                this.mouseHoldDuration = 0;
                this.mouseTarget = { x: 0, y: 0 };
                this.mouseCurrent = { x: 0, y: 0 };
                this.wasPressed = false;
                this.releaseAnim = 0;
                this.rightHoldTime = 0;
                this.rightExplodeAnim = 0;
                this.rightHasExploded = false;
                this.svgTexture = null;
                this.time = 0;
                this.audioLevel = 0;
                this.bassLevel = 0;
                this.melodyLevel = 0;
                this.trebleLevel = 0;
                this.beatValue = 0;
                this.beatStrength = 0;
                this.beatPhase = 0;
                this.justBeat = false;
                this.baseTimeSpeed = CONFIG.animation.timeSpeed;
                this.frameCount = 0;
                this.lastFpsTime = performance.now();
                this.fps = 60;
                this.frameTime = 0;
                this.rotationDir = 1;
                this.rotationImpulse = 0;
                this.lastUpdateTime = performance.now();
                this.cameraZoomTarget = 3.0;
                this.cameraZoomMin = 0.0001;
                this.cameraZoomMax = 100.0;
                // 音频引擎（由 loadMusic 自动初始化）
                this.audioEngine = null;
            }

            followEnvelope(current, target, attackSeconds, releaseSeconds, deltaTime) {
                const timeConstant = target > current ? attackSeconds : releaseSeconds;
                const amount = 1 - Math.exp(-deltaTime / Math.max(0.001, timeConstant));
                return current + (target - current) * amount;
            }

            updateAudioLevel(deltaTime = 1 / 60) {
                this.justBeat = false;
                if (this.audioEngine && this.audioEngine.audioCtx && this.audioEngine.audioCtx.state === 'suspended') {
                    this.audioEngine.audioCtx.resume().catch(e => {
                        console.warn('Failed to resume audio engine context:', e);
                    });
                }

                // 优先使用 AudioEngine（文件音乐播放）
                let result = null;
                if (this.audioEngine) {
                    result = this.audioEngine.update();
                }

                if (result) {
                    const b = result.bands;
                    // ─── 8 频带 → 4 能量维度的映射 ───
                    // subBass (20-60Hz) + bass (60-250Hz) → 低频冲击
                    const newBass = (b.subBass + b.bass) / 2;
                    this.bassLevel = this.followEnvelope(this.bassLevel, newBass, 0.025, 0.18, deltaTime);

                    // lowMid (250-500Hz) + mid (500-2000Hz) + highMid (2000-4000Hz) → 中频旋律
                    const newMelody = (b.lowMid + b.mid + b.highMid) / 3;
                    this.melodyLevel = this.followEnvelope(this.melodyLevel, newMelody, 0.055, 0.28, deltaTime);

                    // presence (4000-6000Hz) + brilliance (6000-12000Hz) + air (12000-20000Hz) → 高频光泽
                    const newTreble = (b.presence + b.brilliance + b.air) / 3;
                    this.trebleLevel = this.followEnvelope(this.trebleLevel, newTreble, 0.012, 0.09, deltaTime);

                    // 全频平均 → 全局能量
                    const newLevel = (b.subBass + b.bass + b.lowMid + b.mid + b.highMid + b.presence + b.brilliance + b.air) / 8;
                    this.audioLevel = this.followEnvelope(this.audioLevel, newLevel, 0.04, 0.24, deltaTime);

                    // 鼓点瞬间起跳、约 150ms 回落；不再受显示器帧率影响。
                    this.justBeat = result.isBeat;
                    this.beatStrength = result.isBeat ? result.beatStrength : this.beatStrength;
                    const beatTarget = result.isBeat ? Math.max(0.75, result.beatStrength || 0) : 0;
                    this.beatValue = this.followEnvelope(this.beatValue, beatTarget, 0.006, 0.15, deltaTime);
                    this.beatPhase = result.beatPhase || 0;
                } else {
                    this.audioLevel = this.followEnvelope(this.audioLevel, 0, 0.04, 0.18, deltaTime);
                    this.bassLevel = this.followEnvelope(this.bassLevel, 0, 0.025, 0.16, deltaTime);
                    this.melodyLevel = this.followEnvelope(this.melodyLevel, 0, 0.055, 0.22, deltaTime);
                    this.trebleLevel = this.followEnvelope(this.trebleLevel, 0, 0.012, 0.08, deltaTime);
                    this.beatValue = this.followEnvelope(this.beatValue, 0, 0.006, 0.12, deltaTime);
                    this.beatPhase = 0;
                }
            }

            init() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0001, 1000);
                
                const defaultDistance = CONFIG.shape.cameraDistance;
                this.camera.position.z = defaultDistance;
                this.defaultCameraZ = defaultDistance;

                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                this.renderer.setClearColor(0x000000, 0);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                document.getElementById('canvas-container').appendChild(this.renderer.domElement);

                this.createParticles();
                this.initSVGPath(CONFIG.svg.path);
                this.bindEvents();
                
                // 添加WebGL上下文丢失和恢复事件监听器
                this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
                    e.preventDefault();
                    this.handleContextLost();
                });
                this.renderer.domElement.addEventListener('webglcontextrestored', () => {
                    this.handleContextRestored();
                });
                
                this.isContextLost = false;
                
                // 初始化鼠标状态
                this.mouse = {
                    x: 0,
                    y: 0,
                    isPressed: false,
                    button: -1,
                    lastButton: -1,
                    pressEffective: false
                };
                this.mousePressStart = 0;
                this.mouseHoldDuration = 0;
                this.mouseTarget = { x: 0, y: 0 };
                this.mouseCurrent = { x: 0, y: 0 };
                this.wasPressed = false;
                this.releaseAnim = 0;
                this.sizeBoost = 0;
                this.climax = 0;
                this.avgAudioEnergy = 0;
                this.rotationImpulse = 0;
                this.lastUpdateTime = performance.now();
                this.rightHoldTime = 0;
                this.rightExplodeAnim = 0;
                this.rightHasExploded = false;
            }

            // 加载音乐文件
            loadMusic(url) {
                console.log('loadMusic called with:', url);
                const audioEl = document.getElementById('bgMusic');
                audioEl.src = url;
                audioEl.load();
                const initEngine = () => {
                    if (this.audioEngine && this.audioEngine.analyser) {
                        this.audioEngine.fluxHistory = [];
                        this.audioEngine.prevNormalizedData.fill(0);
                        this.audioEngine.lastBeatTime = 0;
                        return;
                    }
                    if (!this.audioEngine) {
                        this.audioEngine = new AudioEngine();
                    }
                    this.audioEngine.init(audioEl).then(() => {
                        console.log('AudioEngine initialized');
                    }).catch(e => console.error('AudioEngine init error:', e));
                };
                audioEl.oncanplaythrough = initEngine;
                if (audioEl.readyState >= 3) initEngine();
                console.log('Music loaded successfully');
            }

            // 播放/暂停音乐
            toggleMusic() {
                const audioEl = document.getElementById('bgMusic');
                if (!audioEl.src || audioEl.src === window.location.href || audioEl.readyState === 0) {
                    console.log('No music loaded');
                    return;
                }
                
                if (audioEl.paused) {
                    if (this.audioEngine && this.audioEngine.audioCtx && this.audioEngine.audioCtx.state === 'suspended') {
                        this.audioEngine.audioCtx.resume();
                    }
                    if (audioEl.ended) audioEl.currentTime = 0;
                    audioEl.play().catch(e => console.error('Playback error:', e));
                    return true;
                } else {
                    audioEl.pause();
                    return false;
                }
            }

            // 生成当前 3D 粒子形状
            getShapePosition(type, radius) {
                let x = 0, y = 0, z = 0;

                switch (type) {
                    case 'vortex': {
                        // 星门涡旋：五条弯曲星臂围绕高密度核心旋转。
                        if (Math.random() < 0.18) {
                            const coreRadius = radius * 0.3 * Math.cbrt(Math.random());
                            const cosTheta = Math.random() * 2.0 - 1.0;
                            const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);
                            const phi = Math.random() * Math.PI * 2.0;
                            x = coreRadius * sinTheta * Math.cos(phi);
                            y = coreRadius * sinTheta * Math.sin(phi);
                            z = coreRadius * cosTheta;
                        } else {
                            const armCount = 5;
                            const arm = Math.floor(Math.random() * armCount);
                            const radialT = Math.pow(Math.random(), 0.58);
                            const radialDistance = radius * (0.16 + radialT * 0.84);
                            const armAngle = arm * Math.PI * 2.0 / armCount;
                            const spiralAngle = radialT * Math.PI * 3.8;
                            const armSpread = (Math.random() - 0.5) * (0.24 + radialT * 0.42);
                            const angle = armAngle + spiralAngle + armSpread;
                            const discHeight = radius * (0.07 + (1.0 - radialT) * 0.2);
                            x = Math.cos(angle) * radialDistance;
                            y = Math.sin(angle) * radialDistance;
                            z = (Math.random() - 0.5) * discHeight * 2.0;
                        }
                        break;
                    }

                    case 'crystal': {
                        // 星核晶簇：18 根不同长度的四棱晶体从中心向三维空间放射。
                        const spikeCount = 18;
                        const spike = Math.floor(Math.random() * spikeCount);
                        const goldenAngle = Math.PI * (3.0 - Math.sqrt(5.0));
                        const directionY = 1.0 - 2.0 * (spike + 0.5) / spikeCount;
                        const directionRadius = Math.sqrt(1.0 - directionY * directionY);
                        const directionAngle = spike * goldenAngle;
                        const directionX = Math.cos(directionAngle) * directionRadius;
                        const directionZ = Math.sin(directionAngle) * directionRadius;
                        const lengthVariation = 0.82 + 0.28 * (0.5 + 0.5 * Math.sin((spike + 1) * 12.9898));
                        const spikeLength = radius * lengthVariation;
                        const along = Math.pow(Math.random(), 0.72);
                        const distance = along * spikeLength;
                        const halfWidth = radius * (0.014 + 0.15 * Math.pow(1.0 - along, 0.72));

                        let basisUX, basisUY, basisUZ;
                        if (Math.abs(directionY) < 0.9) {
                            const inverseLength = 1.0 / Math.sqrt(directionX * directionX + directionZ * directionZ);
                            basisUX = -directionZ * inverseLength;
                            basisUY = 0;
                            basisUZ = directionX * inverseLength;
                        } else {
                            const inverseLength = 1.0 / Math.sqrt(directionY * directionY + directionZ * directionZ);
                            basisUX = 0;
                            basisUY = directionZ * inverseLength;
                            basisUZ = -directionY * inverseLength;
                        }
                        const basisVX = directionY * basisUZ - directionZ * basisUY;
                        const basisVY = directionZ * basisUX - directionX * basisUZ;
                        const basisVZ = directionX * basisUY - directionY * basisUX;
                        const facet = Math.floor(Math.random() * 4);
                        const facetOffset = (Math.random() * 2.0 - 1.0) * halfWidth;
                        const offsetU = facet < 2 ? (facet === 0 ? halfWidth : -halfWidth) : facetOffset;
                        const offsetV = facet >= 2 ? (facet === 2 ? halfWidth : -halfWidth) : facetOffset;

                        x = directionX * distance + basisUX * offsetU + basisVX * offsetV;
                        y = directionY * distance + basisUY * offsetU + basisVY * offsetV;
                        z = directionZ * distance + basisUZ * offsetU + basisVZ * offsetV;
                        break;
                    }

                    case 'cube':
                    default: {
                        const cubeSize = radius * 2.0;
                        const face = Math.floor(Math.random() * 6);
                        const s = cubeSize / 2;
                        const u = (Math.random() - 0.5) * cubeSize;
                        const v = (Math.random() - 0.5) * cubeSize;
                        if (face === 0) { x = s; y = u; z = v; }
                        else if (face === 1) { x = -s; y = u; z = v; }
                        else if (face === 2) { x = u; y = s; z = v; }
                        else if (face === 3) { x = u; y = -s; z = v; }
                        else if (face === 4) { x = u; y = v; z = s; }
                        else { x = u; y = v; z = -s; }
                        break;
                    }
                }
                
                return { x, y, z };
            }

            createParticles() {
                const { count, radius } = CONFIG.particle;
                const positions = new Float32Array(count * 3);
                const randoms = new Float32Array(count);

                for (let i = 0; i < count; i++) {
                    const pos = this.getShapePosition(CONFIG.shape.type, radius);
                    positions[i * 3] = pos.x;
                    positions[i * 3 + 1] = pos.y;
                    positions[i * 3 + 2] = pos.z;
                    
                    randoms[i] = Math.random();
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('aRandomSeed', new THREE.BufferAttribute(randoms, 1));

                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        uTime: { value: 0 },
                        uRadius: { value: radius },
                        uMouse: { value: new THREE.Vector3(0, 0, 0) },
                        uMousePressed: { value: 0 },
                        uMouseStrength: { value: 0 },
                        uMouseRelease: { value: 0 },
                        uRightExplode: { value: 0 },
                        uGalaxyFactor: { value: 0 },
                        uSVGTexture: { value: null },
                        uSVGPointCount: { value: 0 },
                        uUseCustomSVG: { value: 0 },
                        uAudioLevel: { value: 0 },
                        uBassLevel: { value: 0 },
                        uMelodyLevel: { value: 0 },
                        uTrebleLevel: { value: 0 },
                        uBeat: { value: 0 },
                        uBeatPhase: { value: 0 },
                        uBlackholePulse: { value: 0 },
                        uSizeBoost: { value: 0 },
                        uClimax: { value: 0 },
                        uSpiralSpeed: { value: CONFIG.particle.spiralSpeed },
                        uShrinkRadius: { value: CONFIG.particle.shrinkRadius },
                        uAttractStrength: { value: CONFIG.particle.attractStrength },
                        uAttractFalloff: { value: CONFIG.particle.attractFalloff },
                        uAttractRadius: { value: CONFIG.particle.attractRadius },
                        uRadialForce: { value: CONFIG.particle.radialForce },
                        uSnapStrength: { value: CONFIG.particle.snapStrength },
                        uNoiseAmplitude: { value: CONFIG.particle.noiseAmplitude },
                        uYWaveStrength: { value: CONFIG.particle.yWaveStrength },
                        uOriginScale: { value: CONFIG.particle.originScale },
                        uSize: { value: CONFIG.particle.size },
                        uAudioVibrate: { value: CONFIG.animation.audioVibrate },
                        uAudioDisplacement: { value: CONFIG.animation.audioDisplacement },
                        uEffectMode: { value: 0 },
                        uEffectIntensity: { value: 0 },
                        uBrightnessBase: { value: 2.5 },
                        uGlowIntensity: { value: 1.0 },
                        uGlowColor: { value: new THREE.Color(0.0353, 0.2157, 0.3843) },
                        uParticleColor: { value: new THREE.Color(0.0353, 0.2157, 0.3843) }
                    },
                    vertexShader: SHADERS.vertex,
                    fragmentShader: SHADERS.fragment,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                this.points = new THREE.Points(geometry, material);
                this.scene.add(this.points);
                console.log('Particles created:', count);
                
                this.initBurstParticles();
            }

            initBurstParticles() {
                const BURST_COUNT = 1500;
                this.burstCount = BURST_COUNT;
                this.burstParticles = [];
                for (let b = 0; b < 3; b++) {
                    const burstGeo = new THREE.BufferGeometry();
                    const positions = new Float32Array(BURST_COUNT * 3);
                    const targets = new Float32Array(BURST_COUNT * 3);
                    const delays = new Float32Array(BURST_COUNT);
                    const seeds = new Float32Array(BURST_COUNT);
                    for (let i = 0; i < BURST_COUNT; i++) {
                        seeds[i] = Math.random();
                        delays[i] = 0;
                    }
                    burstGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    burstGeo.setAttribute('aTargetPos', new THREE.BufferAttribute(targets, 3));
                    burstGeo.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));
                    burstGeo.setAttribute('aRandomSeed', new THREE.BufferAttribute(seeds, 1));

                    const burstMat = new THREE.ShaderMaterial({
                        uniforms: {
                            uTime: { value: 0 },
                            uBurstTime: { value: -10 },
                            uBurstDuration: { value: 2.0 },
                            uSize: { value: CONFIG.particle.size },
                            uColor: { value: new THREE.Color(0.0353, 0.2157, 0.3843) },
                            uAudioLevel: { value: 0 },
                            uBassLevel: { value: 0 },
                            uBeat: { value: 0 },
                            uAudioVibrate: { value: CONFIG.animation.audioVibrate }
                        },
                        vertexShader: SHADERS.burstVertex,
                        fragmentShader: SHADERS.burstFragment,
                        transparent: true,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    });

                    const bp = new THREE.Points(burstGeo, burstMat);
                    bp.visible = false;
                    bp.frustumCulled = false;
                    bp.renderOrder = 1;
                    this.scene.add(bp);
                    this.burstParticles.push(bp);
                }
            }

            triggerBurst(worldPos) {
                // 隐藏所有旧爆发，找一个不可见的系统使用
                let useIdx = -1;
                for (let b = 0; b < this.burstParticles.length; b++) {
                    const bp = this.burstParticles[b];
                    if (bp.visible) {
                        bp.visible = false;
                    } else if (useIdx === -1) {
                        useIdx = b;
                    }
                }
                if (useIdx === -1) useIdx = 0;
                const bp = this.burstParticles[useIdx];
                const posArray = bp.geometry.attributes.position.array;
                const targetArray = bp.geometry.attributes.aTargetPos.array;
                const R = CONFIG.particle.radius;

                for (let i = 0; i < this.burstCount; i++) {
                    const idx = i * 3;
                    const scatter = 1.5;
                    let sx, sy, sz;
                    do {
                        sx = (Math.random() - 0.5) * 2;
                        sy = (Math.random() - 0.5) * 2;
                        sz = (Math.random() - 0.5) * 2;
                    } while (sx*sx + sy*sy + sz*sz > 1);
                    posArray[idx] = worldPos.x + sx * scatter;
                    posArray[idx + 1] = worldPos.y + sy * scatter;
                    posArray[idx + 2] = worldPos.z + sz * scatter;

                    const shapePos = this.getShapePosition(CONFIG.shape.type, R);
                    targetArray[idx] = shapePos.x;
                    targetArray[idx + 1] = shapePos.y;
                    targetArray[idx + 2] = shapePos.z;
                }
                bp.geometry.attributes.position.needsUpdate = true;
                bp.geometry.attributes.aTargetPos.needsUpdate = true;
                bp.material.uniforms.uBurstTime.value = performance.now() / 1000;
                bp.material.uniforms.uBurstDuration.value = 2.0;
                bp.visible = true;
            }

            parseSVGPath(d) {
                const commands = d.match(/[MLCQZmlcqzt][^MLCQZmlcqzt]*/gi) || [];
                const points = [];
                let currentX = 0, currentY = 0;
                const normalizeCoords = (x, y) => ({
                    x: (x - 512) / CONFIG.svg.normalizeScale,
                    y: -(y - 512) / CONFIG.svg.normalizeScale
                });

                for (const cmd of commands) {
                    const type = cmd[0].toUpperCase();
                    const isRelative = cmd[0] === cmd[0].toLowerCase();
                    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
                    const processPoints = (count) => {
                        for (let i = 0; i < nums.length; i += count) {
                            let x = isRelative ? currentX + nums[i] : nums[i];
                            let y = isRelative ? currentY + nums[i + 1] : nums[i + 1];
                            points.push(normalizeCoords(x, y));
                            currentX = x; currentY = y;
                        }
                    };

                    switch(type) {
                        case 'M': case 'L': processPoints(2); break;
                        case 'C': processPoints(6); break;
                        case 'Q': processPoints(4); break;
                    }
                }

                const step = Math.max(1, Math.floor(points.length / 2000));
                return points.filter((_, i) => i % step === 0);
            }

            initSVGPath(svgPathD) {
                if (!this.points) return;
                const pathPoints = this.parseSVGPath(svgPathD);
                
                if (pathPoints.length > 0) {
                    this.useCustomSVG = true;
                    console.log('SVG path loaded with', pathPoints.length, 'points');
                    
                    const texSize = Math.ceil(Math.sqrt(pathPoints.length));
                    
                    // 验证纹理尺寸，防止创建无效纹理
                    if (texSize <= 0) {
                        console.warn('Invalid texture size:', texSize);
                        return;
                    }
                    
                    const data = new Float32Array(texSize * texSize * 4);
                    
                    pathPoints.forEach((p, i) => {
                        data[i * 4] = p.x;
                        data[i * 4 + 1] = p.y;
                        data[i * 4 + 2] = 0;
                        data[i * 4 + 3] = 1;
                    });
                    
                    this.svgTexture = new THREE.DataTexture(data, texSize, texSize, THREE.RGBAFormat, THREE.FloatType);
                    this.svgTexture.needsUpdate = true;
                    
                    const uniforms = this.points.material.uniforms;
                    uniforms.uSVGTexture.value = this.svgTexture;
                    uniforms.uSVGPointCount.value = pathPoints.length;
                    uniforms.uUseCustomSVG.value = 1.0;
                }
            }

            bindEvents() {
                // 防止重复绑定事件监听器
                if (this.eventsBound) {
                    console.warn('Events already bound, skipping duplicate binding');
                    return;
                }
                
                // 保存事件处理函数的引用，以便后续移除
                this.handleResize = () => {
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                };
                
                this.isLoading = () => {
                    const ls = document.getElementById('loadingScreen');
                    return ls && !ls.classList.contains('hidden');
                };
                
                this.handleMouseMove = (e) => {
                    if (this.isLoading()) return;
                    e.preventDefault();
                    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                };
                
                this.handleMouseDown = (e) => {
                    if (this.isLoading()) return;
                    if (e.target.closest('.logo-popup, .settings-panel, .settings-fab')) return;
                    e.preventDefault();
                    e.stopPropagation();
                    this.mouse.isPressed = true;
                    this.mouse.lastButton = this.mouse.button;
                    this.mouse.button = e.button;
                    this.mousePressedTime = Date.now();
                    this.mousePressStart = Date.now();
                };
                this.handleMouseUp = (e) => {
                    if (this.isLoading()) return;
                    if (e.target.closest('.logo-popup, .settings-panel, .settings-fab')) return;
                    e.preventDefault();
                    e.stopPropagation();
                    this.mouse.isPressed = false;
                    this.mouse.lastButton = this.mouse.button;
                    this.mouse.button = -1;
                    this.mousePressedTime = null;
                    this.mouseHoldDuration = Date.now() - (this.mousePressStart || Date.now());
                };
                this.handleTouchStart = () => {
                    if (this.isLoading()) return;
                    this.mouse.isPressed = true;
                    this.mousePressedTime = null;
                };
                this.handleTouchEnd = () => {
                    if (this.isLoading()) return;
                    this.mouse.isPressed = false;
                    this.mousePressedTime = null;
                };
                
                this.handleWheel = (e) => {
                    if (this.isLoading()) return;
                    e.preventDefault();
                    this.cameraZoomTarget += e.deltaY * 0.01;
                    this.cameraZoomTarget = Math.max(this.cameraZoomMin, Math.min(this.cameraZoomMax, this.cameraZoomTarget));
                };
                
                window.addEventListener('resize', this.handleResize);
                document.addEventListener('mousemove', this.handleMouseMove);
                document.addEventListener('mousedown', this.handleMouseDown);
                document.addEventListener('mouseup', this.handleMouseUp);
                document.addEventListener('touchstart', this.handleTouchStart);
                document.addEventListener('touchend', this.handleTouchEnd);
                document.addEventListener('wheel', this.handleWheel, { passive: false });
                document.addEventListener('contextmenu', (e) => e.preventDefault());
                
                this.eventsBound = true;
            }
            
            update() {
                const { strengthSpeed, releaseSpeed } = CONFIG.interaction;
                const { spiralSpeed, shrinkRadius } = CONFIG.particle;
                const { timeSpeed, rotationSpeed, audioInfluence, blackholePulseStrength } = CONFIG.animation;
                const nowTime = performance.now();
                const deltaTime = Math.min(0.05, Math.max(0.001, (nowTime - this.lastUpdateTime) / 1000));
                const frameScale = deltaTime * 60;
                this.lastUpdateTime = nowTime;
                
                 this.updateAudioLevel(deltaTime);
                 
                 // 鼠标追踪（无论音乐是否播放都有效）
                 let vec = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
                 vec.unproject(this.camera);
                 let dir = vec.sub(this.camera.position).normalize();
                 // 防止除零错误
                 let distance = Math.abs(dir.z) > 0.001 ? -this.camera.position.z / dir.z : 0;
                 let pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
                 
                 this.mouseTarget.x = pos.x;
                 this.mouseTarget.y = pos.y;
                 
                 this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * 0.08;
                 this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * 0.08;
                 
                   // 鼠标交互效果
                    let targetStrength;
                    if (this.mouse.isPressed) {
                        if (this.mousePressedTime) {
                            const holdTime = Date.now() - this.mousePressedTime;
                            if (holdTime >= 200) {
                                this.mouse.pressEffective = true;
                                targetStrength = Math.min(1.0, holdTime / 200);
                            } else {
                                targetStrength = 0;
                            }
                        } else {
                            this.mousePressedTime = Date.now();
                            targetStrength = 0;
                        }
                    } else {
                        targetStrength = 0;
                        this.mousePressedTime = null;
                        this.mouse.pressEffective = false;
                    }
                   let currentStrength = this.points.material.uniforms.uMouseStrength.value;
                   let speed = strengthSpeed;
                   currentStrength += (targetStrength - currentStrength) * speed;
                   
                        this.points.material.uniforms.uMouse.value.set(this.mouseCurrent.x, this.mouseCurrent.y, 0);
                        if (this.mouse.isPressed && this.mouse.pressEffective) {
                            this.points.material.uniforms.uMousePressed.value = 1.0;
                            this.points.material.uniforms.uMouseStrength.value = currentStrength;
                        } else {
                            this.points.material.uniforms.uMousePressed.value = 0.0;
                            this.points.material.uniforms.uMouseStrength.value = 0;
                        }
                     this.points.material.uniforms.uSpiralSpeed.value = spiralSpeed;
                     this.points.material.uniforms.uShrinkRadius.value = shrinkRadius;
                     this.points.material.uniforms.uAttractStrength.value = CONFIG.particle.attractStrength;
                     this.points.material.uniforms.uAttractFalloff.value = CONFIG.particle.attractFalloff;
                     this.points.material.uniforms.uAttractRadius.value = CONFIG.particle.attractRadius;
                     this.points.material.uniforms.uRadialForce.value = CONFIG.particle.radialForce;
                     this.points.material.uniforms.uSnapStrength.value = CONFIG.particle.snapStrength;
                     this.points.material.uniforms.uNoiseAmplitude.value = CONFIG.particle.noiseAmplitude;
                     this.points.material.uniforms.uYWaveStrength.value = CONFIG.particle.yWaveStrength;
                     this.points.material.uniforms.uOriginScale.value = CONFIG.particle.originScale;
                     this.points.material.uniforms.uAudioDisplacement.value = CONFIG.animation.audioDisplacement;
                      // ─── 各频段独立驱动的视觉层 ───
                      // 1. 低频 (subBass+bass) → 冲击/脉冲层：尺寸膨胀、黑洞呼吸
                      this.points.material.uniforms.uBassLevel.value = (this.bassLevel || 0) * audioInfluence;

                      // 2. 中频 (lowMid+mid+highMid) → 旋律层：切线流动、颜色漂移
                      this.points.material.uniforms.uMelodyLevel.value = (this.melodyLevel || 0) * audioInfluence;

                      // 3. 高频 (presence+brilliance+air) → 光泽层：闪烁、发光强度
                      this.points.material.uniforms.uTrebleLevel.value = (this.trebleLevel || 0) * audioInfluence;
                      if (this._baseGlowIntensity === undefined) this._baseGlowIntensity = CONFIG.glow.intensity;
                      const trebleGlow = 0.5 + 0.5 * Math.min((this.trebleLevel || 0) * 2.0, 1.0);
                      this.points.material.uniforms.uGlowIntensity.value = this._baseGlowIntensity * trebleGlow;

                      // 4. 节拍 (spectral flux) → 鼓点层：亮度爆发、旋转脉冲
                      this.points.material.uniforms.uBeat.value = this.beatValue || 0;
                      this.points.material.uniforms.uBeatPhase.value = this.beatPhase || 0;
                      if (this._baseBrightness === undefined) this._baseBrightness = this.points.material.uniforms.uBrightnessBase.value;
                      const beatBrightness = 1.0 + 0.8 * (this.beatValue || 0);
                      this.points.material.uniforms.uBrightnessBase.value = this._baseBrightness * beatBrightness;

                      // 5. 全频能量 → 通用振动强度 (平滑)
                      const rawEnergy = this.audioLevel * 0.3 + (this.bassLevel || 0) * 0.3 + (this.beatValue || 0) * 0.4;
                      if (this._smoothEnergy === undefined) this._smoothEnergy = 0;
                      this._smoothEnergy += (rawEnergy - this._smoothEnergy) * 0.08;
                      const dynamicVibrate = CONFIG.animation.audioVibrate * (0.25 + 0.75 * Math.min(this._smoothEnergy, 1.0));
                      this.points.material.uniforms.uAudioVibrate.value = dynamicVibrate;
                     this.points.material.uniforms.uAudioLevel.value = this.audioLevel * audioInfluence;
                     
                // 音频大小 → 由低频主导的尺寸膨胀
                const targetBoost = ((this.bassLevel || 0) * 0.8 + this.audioLevel * 0.2) * audioInfluence * CONFIG.animation.audioSizeInfl;
                this.sizeBoost += (targetBoost - this.sizeBoost) * (1 - Math.exp(-deltaTime / 0.27));
                this.points.material.uniforms.uSizeBoost.value = this.sizeBoost;

                // 鼓点只产生短促旋转冲量，不再每拍反转方向。
                if (this.justBeat) {
                    this.rotationImpulse = rotationSpeed * (4 + (this.beatStrength || 0.7) * 6);
                }
                this.rotationImpulse *= Math.exp(-deltaTime / 0.12);
                // 黑洞脉冲 → 低频 + 节拍
                this.points.material.uniforms.uBlackholePulse.value = ((this.bassLevel || 0) * 0.8 + (this.beatValue || 0) * 0.4) * blackholePulseStrength;
                
                if (this.wasPressed && !this.mouse.isPressed && (this.mouse.lastButton === 0 || this.mouse.lastButton === 2) && this.mouseHoldDuration >= 200 && this.releaseAnim < 0.01) {
                    this.releaseAnim = 1.0;
                }
                // 左/右键快速点击：生成新粒子从点击位置汇聚到形状
                if (this.wasPressed && !this.mouse.isPressed && (this.mouse.lastButton === 0 || this.mouse.lastButton === 2) && this.mouseHoldDuration < 200 && this.mouseHoldDuration >= 0) {
                    const rawVec = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera);
                    const rawDir = rawVec.sub(this.camera.position).normalize();
                    const rawDist = Math.abs(rawDir.z) > 0.001 ? -this.camera.position.z / rawDir.z : 0;
                    const rawPos = this.camera.position.clone().add(rawDir.multiplyScalar(rawDist));
                    this.triggerBurst(rawPos);
                }
                this.wasPressed = this.mouse.isPressed;
                
                if (this.releaseAnim > 0.01) {
                    this.releaseAnim *= releaseSpeed;
                }
                this.points.material.uniforms.uMouseRelease.value = this.releaseAnim;
                
                // 更新爆发粒子
                if (this.burstParticles) {
                    for (let b = 0; b < this.burstParticles.length; b++) {
                        const bp = this.burstParticles[b];
                        const wallTime = performance.now() / 1000;
                        bp.material.uniforms.uTime.value = wallTime;
                        bp.material.uniforms.uAudioLevel.value = this.audioLevel * audioInfluence;
                        bp.material.uniforms.uBassLevel.value = (this.bassLevel || 0) * audioInfluence;
                        bp.material.uniforms.uBeat.value = this.beatValue || 0;
                        bp.material.uniforms.uAudioVibrate.value = dynamicVibrate;
                        const maxLife = bp.material.uniforms.uBurstDuration.value + 1.0;
                        if (bp.visible && wallTime - bp.material.uniforms.uBurstTime.value > maxLife) {
                            bp.visible = false;
                        }
                    }
                }
                
                // 右键长按计时 + 爆炸涟漪
                if (this.mouse.isPressed && this.mouse.button === 2) {
                    this.rightHoldTime += 1.0 / 60.0;
                    if (this.rightHoldTime >= 10.0 && this.rightExplodeAnim < 0.01 && !this.rightHasExploded) {
                        this.rightExplodeAnim = 1.0;
                        this.rightHasExploded = true;
                    }
                } else {
                    this.rightHoldTime = 0;
                    this.rightHasExploded = false;
                }
                
                if (this.rightExplodeAnim > 0.01) {
                    this.rightExplodeAnim *= 0.995;
                }
                this.points.material.uniforms.uRightExplode.value = this.rightExplodeAnim;
                
                // 音乐高潮检测
                this.avgAudioEnergy += (this.audioLevel - this.avgAudioEnergy) * (1 - Math.exp(-deltaTime / 2));
                let targetClimax = (this.audioLevel > this.avgAudioEnergy * 1.8 && this.audioLevel > 0.25) ? 1.0 : 0.0;
                this.climax += (targetClimax - this.climax) * (1 - Math.exp(-deltaTime / 0.27));
                this.points.material.uniforms.uClimax.value = this.climax;
                
                let dynamicTimeSpeed = this.baseTimeSpeed;
                if (this.audioLevel > 0.02) {
                    dynamicTimeSpeed = this.baseTimeSpeed * (1 + this.audioLevel * audioInfluence * 5.0);
                }
                
                this.time += dynamicTimeSpeed * frameScale;
                
                this.points.material.uniforms.uTime.value = this.time;
                this.points.material.uniforms.uGalaxyFactor.value = 0;
                // Effect mode updates
                if (this.effectIntensity === undefined) this.effectIntensity = 1;
                if (this.targetEffectIntensity === undefined) this.targetEffectIntensity = 1;
                if (this.currentEffectMode === undefined) this.currentEffectMode = 2;
                
                this.effectIntensity += (this.targetEffectIntensity - this.effectIntensity) * 0.08;
                this.points.material.uniforms.uEffectIntensity.value = this.effectIntensity;
                this.points.material.uniforms.uEffectMode.value = this.currentEffectMode;
                
                 let dynamicRotationSpeed = rotationSpeed * (1 + this.audioLevel * 1.2 + (this.bassLevel || 0) * 1.8 + (this.beatValue || 0) * 1.2) * this.rotationDir;
                 this.points.rotation.y += (dynamicRotationSpeed + this.rotationImpulse * this.rotationDir) * frameScale;
                 
                 // 整体浮游移动
                 const floatAmp = 2.0;
                 this.points.position.x = Math.sin(this.time * 0.08) * floatAmp;
                 this.points.position.y = Math.cos(this.time * 0.06) * floatAmp * 0.7;
                 this.points.position.z = Math.sin(this.time * 0.05 + 1.0) * floatAmp * 0.4;

                 // 径向脉冲 - 粒子云整体随低频和节拍脉动缩放
                const targetPulseScale = 1.0 + ((this.bassLevel || 0) * 0.12 + (this.beatValue || 0) * 0.18) * audioInfluence;
                if (this._currentPulseScale === undefined) this._currentPulseScale = 1.0;
                this._currentPulseScale += (targetPulseScale - this._currentPulseScale) * (1 - Math.exp(-deltaTime / 0.075));
                this.points.scale.set(this._currentPulseScale, this._currentPulseScale, this._currentPulseScale);
                 

                 
                  let targetZ = this.cameraZoomTarget - (this.audioLevel * 0.3 + (this.bassLevel || 0) * 0.2) * 1.0;
                  targetZ = Math.max(this.cameraZoomMin, Math.min(this.cameraZoomMax, targetZ));
                  this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;
                 // 相机始终看向粒子中心，确保滚轮缩放以视觉正中心为基准
                 this.camera.lookAt(this.points.position);
                 
                 this.frameCount++;
                 let now = performance.now();
                 this.frameTime = now - this.lastFpsTime;
                 if (this.frameTime >= 500) {
                     this.fps = Math.round((this.frameCount / this.frameTime) * 1000);
                     this.frameCount = 0;
                     this.lastFpsTime = now;
                     this.updateDataPanel();
                 }
                 
                 this.renderer.render(this.scene, this.camera);
            }

            updateDataPanel() {
                const fpsEl = document.getElementById('fpsValue');
                const audioEl = document.getElementById('audioLevel');
                const modeEl = document.getElementById('currentMode');
                const bassEl = document.getElementById('bassLevel');
                const radiusEl = document.getElementById('radiusValue');
                const zoomEl = document.getElementById('zoomValue');
                const zoomLeftEl = document.getElementById('zoomValueLeft');
                
                if (fpsEl) fpsEl.textContent = this.fps;
                if (audioEl) audioEl.textContent = Math.round(this.audioLevel * 100) + '%';
                if (bassEl) bassEl.textContent = Math.round(this.bassLevel * 100) + '%';
                if (radiusEl) radiusEl.textContent = CONFIG.particle.radius.toFixed(2);
                if (zoomEl) {
                    const d = new Date();
                    const h = String(d.getHours()).padStart(2, '0');
                    const m = String(d.getMinutes()).padStart(2, '0');
                    zoomEl.textContent = h + ':' + m;
                }
                if (zoomLeftEl) {
                    const pct = Math.min(100, Math.round((this.defaultCameraZ / this.camera.position.z) * 100));
                    zoomLeftEl.textContent = String(pct).padStart(3, ' ') + '%';
                }
                
                if (modeEl) {
                    if (this.mouse.isPressed) {
                        modeEl.textContent = 'BALL';
                    } else if (this.audioLevel > 0.1) {
                        modeEl.textContent = 'BEAT';
                    } else {
                        modeEl.textContent = 'IDLE';
                    }
                }
            }

            animate() {
                requestAnimationFrame(() => this.animate());
                if (document.documentElement.classList.contains('is-page-leaving')) return;
                try {
                    this.update();
                } catch (error) {
                    console.error('Render loop error:', error);
                    // 尝试重新初始化渲染器
                    try {
                        if (this.renderer && this.renderer.getContext()) {
                            // WebGL上下文仍然有效，可能是临时错误
                            console.log('Attempting to recover from render error');
                        } else {
                            console.log('WebGL context lost, attempting recovery');
                            this.handleContextLost();
                        }
                    } catch (recoveryError) {
                        console.error('Recovery failed:', recoveryError);
                    }
                }
            }
            
            handleContextLost() {
                // 处理WebGL上下文丢失
                console.log('WebGL context lost');
                // 停止渲染循环
                this.isContextLost = true;
            }
            
            handleContextRestored() {
                // 处理WebGL上下文恢复
                console.log('WebGL context restored');
                this.isContextLost = false;
                // 重新创建所有资源
                this.recreateResources();
            }
            
            recreateResources() {
                // 重新创建WebGL资源
                if (this.points) {
                    this.scene.remove(this.points);
                    this.points.geometry.dispose();
                    this.points.material.dispose();
                }
                this.createParticles();
                if (this.svgTexture) {
                    this.svgTexture.dispose();
                }
                this.initSVGPath(CONFIG.svg.path);
                console.log('Resources recreated after context restore');
            }
             
            dispose() {
                // 停止HTML5音频
                const audioEl = document.getElementById('bgMusic');
                if (audioEl && !audioEl.paused) {
                    audioEl.pause();
                }
                
                // 关闭AudioEngine
                if (this.audioEngine && this.audioEngine.audioCtx && this.audioEngine.audioCtx.state !== 'closed') {
                    this.audioEngine.audioCtx.close();
                }
                
                // 释放Three.js资源
                if (this.points) {
                    this.scene.remove(this.points);
                    this.points.geometry.dispose();
                    this.points.material.dispose();
                }

                // 释放纹理
                if (this.svgTexture) {
                    this.svgTexture.dispose();
                }
                
                // 释放渲染器
                if (this.renderer) {
                    this.renderer.dispose();
                }
                
                // 清理事件监听器
                window.removeEventListener('resize', this.handleResize);
                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mousedown', this.handleMouseDown);
                document.removeEventListener('mouseup', this.handleMouseUp);
                document.removeEventListener('touchstart', this.handleTouchStart);
                document.removeEventListener('touchend', this.handleTouchEnd);
                document.removeEventListener('wheel', this.handleWheel);
                 
                console.log('ParticleSystem disposed');
            }
        }

        class NeuroNoise {
            constructor() {
                this.cleanup = null;
                this.canvas = null;
                this.params = {
                    color: '#3366ff',
                    opacity: 0.95,
                    speed: 0.001,
                    audioReact: 1.0
                };
                this._speed = this.params.speed;
            }

            setSpeed(v) { this._speed = v; this.params.speed = v; if (this.canvas) { this.hide(); this.show(); } }

            _hexToRgb(hex) {
                const r = parseInt(hex.slice(1, 3), 16) / 255;
                const g = parseInt(hex.slice(3, 5), 16) / 255;
                const b = parseInt(hex.slice(5, 7), 16) / 255;
                return [r, g, b];
            }

            show() {
                if (this.cleanup) return;
                const rgb = this._hexToRgb(this.params.color);
                this.canvas = document.createElement('canvas');
                this.canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
                this.canvas.style.opacity = '0';
                this.canvas.style.transition = 'opacity 0.6s ease';
                document.body.appendChild(this.canvas);
                const dpr = Math.min(window.devicePixelRatio, 2);
                let w = window.innerWidth, h = window.innerHeight;
                this.canvas.width = w * dpr; this.canvas.height = h * dpr;
                const gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
                if (!gl) { this.canvas.remove(); this.canvas = null; return; }

                const vsSource = `
                  precision mediump float;
                  varying vec2 vUv;
                  attribute vec2 a_position;
                  void main() {
                    vUv = 0.5 * (a_position + 1.0);
                    gl_Position = vec4(a_position, 0.0, 1.0);
                  }
                `;
            const fsSource = `
              precision mediump float;
              varying vec2 vUv;
              uniform float u_time;
              uniform float u_ratio;
              uniform vec2 u_pointer_position;
              uniform vec3 u_color;
              uniform float u_speed;
              uniform float u_seed;
              uniform float u_audio_bass;
              uniform float u_audio_melody;
              uniform float u_audio_treble;
              uniform float u_audio_beat;
              uniform float u_audio_react;
              vec2 rotate(vec2 uv, float th) {
                return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
              }
              float neuro_shape(vec2 uv, float t, float p) {
                vec2 sine_acc = vec2(0.0);
                vec2 res = vec2(0.0);
                float scale = 8.0;
                for (int j = 0; j < 15; j++) {
                  uv = rotate(uv, 1.0);
                  sine_acc = rotate(sine_acc, 1.0);
                  vec2 layer = uv * scale + float(j) + sine_acc - t;
                  sine_acc += sin(layer) + 2.4 * p;
                  res += (0.5 + 0.5 * cos(layer)) / scale;
                  scale *= 1.2;
                }
                return res.x + res.y;
              }
              void main() {
                vec2 uv = 0.5 * vUv;
                uv.x *= u_ratio;
                vec2 pointer = vUv - u_pointer_position;
                pointer.x *= u_ratio;
                float p = clamp(length(pointer), 0.0, 1.0);
                p = 0.5 * pow(1.0 - p, 2.0);
                float t = u_time + u_seed * u_speed;
                vec3 col = vec3(0.0);
                float noise = neuro_shape(uv, t, p);
                noise = 1.2 * pow(noise, 3.0);
                noise += pow(noise, 8.0);
                noise = max(0.0, noise - 0.2);
                // 音乐只改变明暗，不再移动、扭曲或加速噪点纹理。
                float audioGain = 1.0 + (u_audio_bass * 0.12 + u_audio_melody * 0.08 + u_audio_treble * 0.16 + u_audio_beat * 0.28) * u_audio_react;
                noise *= audioGain;
                col = u_color * noise;
                gl_FragColor = vec4(col, noise);
              }
            `;
                function createShader(src, type) {
                    const s = gl.createShader(type);
                    gl.shaderSource(s, src);
                    gl.compileShader(s);
                    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
                    return s;
                }
                const vs = createShader(vsSource, gl.VERTEX_SHADER);
                const fs = createShader(fsSource, gl.FRAGMENT_SHADER);
                if (!vs || !fs) { this.canvas.remove(); this.canvas = null; return; }
                const prog = gl.createProgram();
                gl.attachShader(prog, vs); gl.attachShader(prog, fs);
                gl.linkProgram(prog);
                if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { this.canvas.remove(); this.canvas = null; return; }
                gl.useProgram(prog);

                const uniforms = {};
                const uc = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < uc; i++) {
                    const name = gl.getActiveUniform(prog, i).name;
                    uniforms[name] = gl.getUniformLocation(prog, name);
                }
                const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
                const posLoc = gl.getAttribLocation(prog, 'a_position');
                gl.enableVertexAttribArray(posLoc);
                gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

                gl.uniform3f(uniforms.u_color, rgb[0], rgb[1], rgb[2]);
                gl.uniform1f(uniforms.u_speed, this.params.speed);
                gl.uniform1f(uniforms.u_seed, Math.random() * 10000);
                gl.uniform1f(uniforms.u_ratio, this.canvas.width / this.canvas.height);
                gl.uniform1f(uniforms.u_audio_bass, 0);
                gl.uniform1f(uniforms.u_audio_melody, 0);
                gl.uniform1f(uniforms.u_audio_treble, 0);
                gl.uniform1f(uniforms.u_audio_beat, 0);
                gl.uniform1f(uniforms.u_audio_react, this.params.audioReact);
                gl.viewport(0, 0, this.canvas.width, this.canvas.height);

                let running = true;
                let noiseTime = 0;
                let lastRenderTime = performance.now();
                let musicTempo = 1;
                const ptr = { x: 0, y: 0, tX: 0, tY: 0 };
                const self = this;
                function updateMouse(px, py) { ptr.tX = px; ptr.tY = py; }
                const onMove = (e) => updateMouse(e.clientX, e.clientY);
                const onTouch = (e) => { if (e.targetTouches[0]) updateMouse(e.targetTouches[0].clientX, e.targetTouches[0].clientY); };
                const onClick = (e) => updateMouse(e.clientX, e.clientY);
                window.addEventListener('pointermove', onMove);
                window.addEventListener('touchmove', onTouch);
                window.addEventListener('click', onClick);

                function resize() {
                    const w2 = window.innerWidth, h2 = window.innerHeight;
                    self.canvas.width = w2 * dpr; self.canvas.height = h2 * dpr;
                    gl.uniform1f(uniforms.u_ratio, self.canvas.width / self.canvas.height);
                    gl.viewport(0, 0, self.canvas.width, self.canvas.height);
                }
                window.addEventListener('resize', resize);

                function render(now = performance.now()) {
                    if (!running) return;
                    if (document.documentElement.classList.contains('is-page-leaving')) {
                        lastRenderTime = now;
                        requestAnimationFrame(render);
                        return;
                    }
                    const w2 = window.innerWidth, h2 = window.innerHeight;
                    const deltaMs = Math.min(50, Math.max(0, now - lastRenderTime));
                    lastRenderTime = now;
                    const bass = Math.min(particleSystem.bassLevel || 0, 1.5);
                    const melody = Math.min(particleSystem.melodyLevel || 0, 1.5);
                    const treble = Math.min(particleSystem.trebleLevel || 0, 1.5);
                    const beat = Math.min(particleSystem.beatValue || 0, 1.5);
                    const react = self.params.audioReact;
                    const audioEnergy = Math.min((bass + melody + treble) / 3, 1);
                    const targetTempo = (typeof isPlaying !== 'undefined' && isPlaying)
                        ? 1.65 + audioEnergy * 1.1 * react
                        : 1;
                    const tempoEase = 1 - Math.exp(-deltaMs / 220);
                    musicTempo += (targetTempo - musicTempo) * tempoEase;
                    noiseTime += deltaMs * self._speed * musicTempo;
                    ptr.x += (ptr.tX - ptr.x) * 0.2;
                    ptr.y += (ptr.tY - ptr.y) * 0.2;
                    gl.uniform1f(uniforms.u_time, noiseTime);
                    gl.uniform1f(uniforms.u_speed, self._speed);
                    gl.uniform1f(uniforms.u_audio_bass, bass);
                    gl.uniform1f(uniforms.u_audio_melody, melody);
                    gl.uniform1f(uniforms.u_audio_treble, treble);
                    gl.uniform1f(uniforms.u_audio_beat, beat);
                    gl.uniform1f(uniforms.u_audio_react, react);
                    gl.uniform2f(uniforms.u_pointer_position, ptr.x / w2, 1 - ptr.y / h2);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    requestAnimationFrame(render);
                }
                render();

                this._glCleanup = function() {
                    running = false;
                    window.removeEventListener('resize', resize);
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('touchmove', onTouch);
                    window.removeEventListener('click', onClick);
                };

                this.cleanup = this._glCleanup;

                requestAnimationFrame(() => { this.canvas.style.opacity = String(self.params.opacity); });
            }

            hide() {
                if (this.canvas) {
                    if (this._glCleanup) this._glCleanup();
                    this.canvas.remove();
                    this.canvas = null;
                    this._glCleanup = null;
                }
                this.cleanup = null;
            }

            updateParams(params) {
                Object.assign(this.params, params);
                if (this.canvas) {
                    this.hide();
                    this.show();
                }
            }
        }

        const dropdownData = {
            technology: {
                title: '我的项目',
                items: [
                    { title: 'PHOTO ONE', subtitle: 'Description here', btnText: 'View Photo', image: '' },
                    { title: 'PHOTO TWO', subtitle: 'Description here', btnText: 'View Photo', image: '' },
                    { title: 'PHOTO THREE', subtitle: 'Description here', btnText: 'View Photo', image: '' },
                    { title: 'PHOTO FOUR', subtitle: 'Description here', btnText: 'View Photo', image: '' },
                    { title: 'PHOTO FIVE', subtitle: 'Description here', btnText: 'View Photo', image: '' }
                ]
            }
        };
        function initUI() {
            const navDropdown = document.getElementById('navDropdown');
            const dropdownTitle = document.getElementById('dropdownTitle');
            const dropdownGrid = document.getElementById('dropdownGrid');
            let currentDropdown = null;

            document.querySelectorAll('[data-dropdown]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const key = item.dataset.dropdown;
                    
                    if (currentDropdown === key) {
                        navDropdown.classList.remove('active');
                        dropdownGrid.classList.remove('expertise', 'technology', 'financing');
                        currentDropdown = null;
                    } else {
                        const data = dropdownData[key];
                        if (data && data.items) {
                            dropdownGrid.classList.remove('expertise', 'technology', 'financing');
                            dropdownGrid.classList.add(key);
                            dropdownTitle.textContent = data.title;
                            dropdownGrid.innerHTML = data.items.map((item, index) => `
                                <div class="dropdown-card" style="background-image: url('${item.image || ''}')">
                                    <div class="dropdown-card-content">
                                        <div class="dropdown-card-title">${item.title}</div>
                                        <div class="dropdown-card-subtitle">${item.subtitle || ''}</div>
                                        <a href="#" class="dropdown-card-btn">${item.btnText || 'View Project'} →</a>
                                    </div>
                                </div>
                            `).join('');
                        }
                        navDropdown.classList.add('active');
                        currentDropdown = key;
                    }
                });
            });

            navDropdown.addEventListener('click', () => {
                navDropdown.classList.remove('active');
                currentDropdown = null;
            });

            const dropdownClose = document.getElementById('dropdownClose');
            if (dropdownClose) {
                dropdownClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    navDropdown.classList.remove('active');
                    currentDropdown = null;
                });
            }

            navDropdown.addEventListener('wheel', (e) => {
                if (navDropdown.classList.contains('active')) {
                    e.preventDefault();
                    dropdownGrid.scrollLeft += e.deltaY;
                }
            }, { passive: false });

            document.getElementById('canvas-container').style.pointerEvents = 'none';
        }

        const particleSystem = new ParticleSystem();
        const neuroNoise = new NeuroNoise();
        
        const loadingScreen = document.getElementById('loadingScreen');

        const dotCanvas = document.createElement('canvas');
        dotCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
        dotCanvas.style.opacity = '0';
        dotCanvas.style.transition = 'opacity 0.6s ease';
        loadingScreen.insertBefore(dotCanvas, loadingScreen.firstChild);

        // 子页面返回时跳过加载页（刷新页面时 query 参数消失）
        const urlParams = new URLSearchParams(window.location.search);
        const returnFromSub = urlParams.get('fromSub') === '1';
        const skipLoading = returnFromSub || window.__pageEntryState?.backForward === true;
        if (skipLoading) {
            if (returnFromSub) {
                const cleanReturnUrl = new URL(window.location.href);
                cleanReturnUrl.searchParams.delete('fromSub');
                history.replaceState(null, '', cleanReturnUrl.pathname + cleanReturnUrl.search + cleanReturnUrl.hash);
            }
            loadingScreen.style.display = 'none';
            loadingScreen.classList.add('hidden');
            document.getElementById('canvas-container').style.pointerEvents = 'auto';
            requestAnimationFrame(() => requestAnimationFrame(() => { dotCanvas.style.opacity = '1'; }));
        } else {
            requestAnimationFrame(() => requestAnimationFrame(() => { dotCanvas.style.opacity = '1'; }));
        }
        const spacing = 12, dotSize = 7;

        function renderDotGrid(p, audio) {
            const w = window.innerWidth, h = window.innerHeight;
            if (w === 0 || h === 0) return;
            dotCanvas.width = w; dotCanvas.height = h;
            const ctx = dotCanvas.getContext('2d');
            const fullScreen = p >= 1 || audio;
            const s = fullScreen ? 20 : spacing;
            const cols = Math.ceil(w / s), rows = Math.ceil(h / s);
            const halfCols = cols / 2;
            const halfRows = rows / 2;
            const barHeight = 3;
            const barGap = 1;
            const barRowShift = -5;
            const cx = w / 2, cy = h / 2 + barRowShift * spacing;
            const maxDist = Math.sqrt(cx * cx + cy * cy);
            const barCenterRow = halfRows + barRowShift;
            ctx.clearRect(0, 0, w, h);

            const waveTime = Date.now() * 0.002;

            // 重复文案 — 从最右边往左边滚动
            const text = 'POINTE-TE';
            ctx.font = 'bold 18px "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textW = ctx.measureText(text).width;
            const step = textW + 24;
            const halfH = barHeight * spacing / 2;
            const scrollOff = p * w;

            // 进度条矩形 — 从左向右填充
            const barY = barCenterRow * spacing - barHeight * spacing / 2;
            const barSize = p * w;
            const barX = 0;

            // 黑色文案（全宽）
            ctx.fillStyle = '#000';
            for (let i = 0; i < 40; i++) {
                const x = w + step * i - scrollOff;
                ctx.fillText(text, x, barY + halfH);
            }

            // 黑色矩形进度条 + 白色文案
            ctx.fillStyle = '#000';
            ctx.fillRect(barX, barY, barSize, barHeight * spacing);
            ctx.save();
            ctx.beginPath();
            ctx.rect(barX, barY, barSize, barHeight * spacing);
            ctx.clip();
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 40; i++) {
                const x = w + step * i - scrollOff;
                ctx.fillText(text, x, barY + halfH);
            }
            ctx.restore();

            const beat = audio ? audio.beat : 0;
            const bass = audio ? audio.bass : 0;
            const energy = audio ? audio.energy : 0;
            const melody = audio ? audio.melody : 0;
            const baseSize = fullScreen ? 6 : dotSize;
            const alphaMul = fullScreen ? 0.9 : 0.4;

            // 点阵
            ctx.save();
            ctx.translate(0, -3);
            for (let r = 0; r < rows; r++)
                for (let c = 0; c < cols; c++) {
                    const px = c * s + s / 2;
                    const py = r * s + s / 2;
                    const dist = Math.sqrt((px - cx) ** 2 + (py - cy - 3) ** 2);
                    let alpha = Math.max(0, 1 - dist / maxDist) * alphaMul;
                    let size = baseSize;
                    if (!audio && p < 1) {
                        const wave = Math.sin(px * 0.003 + waveTime * 2) * 0.5 + 0.5;
                        alpha *= 0.2 + wave * 0.8;
                        size += (1 - wave) * 4;
                    }
                    if (audio) {
                        const bassWave = Math.sin(py * 0.08 - energy * 10) * 0.5 + 0.5;
                        const bassRipple = Math.max(0, 1 - Math.abs(py - h + bass * 200) / 200);
                        const melodyWave = Math.sin(px * 0.04 + py * 0.03 + melody * 6) * 0.4 + 0.4;
                        const trebleSpark = (Math.sin(px * 13.7 + py * 7.3 + Date.now() * 0.003) * 0.5 + 0.5) * (treble || 0) * 2;
                        size += (bass * 4 + energy * 3) * (0.5 + bassRipple * 0.5);
                        size += melodyWave * 4;
                        size += trebleSpark * 3;
                        alpha += beat * 0.3 + energy * 0.1 + bassRipple * 0.2 + trebleSpark * 0.3;
                        alpha = Math.min(0.95, alpha);
                    }
                    const inBar = Math.abs(r - barCenterRow) < barHeight + barGap;
                    if (inBar && !fullScreen) continue;
                    ctx.fillStyle = audio ? `rgba(44,79,255,${alpha.toFixed(3)})` : `rgba(255,255,255,${alpha.toFixed(3)})`;
                    ctx.fillRect(c * s, r * s, size, size);
                }
            ctx.restore();
        }
        let progress = 0;
        let smoothP = 0;

        if (!skipLoading) {
            renderDotGrid(0);
            function smoothRender() {
                if (progress >= 100) {
                    renderDotGrid(1);
                    return;
                }
                smoothP += (progress / 100 - smoothP) * 0.15;
                renderDotGrid(smoothP);
                requestAnimationFrame(smoothRender);
            }
            smoothRender();

            // 数字加载进度 0% → 100% 后自动解锁
            const loadingProgress = document.getElementById('loadingProgress');
            function tickProgress() {
                progress += 1;
                if (progress >= 100) {
                    loadingProgress.textContent = '100%';
                    dotCanvas.style.transition = 'none';
                    dotCanvas.style.opacity = '0';
                    openParticlePage();
                    return;
                }
                loadingProgress.textContent = progress + '%';
                let delay;
                if (progress < 50) {
                    delay = 5 + Math.floor(Math.random() * 3);
                } else if (progress < 72) {
                    delay = 85 + Math.floor(Math.random() * 10);
                } else {
                    delay = 20 + Math.floor(Math.random() * 6);
                }
                setTimeout(tickProgress, delay);
            }
            tickProgress();
        }

        window.addEventListener('resize', () => {
            renderDotGrid(progress / 100);
        });

        // 后台初始化
        setTimeout(() => {
            particleSystem.init();
            particleSystem.animate();
            initUI();
            if (!skipLoading) {
                particleSystem.points.material.uniforms.uSize.value = CONFIG.particle.size;
            }
        }, 600);

        let isUnlocking = false;
        let waveAnimId = null;

        function openParticlePage() {
            if (isUnlocking) return;
            isUnlocking = true;
            if (waveAnimId) { cancelAnimationFrame(waveAnimId); waveAnimId = null; }

            dotCanvas.style.opacity = '0';

            const h = loadingScreen.clientHeight;
            const rows = Math.ceil(h / spacing);
            const halfRows = rows / 2;
            const barHeightRows = 3;
            const barRowShift = -5;
            const barY = (halfRows + barRowShift) * spacing - barHeightRows * spacing / 2;
            const barH = barHeightRows * spacing;

            loadingScreen.querySelectorAll('.loading-subtitle, .loading-progress, .loading-logo, .loading-group').forEach(el => {
                el.style.transition = 'opacity 0.15s ease';
                el.style.opacity = '0';
            });

            const cc = document.getElementById('canvas-container');
            if (particleSystem.renderer) {
                particleSystem.renderer.domElement.style.opacity = '0';
                particleSystem.renderer.domElement.style.transition = 'opacity 1s ease';
            }

            const wrap = document.createElement('div');
            wrap.className = 'flip-wrap';
            const cube = document.createElement('div');
            cube.className = 'flip-cube';
            cube.style.cssText = `top:${barY}px;height:${barH}px;background:transparent`;

            wrap.appendChild(cube);
            document.body.appendChild(wrap);

            setTimeout(() => {
                neuroNoise.show();
                const nc = neuroNoise.canvas;
                cube.classList.add('flipped');
                loadingScreen.style.background = '#000';
                if (particleSystem.renderer) {
                    particleSystem.renderer.domElement.style.opacity = '0';
                }
                if (nc) {
                    nc.style.position = 'absolute';
                    nc.style.inset = '0';
                    nc.style.width = '100%';
                    nc.style.height = '100%';
                    nc.style.opacity = '1';
                    cube.appendChild(nc);
                }
            }, 50);

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.classList.add('hidden');
                wrap.style.zIndex = '1';
                wrap.style.pointerEvents = 'auto';
                cube.style.transition = 'none';
                cube.style.transform = 'none';
                cube.style.top = '0';
                cube.style.height = '100%';
                isUnlocking = false;
                if (particleSystem.renderer) {
                    particleSystem.renderer.setSize(window.innerWidth, window.innerHeight);
                }
                const nc2 = neuroNoise.canvas;
                if (nc2 && nc2.parentNode) {
                    nc2.style.position = 'fixed';
                    nc2.style.zIndex = '2';
                    nc2.style.transition = 'opacity 0.6s ease';
                    document.body.appendChild(nc2);
                }
                particleSettings.style.display = 'none';
                neuroSettings.style.display = 'block';
                const speedEl = document.getElementById('s-nSpeed');
                const speedDisp = document.getElementById('v-nSpeed');
                if (speedEl) { speedEl.value = neuroNoise._speed; speedDisp.textContent = Number(neuroNoise._speed).toFixed(4); }
            }, 1050);
        }

        // 导航“粒子”循环：立方体 → 星门涡旋 → 星核晶簇
        const shapes = ['cube', 'vortex', 'crystal'];
        const shapeLabels = { cube: '立方体', vortex: '星门涡旋', crystal: '星核晶簇' };
        let currentShapeIndex = Math.max(0, shapes.indexOf(CONFIG.shape.type));
        let particleViewActive = false;

        function changeShape(shapeType) {
            if (!particleSystem.points) return;
            CONFIG.shape.type = shapeType;
            currentShapeIndex = Math.max(0, shapes.indexOf(shapeType));

            const navButton = document.getElementById('shapeBtn');
            if (navButton) {
                navButton.title = `当前形状：${shapeLabels[shapeType]}（点击切换）`;
                navButton.setAttribute('aria-label', `粒子形状：${shapeLabels[shapeType]}，点击切换`);
            }

            const newDistance = CONFIG.shape.cameraDistance;
            particleSystem.camera.position.z = newDistance;
            particleSystem.cameraZoomTarget = newDistance;
            particleSystem.defaultCameraZ = newDistance;

            const radius = CONFIG.particle.radius;
            const positionAttribute = particleSystem.points.geometry.attributes.position;
            const positions = positionAttribute.array;
            const count = positions.length / 3;
            for (let i = 0; i < count; i++) {
                const pos = particleSystem.getShapePosition(shapeType, radius);
                positions[i * 3] = pos.x;
                positions[i * 3 + 1] = pos.y;
                positions[i * 3 + 2] = pos.z;
            }
            positionAttribute.needsUpdate = true;
            particleSystem.points.geometry.computeBoundingSphere();
        }

        const particleSettings = document.getElementById('particleSettings');
        const neuroSettings = document.getElementById('neuroSettings');

        const shapeBtn = document.getElementById('shapeBtn');
        if (shapeBtn) {
            shapeBtn.title = `当前形状：${shapeLabels[shapes[currentShapeIndex]]}（点击切换）`;
            shapeBtn.setAttribute('aria-label', `粒子形状：${shapeLabels[shapes[currentShapeIndex]]}，点击切换`);

            shapeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                neuroNoise.hide();
                if (particleSystem.renderer) {
                    particleSystem.renderer.domElement.style.transition = 'opacity 0.3s ease';
                    particleSystem.renderer.domElement.style.opacity = '1';
                }
                dotCanvas.style.transition = 'opacity 0.3s ease';
                dotCanvas.style.opacity = '0';
                particleSettings.style.display = 'block';
                neuroSettings.style.display = 'none';
                if (particleViewActive) {
                    currentShapeIndex = (currentShapeIndex + 1) % shapes.length;
                    changeShape(shapes[currentShapeIndex]);
                }
                particleViewActive = true;
            });
        }

        const neuroBtn = document.getElementById('neuroBtn');
        if (neuroBtn) {
            neuroBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (particleSystem.renderer) {
                    particleSystem.renderer.domElement.style.transition = 'opacity 0.3s ease';
                    particleSystem.renderer.domElement.style.opacity = '0';
                }
                dotCanvas.style.transition = 'opacity 0.3s ease';
                dotCanvas.style.opacity = '0';
                particleSettings.style.display = 'none';
                neuroSettings.style.display = 'block';
                particleViewActive = false;
                neuroNoise.show();
                const speedSlider = document.getElementById('s-nSpeed');
                const speedDisplay = document.getElementById('v-nSpeed');
                if (speedSlider) { speedSlider.value = neuroNoise._speed; speedDisplay.textContent = Number(neuroNoise._speed).toFixed(4); }
            });
        }

        // 音乐控制
        const musicFileInput = document.getElementById('musicFileInput');
        const musicBtn = document.getElementById('musicBtn');
        let isPlaying = false;

        // 手动加载音乐
        console.log('Music ready (manual play)');
        const bgMusicEl = document.getElementById('bgMusic');
        bgMusicEl.onerror = function() {
            console.log('Music file not found.');
        };

        // 按钮内流光动画（canvas 2D strands）
        function setupStrands(canvas, btnId) {
            const ctx = canvas.getContext('2d');
            const btn = document.getElementById(btnId);
            function draw(t) {
                requestAnimationFrame(draw);
                const isPaused = btn.classList.contains('paused');
                const w = canvas.width, h = canvas.height;
                ctx.clearRect(0, 0, w, h);
                const colors = ['#2C4FFF', '#4B6FFF', '#6B8FFF', '#8BAFFF', '#6B8FFF'];
                for (let i = 0; i < 5; i++) {
                    const c = colors[i % colors.length];
                    const grad = ctx.createLinearGradient(0, 0, w, 0);
                    grad.addColorStop(0, 'transparent');
                    grad.addColorStop(0.08, 'transparent');
                    grad.addColorStop(0.25, c);
                    grad.addColorStop(0.75, c);
                    grad.addColorStop(0.92, 'transparent');
                    grad.addColorStop(1, 'transparent');
                    if (!isPaused) {
                        ctx.shadowColor = c;
                        ctx.shadowBlur = 10;
                        ctx.globalAlpha = 0.15;
                        ctx.lineWidth = 3.5;
                        ctx.beginPath();
                        const fi = i, ph = fi * 2.1, freq = 1.6 + fi * 0.3, spd = 0.8 + fi * 1.0;
                        for (let x = 0; x <= w; x += 1) {
                            const ux = x / w;
                            const y = Math.sin(ux * freq * 5 + t * spd * 0.002 + ph) * 0.35
                                    + Math.sin(ux * freq * 5.6 - t * spd * 0.0012 + ph * 1.9) * 0.18
                                    + Math.sin(ux * freq * 3.2 + t * spd * 0.0008 + ph * 0.7) * 0.12;
                            const py = h / 2 + y * (h * 0.35);
                            x === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
                        }
                        ctx.strokeStyle = grad;
                        ctx.stroke();
                    }
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 0.85;
                    ctx.lineWidth = 1.3;
                    ctx.beginPath();
                    const fi = i, ph = fi * 2.1, freq = 1.6 + fi * 0.3, spd = 0.8 + fi * 1.0;
                    for (let x = 0; x <= w; x += 1) {
                        const ux = x / w;
                        const y = isPaused ? 0 : (Math.sin(ux * freq * 5 + t * spd * 0.002 + ph) * 0.35
                                + Math.sin(ux * freq * 5.6 - t * spd * 0.0012 + ph * 1.9) * 0.18
                                + Math.sin(ux * freq * 3.2 + t * spd * 0.0008 + ph * 0.7) * 0.12);
                        const py = h / 2 + y * (h * 0.35);
                        x === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
                    }
                    ctx.strokeStyle = grad;
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
            requestAnimationFrame(draw);
        }
        setupStrands(document.getElementById('mainStrands'), 'musicBtn');

        const bgMusicControl = document.getElementById('bgMusic');
        const musicStatus = document.getElementById('musicStatus');

        function syncMusicButtonState(playing) {
            isPlaying = playing;
            musicBtn.classList.toggle('paused', !playing);
            if (musicStatus) musicStatus.textContent = playing ? 'ON' : 'OFF';
            const color = playing ? '#7F67B3' : '#3366ff';
            neuroNoise.updateParams({ color });
            const nColor = document.getElementById('s-nColor');
            if (nColor) nColor.value = color;
        }

        bgMusicControl.addEventListener('play', () => syncMusicButtonState(true));
        bgMusicControl.addEventListener('pause', () => syncMusicButtonState(false));
        bgMusicControl.addEventListener('ended', () => syncMusicButtonState(false));
        bgMusicControl.addEventListener('emptied', () => syncMusicButtonState(false));
        bgMusicControl.addEventListener('error', () => syncMusicButtonState(false));

        // 点击播放/暂停
        musicBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const bgMusic = document.getElementById('bgMusic');
            if (!bgMusic.src || bgMusic.src === window.location.href || bgMusic.readyState === 0) {
                musicFileInput.click();
                return;
            }
            particleSystem.toggleMusic();
        });

        // 右键选择音乐文件
        musicBtn.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            musicFileInput.click();
        });

        // 文件选择处理
        musicFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                particleSystem.loadMusic(URL.createObjectURL(file));
            }
        });

        // 设置面板
        const settingsToggle = document.getElementById('settingsToggle');
        const settingsPanel = document.getElementById('settingsPanel');
        settingsToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            settingsPanel.classList.toggle('open');
            document.body.classList.toggle('settings-open', settingsPanel.classList.contains('open'));
            logoPopup.classList.remove('open');
            logoImg.style.display = '';
        });
        document.addEventListener('click', function(e) {
            if (!settingsPanel.contains(e.target) && e.target !== settingsToggle) {
                settingsPanel.classList.remove('open');
                document.body.classList.remove('settings-open');
            }
        });

        const sliderConfig = [
            { id: 'attractStrength', config: 'attractStrength', min: 0, max: 10, step: 0.05, decimals: 2, uniform: true },
            { id: 'attractFalloff', config: 'attractFalloff', min: 0.5, max: 8, step: 0.1, decimals: 1, uniform: true },
            { id: 'attractRadius', config: 'attractRadius', min: 1, max: 15, step: 0.1, decimals: 1, uniform: true },
            { id: 'radialForce', config: 'radialForce', min: -1, max: 1, step: 0.05, decimals: 2, uniform: true },
            { id: 'snapStrength', config: 'snapStrength', min: 0, max: 0.5, step: 0.005, decimals: 3, uniform: true },
            { id: 'spiralSpeed', config: 'spiralSpeed', min: 0, max: 12, step: 0.1, decimals: 1, uniform: true },
            { id: 'yWaveStrength', config: 'yWaveStrength', min: 0, max: 2, step: 0.01, decimals: 2, uniform: true },
            { id: 'originScale', config: 'originScale', min: 0, max: 1.5, step: 0.01, decimals: 2, uniform: true },
            { id: 'noiseAmplitude', config: 'noiseAmplitude', min: 0, max: 1, step: 0.005, decimals: 3, uniform: true },
            { id: 'radius', config: 'radius', min: 0.5, max: 5, step: 0.1, decimals: 1, uniform: false },
            { id: 'size', config: 'size', min: 0.00001, max: 0.005, step: 0.00001, decimals: 5, uniform: false },
            { id: 'brightness', config: null, min: 0, max: 3, step: 0.05, decimals: 2, uniform: false },
            { id: 'glowIntensity', config: null, min: 0, max: 3, step: 0.05, decimals: 2, uniform: false },
            { id: 'audioInfluence', config: 'audioInfluence', section: 'animation', min: 0, max: 2, step: 0.05, decimals: 2, uniform: false },
            { id: 'audioVibrate', config: 'audioVibrate', section: 'animation', min: 0, max: 3, step: 0.05, decimals: 2, uniform: true },
            { id: 'audioSizeInfl', config: 'audioSizeInfl', section: 'animation', min: 0, max: 2, step: 0.05, decimals: 2, uniform: true },
            { id: 'audioDisplacement', config: 'audioDisplacement', section: 'animation', min: 0, max: 2, step: 0.01, decimals: 2, uniform: true },
        ];

        sliderConfig.forEach(function(cfg) {
            const slider = document.getElementById('s-' + cfg.id);
            const display = document.getElementById('v-' + cfg.id);
            if (!slider) return;

            // set initial value
            let initialVal;
            if (cfg.id === 'brightness') {
                initialVal = particleSystem.points ? particleSystem.points.material.uniforms.uBrightnessBase.value : 0.5;
            } else if (cfg.id === 'glowIntensity') {
                initialVal = particleSystem.points ? particleSystem.points.material.uniforms.uGlowIntensity.value : 1.0;
            } else if (cfg.id === 'size') {
                initialVal = particleSystem.points ? particleSystem.points.material.uniforms.uSize.value : CONFIG.particle.size;
            } else if (cfg.section) {
                initialVal = CONFIG[cfg.section][cfg.config];
            } else {
                initialVal = CONFIG.particle[cfg.config];
            }
            slider.value = initialVal;
            display.textContent = initialVal.toFixed(cfg.decimals);

            function updateProgress() {
                const pct = ((parseFloat(slider.value) - cfg.min) / (cfg.max - cfg.min)) * 100;
                slider.style.background = `linear-gradient(to right, rgb(44,79,255), rgb(90,141,255) ${pct}%, rgb(60,60,60) ${pct}%, rgb(60,60,60) 100%)`;
            }
            updateProgress();

            slider.addEventListener('input', function() {
                const val = parseFloat(this.value);
                display.textContent = val.toFixed(cfg.decimals);
                updateProgress();

                if (cfg.id === 'brightness') {
                    particleSystem.points.material.uniforms.uBrightnessBase.value = val;
                    particleSystem._baseBrightness = val;
                    if (slider) slider.value = val;
                    return;
                }

                if (cfg.id === 'glowIntensity') {
                    particleSystem.points.material.uniforms.uGlowIntensity.value = val;
                    particleSystem._baseGlowIntensity = val;
                    return;
                }

                if (cfg.section) {
                    CONFIG[cfg.section][cfg.config] = val;
                } else {
                    CONFIG.particle[cfg.config] = val;
                }

                if (cfg.uniform) {
                    const uniformName = 'u' + cfg.config.charAt(0).toUpperCase() + cfg.config.slice(1);
                    if (particleSystem.points && particleSystem.points.material.uniforms[uniformName]) {
                        particleSystem.points.material.uniforms[uniformName].value = val;
                    }
                }

                if (cfg.config === 'radius') {
                    particleSystem.points.material.uniforms.uRadius.value = val;
                    // 重新生成粒子位置适配新半径
                    const positions = particleSystem.points.geometry.attributes.position.array;
                    for (let i = 0; i < CONFIG.particle.count; i++) {
                        const pos = particleSystem.getShapePosition(CONFIG.shape.type, val);
                        positions[i * 3] = pos.x;
                        positions[i * 3 + 1] = pos.y;
                        positions[i * 3 + 2] = pos.z;
                    }
                    particleSystem.points.geometry.attributes.position.needsUpdate = true;
                }
                if (cfg.config === 'size') {
                    if (!particleSystem.points) return;
                    particleSystem.points.material.uniforms.uSize.value = val;
                }
            });
        });

        // 粒子颜色选择器
        const colorPicker = document.getElementById('s-particleColor');
        if (colorPicker) {
            colorPicker.addEventListener('input', function() {
                const hex = this.value;
                const r = parseInt(hex.slice(1,3), 16) / 255;
                const g = parseInt(hex.slice(3,5), 16) / 255;
                const b = parseInt(hex.slice(5,7), 16) / 255;
                if (particleSystem.points) {
                    particleSystem.points.material.uniforms.uParticleColor.value.setRGB(r, g, b);
                }
                if (particleSystem.burstParticles) {
                    for (let b = 0; b < particleSystem.burstParticles.length; b++) {
                        particleSystem.burstParticles[b].material.uniforms.uColor.value.setRGB(r, g, b);
                    }
                }
            });
        }

        // 发光颜色选择器
        const glowColorPicker = document.getElementById('s-glowColor');
        if (glowColorPicker) {
            glowColorPicker.addEventListener('input', function() {
                const hex = this.value;
                const r = parseInt(hex.slice(1,3), 16) / 255;
                const g = parseInt(hex.slice(3,5), 16) / 255;
                const b = parseInt(hex.slice(5,7), 16) / 255;
                if (particleSystem.points) {
                    particleSystem.points.material.uniforms.uGlowColor.value.setRGB(r, g, b);
                }
            });
        }

        // NeuroNoise 颜色选择器
        const nColor = document.getElementById('s-nColor');
        if (nColor) nColor.addEventListener('input', function() { neuroNoise.updateParams({ color: this.value }); });

        // NeuroNoise 滑块
        const neuroSliders = [
            { id: 'nOpacity', key: 'opacity', min: 0.1, max: 1, step: 0.01, decimals: 2 },
            { id: 'nSpeed', key: 'speed', min: 0.0001, max: 0.05, step: 0.0001, decimals: 4 },
            { id: 'nAudioReact', key: 'audioReact', min: 0, max: 2, step: 0.01, decimals: 2 },
        ];
        neuroSliders.forEach(function(cfg) {
            const slider = document.getElementById('s-' + cfg.id);
            const display = document.getElementById('v-' + cfg.id);
            if (!slider) return;
            slider.value = neuroNoise.params[cfg.key];
            display.textContent = Number(neuroNoise.params[cfg.key]).toFixed(cfg.decimals);
            function updateProgress() {
                const pct = ((parseFloat(slider.value) - cfg.min) / (cfg.max - cfg.min)) * 100;
                slider.style.background = `linear-gradient(to right, rgb(44,79,255), rgb(90,141,255) ${pct}%, rgb(60,60,60) ${pct}%, rgb(60,60,60) 100%)`;
            }
            updateProgress();
            slider.addEventListener('input', function() {
                const val = parseFloat(this.value);
                display.textContent = val.toFixed(cfg.decimals);
                updateProgress();
                if (cfg.key === 'speed') neuroNoise.setSpeed(val);
                else if (cfg.key === 'audioReact') neuroNoise.params.audioReact = val;
                else neuroNoise.updateParams({ [cfg.key]: val });
            });
        });

        // 线性插值函数 (用来平滑更新值)
        function dt(current, target, speed) {
            return current + (target - current) * speed;
        }

        // Logo 弹窗
        const logoImg = document.getElementById('logoImg');
        const logoPopup = document.getElementById('logoPopup');
        if (logoImg && logoPopup) {
            logoImg.addEventListener('click', function(e) {
                e.stopPropagation();
                const opening = !logoPopup.classList.contains('open');
                logoPopup.classList.toggle('open');
                logoImg.style.display = opening ? 'none' : '';
                settingsPanel.classList.remove('open');
                document.body.classList.remove('settings-open');
            });
            document.addEventListener('click', function(e) {
                if (logoPopup.classList.contains('open') && !logoPopup.contains(e.target) && e.target !== logoImg) {
                    logoPopup.classList.remove('open');
                    logoImg.style.display = '';
                }
            });
        }

        console.log('Three.js initialized');
    })();