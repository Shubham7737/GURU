"use client";

import React, { useEffect, useRef } from 'react';

const CanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const equations = [
      // Math
      "E = mc²", "∫ e^x dx = e^x + C", "A = πr²", "a² + b² = c²", "e^(iπ) + 1 = 0",
      "∇ × B = μ₀J + μ₀ε₀(∂E/∂t)", "lim(x→0) (sin x)/x = 1",
      // Physics
      "F = ma", "v = u + at", "p = mv", "W = Fd", "V = IR", "F = G(m₁m₂)/r²",
      "λ = h/p", "ΔxΔp ≥ ℏ/2",
      // Chemistry
      "H₂O", "CO₂", "CH₄", "C₆H₁₂O₆", "NaCl", "pH = -log[H⁺]",
      "PV = nRT", "ΔG = ΔH - TΔS",
      // Biology
      "DNA → RNA", "ATP ⇌ ADP + Pi", "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
      "Mitosis", "Meiosis"
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.text = equations[Math.floor(Math.random() * equations.length)];
        
        // Depth simulation
        this.depth = Math.random(); // 0 to 1
        this.size = this.depth * 18 + 10; // 10 to 28
        
        // Slower, elegant floating speed
        this.speedX = (Math.random() - 0.5) * (this.depth + 0.2) * 1.2;
        this.speedY = (Math.random() - 0.5) * (this.depth + 0.2) * 1.2;
        
        // Professional Light Theme Colors
        // Soft purple, soft blue, subtle slate
        const colors = [
          `rgba(99, 102, 241, `,  // Indigo
          `rgba(59, 130, 246, `,  // Blue
          `rgba(148, 163, 184, `, // Slate
          `rgba(168, 85, 247, `   // Purple
        ];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        
        // Opacity based on depth - background items are more faded
        this.baseOpacity = this.depth * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around smoothly
        if (this.x > canvas.width + 150) this.x = -150;
        else if (this.x < -150) this.x = canvas.width + 150;
        
        if (this.y > canvas.height + 150) this.y = -150;
        else if (this.y < -150) this.y = canvas.height + 150;
      }

      draw() {
        ctx.font = `${this.size}px "Inter", "Outfit", sans-serif`;
        // Subtle glow effect
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fillStyle = `${this.colorBase}${this.baseOpacity})`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.shadowBlur = 0; // Reset
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(window.innerWidth / 18, 60); // Optimal density
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Clear with very light gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8fafc'); // Slate 50
      gradient.addColorStop(1, '#f1f5f9'); // Slate 100
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default CanvasBackground;
