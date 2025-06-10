'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

interface AnimatedPipesProps {
  isDark?: boolean;
  density?: number;
  speed?: number;
  opacity?: number;
}

interface Pipe {
  x: number;
  y: number;
  direction: number;
  speed: number;
  life: number;
  ttl: number;
  width: number;
  hue: number;
}

const AnimatedPipes = ({
  isDark = true,
  density = 20,
  speed = 0.5,
  opacity = 0.6,
}: AnimatedPipesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const pipesRef = useRef<Pipe[]>([]);
  const lastTimeRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Memoized configuration
  const config = useMemo(
    () => ({
      turnCount: 8,
      turnAmount: (360 / 8) * (Math.PI / 180),
      turnChanceRange: 58,
      baseSpeed: speed * 0.6,
      rangeSpeed: speed * 1.4,
      baseTTL: 150,
      rangeTTL: 300,
      baseWidth: 2,
      rangeWidth: 3,
      baseHue: isDark ? 200 : 220,
      rangeHue: 40,
      trailOpacity: isDark ? 0.02 : 0.015,
      pipeOpacity: isDark ? opacity * 1.5 : opacity * 1.2,
      lightness: isDark ? 60 : 40,
    }),
    [isDark, speed, opacity],
  );

  // Utility functions
  const utils = useMemo(
    () => ({
      rand: (n: number) => Math.random() * n,
      round: (n: number) => Math.round(n),
      cos: Math.cos,
      sin: Math.sin,
      fadeInOut: (life: number, ttl: number) => {
        const halfTTL = ttl * 0.5;
        const ratio =
          life <= halfTTL ? life / halfTTL : 1 - (life - halfTTL) / halfTTL;
        return Math.max(0, Math.min(1, ratio));
      },
    }),
    [],
  );

  // Create a new pipe
  const createPipe = useCallback((): Pipe => {
    const { width, height } = dimensionsRef.current;
    return {
      x: utils.rand(width),
      y: height * 0.5,
      direction: utils.round(utils.rand(1))
        ? Math.PI / 2
        : 2 * Math.PI - Math.PI / 2,
      speed: config.baseSpeed + utils.rand(config.rangeSpeed),
      life: 0,
      ttl: config.baseTTL + utils.rand(config.rangeTTL),
      width: config.baseWidth + utils.rand(config.rangeWidth),
      hue: config.baseHue + utils.rand(config.rangeHue),
    };
  }, [config, utils]);

  // Initialize pipes
  const initializePipes = useCallback(() => {
    pipesRef.current = Array.from({ length: density }, () => createPipe());
  }, [density, createPipe]);

  // Update a single pipe
  const updatePipe = useCallback(
    (pipe: Pipe, ctx: CanvasRenderingContext2D, deltaTime: number) => {
      const { width, height } = dimensionsRef.current;

      // Draw pipe with optimized rendering
      const fadeValue = utils.fadeInOut(pipe.life, pipe.ttl);
      const alpha = fadeValue * config.pipeOpacity;

      if (alpha > 0.01) {
        // Only draw if visible enough
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${pipe.hue}, 85%, ${config.lightness}%)`;
        ctx.lineWidth = pipe.width;
        ctx.beginPath();
        ctx.arc(pipe.x, pipe.y, pipe.width * 0.5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Update position with delta time for consistent movement
      const movement = pipe.speed * deltaTime * 0.016; // Normalize to ~60fps
      pipe.x += utils.cos(pipe.direction) * movement;
      pipe.y += utils.sin(pipe.direction) * movement;

      // Random turns with improved logic
      const shouldTurn =
        pipe.life % utils.round(utils.rand(config.turnChanceRange) + 10) ===
          0 &&
        (utils.round(pipe.x) % 6 === 0 || utils.round(pipe.y) % 6 === 0);

      if (shouldTurn) {
        const turnBias = utils.rand(1) > 0.5 ? 1 : -1;
        pipe.direction += config.turnAmount * turnBias;
      }

      // Wrap around screen edges
      if (pipe.x > width) pipe.x = 0;
      else if (pipe.x < 0) pipe.x = width;
      if (pipe.y > height) pipe.y = 0;
      else if (pipe.y < 0) pipe.y = height;

      pipe.life++;

      // Reset pipe if expired
      if (pipe.life > pipe.ttl) {
        Object.assign(pipe, createPipe());
      }
    },
    [config, utils, createPipe],
  );

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { innerWidth, innerHeight } = window;
    const dpr = window.devicePixelRatio || 1;

    // Set actual size
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;

    // Scale CSS size
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;

    // Scale context for high DPI
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    dimensionsRef.current = { width: innerWidth, height: innerHeight };
  }, []);

  // Animation loop with performance optimizations
  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Clear with trail effect but faster fade
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = isDark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, dimensionsRef.current.width, dimensionsRef.current.height);
      
      ctx.globalAlpha = 1;

      // Update all pipes
      pipesRef.current.forEach((pipe) => {
        updatePipe(pipe, ctx, deltaTime);
      });

      animationRef.current = requestAnimationFrame(animate);
    },
    [config, isDark, updatePipe],
  );

  // Main effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize
    handleResize();
    initializePipes();

    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, initializePipes, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default AnimatedPipes;
