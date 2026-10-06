interface Star {
  x: number;
  y: number;
  z: number;
  origZ: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hasSpikes: boolean;
}

export class Starfield {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private stars: Star[] = [];
  private numStars: number = 320;
  private width: number = 0;
  private height: number = 0;
  private fov: number = 400;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;

  // Parallax tracking
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.init();
  }

  private init(): void {
    if (!this.ctx) return;

    this.handleResize();
    this.createStars();
    this.bindEvents();
    this.start();
  }

  private handleResize = (): void => {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  };

  private createStars(): void {
    this.stars = [];
    const spreadX = Math.max(1600, this.width * 1.5);
    const spreadY = Math.max(1200, this.height * 1.5);
    const maxZ = 1000;

    for (let i = 0; i < this.numStars; i++) {
      const z = Math.random() * maxZ + 1;
      this.stars.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: z,
        origZ: z,
        // Gentle 3D drift in all directions
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.35,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        hasSpikes: Math.random() < 0.08,
      });
    }
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);

    window.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      this.mouseX = clientX - this.width / 2;
      this.mouseY = clientY - this.height / 2;

      this.targetCameraX = (this.mouseX / (this.width / 2)) * 35;
      this.targetCameraY = (this.mouseY / (this.height / 2)) * 25;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning || !this.ctx) return;

    // Smooth camera lerp for authentic 3D depth parallax
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.05;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.05;

    // Ensure entire physical backing store is wiped cleanly regardless of subpixel DPI transforms
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    const cx = this.width / 2;
    const cy = this.height / 2;
    const spreadX = Math.max(1600, this.width * 1.5);
    const spreadY = Math.max(1200, this.height * 1.5);
    const maxZ = 1000;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Update 3D position
      star.x += star.vx;
      star.y += star.vy;
      star.z += star.vz;
      star.twinklePhase += star.twinkleSpeed;

      // Wrap boundaries
      if (star.x < -spreadX / 2) star.x = spreadX / 2;
      if (star.x > spreadX / 2) star.x = -spreadX / 2;
      if (star.y < -spreadY / 2) star.y = spreadY / 2;
      if (star.y > spreadY / 2) star.y = -spreadY / 2;
      if (star.z <= 1) star.z = maxZ;
      if (star.z > maxZ) star.z = 1;

      // 3D Perspective Projection
      const scale = this.fov / (this.fov + star.z);
      const px = cx + (star.x - this.cameraX) * scale;
      const py = cy + (star.y - this.cameraY) * scale;

      // Off-screen check
      if (px < -20 || px > this.width + 20 || py < -20 || py > this.height + 20) {
        continue;
      }

      // Compute dynamic opacity and size based on depth + twinkling
      const depthFactor = 1 - star.z / maxZ;
      const twinkle = Math.sin(star.twinklePhase) * 0.25;
      const alpha = Math.min(1, Math.max(0.1, (star.baseAlpha + twinkle) * (depthFactor * 0.8 + 0.2)));
      const size = Math.max(0.6, star.radius * scale * 1.8);

      // Render star glow
      this.ctx.save();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      this.ctx.shadowColor = `rgba(255, 255, 255, ${(alpha * 0.8).toFixed(3)})`;
      this.ctx.shadowBlur = size > 1.4 ? 6 : 2;

      this.ctx.beginPath();
      this.ctx.arc(px, py, size, 0, Math.PI * 2);
      this.ctx.fill();

      // Sparkle spikes on bright close stars
      if (star.hasSpikes && size > 1.6 && alpha > 0.6) {
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${(alpha * 0.4).toFixed(3)})`;
        this.ctx.lineWidth = 0.7;
        const spikeLen = size * 3.2;

        this.ctx.beginPath();
        this.ctx.moveTo(px - spikeLen, py);
        this.ctx.lineTo(px + spikeLen, py);
        this.ctx.moveTo(px, py - spikeLen);
        this.ctx.lineTo(px, py + spikeLen);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
  }
}
