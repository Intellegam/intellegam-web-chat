'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

interface AnimatedNetworkProps {
  isDark?: boolean;
  density?: number;
  speed?: number;
  opacity?: number;
  terms?: string[];
}

interface KnowledgeFragment {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  content: string;
  connections: number[];
  age: number;
  maxAge: number;
  layer: number;
  phase: number;
}

interface Connection {
  from: KnowledgeFragment;
  to: KnowledgeFragment;
  strength: number;
  active: boolean;
  pulsePosition: number;
}

const AnimatedNetwork = ({
  isDark = true,
  density = 100,
  speed = 0.5,
  opacity = 0.8,
  terms = [
    'vector',
    'embedding',
    'token',
    'context',
    'attention',
    'transformer',
    'query',
    'semantic',
    'retrieval',
    'knowledge',
    'neural',
    'latent',
    'feature',
    'model',
    'inference',
    'gradient',
    'layer',
    'dimension',
    'representation',
    'similarity',
  ],
}: AnimatedNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const fragmentsRef = useRef<KnowledgeFragment[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const timeRef = useRef(0);
  const nextIdRef = useRef(0);

  // Configuration
  const config = useMemo(
    () => ({
      backgroundColor: isDark ? '#0a0e1b' : '#fafbfc',
      fragmentColors: isDark
        ? [
            [99, 102, 241],
            [168, 85, 247],
            [236, 72, 153],
            [34, 197, 94],
          ]
        : [
            [79, 70, 229],
            [147, 51, 234],
            [219, 39, 119],
            [22, 163, 74],
          ],
      textColor: isDark ? 'rgba(226, 232, 240, ' : 'rgba(30, 41, 59, ',
      connectionColor: isDark ? 'rgba(148, 163, 184, ' : 'rgba(100, 116, 139, ',
      pulseColor: isDark ? 'rgba(165, 180, 252, ' : 'rgba(129, 140, 248, ',
      minSize: 4,
      maxSize: 12,
      connectionDistance: 150,
      fragmentLifetime: 20000,
      pulseSpeed: 0.02,
      driftSpeed: 0.08,
      attractionStrength: 0.0005,
      layerSeparation: 100,
      initialFragments: 60,
      spawnRate: 0.02,
      words: terms,
    }),
    [isDark, terms],
  );

  // Create a new knowledge fragment
  const createFragment = useCallback(
    (x?: number, y?: number): KnowledgeFragment => {
      const { width, height } = dimensionsRef.current;
      const layer = Math.floor(Math.random() * 3);

      // Start from center with some random spread
      const centerX = width / 4 + width / 2;
      const centerY = height / 2;
      const spreadRadius = 350;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spreadRadius;

      const startX = x ?? centerX + Math.cos(angle) * radius;
      const startY = y ?? centerY + Math.sin(angle) * radius;

      return {
        id: nextIdRef.current++,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        size:
          config.minSize + Math.random() * (config.maxSize - config.minSize),
        content: config.words[Math.floor(Math.random() * config.words.length)],
        connections: [],
        age: 0,
        maxAge: config.fragmentLifetime + Math.random() * 5000,
        layer,
        phase: Math.random() * Math.PI * 2,
      };
    },
    [config],
  );

  // Initialize fragments
  const initializeFragments = useCallback(() => {
    fragmentsRef.current = Array.from({ length: config.initialFragments }, () =>
      createFragment(),
    );
  }, [config.initialFragments, createFragment]);

  // Update connections based on proximity and semantic similarity
  const updateConnections = useCallback(() => {
    connectionsRef.current = [];

    for (let i = 0; i < fragmentsRef.current.length; i++) {
      const fragment1 = fragmentsRef.current[i];
      fragment1.connections = [];

      for (let j = i + 1; j < fragmentsRef.current.length; j++) {
        const fragment2 = fragmentsRef.current[j];
        const dx = fragment1.x - fragment2.x;
        const dy = fragment1.y - fragment2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          // Simulate semantic similarity with some randomness
          const similarity = Math.random() > 0.7;

          if (similarity || Math.abs(fragment1.layer - fragment2.layer) <= 1) {
            const strength = 1 - distance / config.connectionDistance;

            connectionsRef.current.push({
              from: fragment1,
              to: fragment2,
              strength,
              active: false,
              pulsePosition: 0,
            });

            fragment1.connections.push(fragment2.id);
            fragment2.connections.push(fragment1.id);
          }
        }
      }
    }
  }, [config]);

  // Update fragments
  const updateFragments = useCallback(() => {
    const { width, height } = dimensionsRef.current;

    fragmentsRef.current = fragmentsRef.current.filter((fragment) => {
      // Age and lifecycle
      fragment.age++;
      if (fragment.age > fragment.maxAge) {
        return false;
      }

      // Repulsion from other fragments
      fragmentsRef.current.forEach((other) => {
        if (other.id !== fragment.id) {
          const dx = fragment.x - other.x;
          const dy = fragment.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Strong repulsion at close distances
          if (dist > 0 && dist < 60) {
            // Minimum distance of 60 pixels
            const repelForce = ((60 - dist) / 60) * 2; // Stronger repulsion
            fragment.targetX += (dx / dist) * repelForce;
            fragment.targetY += (dy / dist) * repelForce;
          }
        }
      });

      // Update position with very smooth drift
      const dx = fragment.targetX - fragment.x;
      const dy = fragment.targetY - fragment.y;
      fragment.x += dx * config.driftSpeed * speed;
      fragment.y += dy * config.driftSpeed * speed;

      // Set new target less frequently and with smaller movements
      if (Math.random() < 0.005) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40; // Smaller movements
        fragment.targetX = fragment.x + Math.cos(angle) * distance;
        fragment.targetY = fragment.y + Math.sin(angle) * distance;

        // Keep within bounds with padding
        fragment.targetX = Math.max(
          100,
          Math.min(width - 100, fragment.targetX),
        );
        fragment.targetY = Math.max(
          100,
          Math.min(height - 100, fragment.targetY),
        );
      }

      // Very subtle layer-based vertical drift
      fragment.targetY += (fragment.layer - 1) * 0.1;

      // Attraction to nearby fragments with connections (much weaker)
      fragment.connections.forEach((connId) => {
        const connected = fragmentsRef.current.find((f) => f.id === connId);
        if (connected) {
          const dx = connected.x - fragment.x;
          const dy = connected.y - fragment.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Only attract if not too close
          if (dist > 80 && dist < config.connectionDistance * 1.5) {
            fragment.targetX += dx * config.attractionStrength * 0.3; // Weaker attraction
            fragment.targetY += dy * config.attractionStrength * 0.3;
          }
        }
      });

      // Update phase for pulsing
      fragment.phase += 0.01; // Slower pulsing

      return true;
    });

    // Gradually spawn new fragments more frequently
    if (
      Math.random() < config.spawnRate &&
      fragmentsRef.current.length < density
    ) {
      fragmentsRef.current.push(createFragment());
    }

    // Update connection pulses (random activation)
    connectionsRef.current.forEach((connection) => {
      if (!connection.active && Math.random() < 0.001) {
        connection.active = true;
        connection.pulsePosition = 0;
      }

      if (connection.active) {
        connection.pulsePosition += config.pulseSpeed;
        if (connection.pulsePosition > 1) {
          connection.active = false;
          connection.pulsePosition = 0;
        }
      }
    });
  }, [config, speed, density, createFragment]);

  // Draw everything
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = dimensionsRef.current;

      // Clear canvas
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      ctx.lineCap = 'round';
      connectionsRef.current.forEach((connection) => {
        const alpha = connection.strength * opacity * 0.6;

        if (connection.active) {
          // Draw active pulse
          const x =
            connection.from.x +
            (connection.to.x - connection.from.x) * connection.pulsePosition;
          const y =
            connection.from.y +
            (connection.to.y - connection.from.y) * connection.pulsePosition;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
          gradient.addColorStop(0, `${config.pulseColor}0.8)`);
          gradient.addColorStop(1, `${config.pulseColor}0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw connection line
        ctx.strokeStyle = `${config.connectionColor + alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(connection.from.x, connection.from.y);
        ctx.lineTo(connection.to.x, connection.to.y);
        ctx.stroke();
      });

      // Draw fragments
      fragmentsRef.current.forEach((fragment) => {
        const ageRatio = fragment.age / fragment.maxAge;
        const fadeIn = Math.min(1, fragment.age / 100);
        const fadeOut = Math.max(0, 1 - Math.pow(ageRatio, 2));
        const alpha = fadeIn * fadeOut * opacity;

        const pulse = Math.sin(fragment.phase) * 0.3 + 0.7;
        const size = fragment.size * pulse;

        // Fragment glow
        const color =
          config.fragmentColors[fragment.id % config.fragmentColors.length];
        const gradient = ctx.createRadialGradient(
          fragment.x,
          fragment.y,
          0,
          fragment.x,
          fragment.y,
          size * 3,
        );
        gradient.addColorStop(0, `rgba(${color.join(',')}, ${alpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${color.join(',')}, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${color.join(',')}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fragment.x, fragment.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Fragment core
        ctx.fillStyle = `rgba(${color.join(',')}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(fragment.x, fragment.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw text label
        if (alpha > 0.3 && size > 6) {
          ctx.font = `${10 + size / 2}px monospace`;
          ctx.fillStyle = `${config.textColor + alpha * 0.7})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fragment.content, fragment.x, fragment.y + size + 15);
        }
      });
    },
    [config, opacity],
  );

  // Animation loop
  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      timeRef.current = timestamp;
      updateFragments();
      updateConnections();
      draw(ctx);

      animationRef.current = requestAnimationFrame(animate);
    },
    [updateFragments, updateConnections, draw],
  );

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { innerWidth, innerHeight } = window;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    dimensionsRef.current = { width: innerWidth, height: innerHeight };
  }, []);

  // Main effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleResize();
    initializeFragments();
    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, initializeFragments, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default AnimatedNetwork;
