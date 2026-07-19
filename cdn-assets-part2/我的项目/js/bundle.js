(() => {
  'use strict';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  let homeCanvasCleanup = null;

  function initHomeCanvas() {
    destroyHomeCanvas();
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') return;

    const gridElement = document.querySelector('.js-grid');
    if (!gridElement) return;

    document.body.style.overscrollBehaviorX = 'none';
    document.documentElement.style.overscrollBehaviorX = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isWindows = navigator.appVersion.includes('Win');
    const mouseMultiplier = isWindows ? 1.2 : 0.6;
    const firefoxMultiplier = isWindows ? 40 : 20;
    const textureLoader = new THREE.TextureLoader();

    const vertexShader = `
      precision mediump float;
      uniform vec2 u_velo;
      uniform vec2 u_viewSize;
      varying vec2 vUv;
      #define M_PI 3.1415926535897932384626433832795

      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        float normalizedX = worldPos.x / u_viewSize.x;
        float curvature = cos(normalizedX * M_PI);
        worldPos.y -= curvature * u_velo.y * 0.6;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 vUv;

      float random(vec2 point) {
        return fract(sin(dot(point.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec4 texColor = texture2D(u_texture, vUv);
        float grain = (random(vUv * 550.0) - 0.5) * 0.04;
        float vignette = smoothstep(0.8, 0.2, distance(vUv, vec2(0.5)) * 0.9);
        gl_FragColor = vec4((texColor.rgb + grain) * vignette, 1.0);
      }
    `;

    const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    const material = new THREE.ShaderMaterial({ fragmentShader, vertexShader });

    class Plane extends THREE.Object3D {
      init(element, index) {
        this.element = element;
        this.x = 0;
        this.y = 0;
        this.speed = 1 - ((index % 5) * 0.1);
        this.geometry = geometry;
        this.material = material.clone();
        this.material.uniforms = {
          u_texture: { value: null },
          u_velo: { value: new THREE.Vector2(0, 0) },
          u_viewSize: { value: new THREE.Vector2(viewportWidth, viewportHeight) }
        };
        this.texture = textureLoader.load(this.element.dataset.src, (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          this.material.uniforms.u_texture.value = texture;
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);
        this.resize();
      }

      update(x, y, max, velocity) {
        const { right, bottom } = this.rect;
        const { u_velo } = this.material.uniforms;
        this.y = gsap.utils.wrap(-(max.y - bottom), bottom, y * this.speed) - this.yOffset;
        this.x = gsap.utils.wrap(-(max.x - right), right, x) - this.xOffset;
        u_velo.value.x = velocity.x;
        u_velo.value.y = velocity.y;
        this.position.x = this.x;
        this.position.y = this.y;
      }

      resize() {
        this.rect = this.element.getBoundingClientRect();
        const { width, height } = this.rect;
        const left = this.rect.left + window.scrollX;
        const top = this.rect.top + window.scrollY;
        const { u_viewSize } = this.material.uniforms;

        this.xOffset = left + (width / 2) - (viewportWidth / 2) - 10;
        this.yOffset = top + (height / 2) - (viewportHeight / 2);
        this.position.x = this.xOffset;
        this.position.y = this.yOffset;
        u_viewSize.value.set(viewportWidth, viewportHeight);
        this.mesh.scale.set(width, height, 1);
      }

      dispose() {
        if (this.texture) this.texture.dispose();
        if (this.material) this.material.dispose();
      }
    }

    class Core {
      constructor() {
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.velocity = { x: 0, y: 0 };
        this.wheel = { x: 0, y: 0 };
        this.start = { x: 0, y: 0 };
        this.max = { x: 0, y: 0 };
        this.isDragging = false;
        this.element = gridElement;
        this.element.style.touchAction = 'none';

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
          viewportWidth / -2,
          viewportWidth / 2,
          viewportHeight / 2,
          viewportHeight / -2,
          1,
          1000
        );
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(viewportWidth, viewportHeight);
        this.renderer.setPixelRatio(gsap.utils.clamp(1, window.innerWidth < 768 ? 1 : 1.5, window.devicePixelRatio));
        this.renderer.setClearColor(0x000000, 1);

        const canvas = this.renderer.domElement;
        canvas.id = 'home-canvas-webgl';
        Object.assign(canvas.style, {
          position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: '-1'
        });
        document.getElementById('home-canvas-webgl')?.remove();
        document.body.appendChild(canvas);

        this.addPlanes();
        this.addEvents();
        this.resize();
      }

      addEvents() {
        gsap.ticker.add(this.tick);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('wheel', this.onWheel, { passive: false });
        window.addEventListener('touchstart', this.onTouchStart, { passive: false });
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('touchend', this.onTouchEnd);
        this.debouncedResize = () => {
          clearTimeout(this.resizeTimer);
          this.resizeTimer = setTimeout(this.resize, 150);
        };
        window.addEventListener('resize', this.debouncedResize);
      }

      addPlanes() {
        this.planes = [...document.querySelectorAll('.js-plane')].map((element, index) => {
          const plane = new Plane();
          plane.init(element, index);
          this.scene.add(plane);
          return plane;
        });
      }

      tick = () => {
        const xDifference = this.targetX - this.currentX;
        const yDifference = this.targetY - this.currentY;
        this.currentX = Math.round((this.currentX + (xDifference * 0.85)) * 100) / 100;
        this.currentY = Math.round((this.currentY + (yDifference * 0.85)) * 100) / 100;
        this.velocity.x = xDifference * 0.025;
        this.velocity.y = yDifference * 0.025;
        this.planes.forEach((plane) => plane.update(this.currentX, this.currentY, this.max, this.velocity));
        this.renderer.render(this.scene, this.camera);
      };

      onVisibilityChange = () => {
        if (document.hidden) gsap.ticker.remove(this.tick);
        else gsap.ticker.add(this.tick);
      };

      onMouseMove = ({ clientX, clientY }) => {
        if (!this.isDragging) return;
        this.targetX = this.start.x + (clientX * 2.5);
        this.targetY = this.start.y - (clientY * 2.5);
      };

      onMouseDown = ({ clientX, clientY }) => {
        if (this.isDragging) return;
        this.isDragging = true;
        this.start.x = this.targetX - (clientX * 2.5);
        this.start.y = this.targetY + (clientY * 2.5);
      };

      onMouseUp = () => {
        this.isDragging = false;
      };

      onTouchStart = (event) => {
        if (this.isDragging) return;
        this.isDragging = true;
        this.start.x = this.targetX - (event.touches[0].clientX * 2.5);
        this.start.y = this.targetY + (event.touches[0].clientY * 2.5);
      };

      onTouchMove = (event) => {
        if (!this.isDragging) return;
        event.preventDefault();
        this.targetX = this.start.x + (event.touches[0].clientX * 2.5);
        this.targetY = this.start.y - (event.touches[0].clientY * 2.5);
      };

      onTouchEnd = () => {
        this.isDragging = false;
      };

      onWheel = (event) => {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) event.preventDefault();
        this.wheel.x = event.wheelDeltaX || (event.deltaX * -1);
        this.wheel.y = event.wheelDeltaY || (event.deltaY * -1);
        if (isFirefox && event.deltaMode === 1) {
          this.wheel.x *= firefoxMultiplier;
          this.wheel.y *= firefoxMultiplier;
        }
        this.targetX += this.wheel.x * mouseMultiplier;
        this.targetY -= this.wheel.y * mouseMultiplier;
      };

      resize = () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        const zoom = window.__zoomVal ?? 1;
        this.camera.left = (viewportWidth / -2) * zoom;
        this.camera.right = (viewportWidth / 2) * zoom;
        this.camera.top = (viewportHeight / 2) * zoom;
        this.camera.bottom = (viewportHeight / -2) * zoom;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(viewportWidth, viewportHeight);

        const { bottom, right } = this.element.getBoundingClientRect();
        this.max.x = right;
        this.max.y = bottom;
        this.planes.forEach((plane) => plane.resize());
      };

      destroy() {
        gsap.ticker.remove(this.tick);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('resize', this.debouncedResize);
        clearTimeout(this.resizeTimer);
        this.planes.forEach((plane) => plane.dispose());
        geometry.dispose();
        material.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
        this.element.style.touchAction = '';
      }
    }

    const core = new Core();
    window.__homeCore = core;
    homeCanvasCleanup = () => {
      document.body.style.overscrollBehaviorX = '';
      document.documentElement.style.overscrollBehaviorX = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      core.destroy();
    };
  }

  function destroyHomeCanvas() {
    if (!homeCanvasCleanup) return;
    homeCanvasCleanup();
    homeCanvasCleanup = null;
  }

  document.addEventListener('DOMContentLoaded', initHomeCanvas);
})();
