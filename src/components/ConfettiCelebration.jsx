import React, { useEffect, useRef, useState } from 'react';

const ConfettiCelebration = ({ isActive, onComplete, duration = 5000 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const confettiPieces = useRef([]);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti piece class
    class ConfettiPiece {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 8 + 5;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.color = this.getRandomColor();
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
        this.opacity = 1;
      }

      getRandomColor() {
        const colors = [
          '#FFC700', // Gold
          '#FF0080', // Pink
          '#00D4FF', // Cyan
          '#7B61FF', // Purple
          '#FF6B00', // Orange
          '#00FF88', // Green
          '#FF0000', // Red
          '#FFEB3B', // Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        
        // Add gravity effect
        this.speedY += 0.1;

        // Fade out near the bottom
        if (this.y > canvas.height - 100) {
          this.opacity -= 0.02;
        }

        // Reset if out of bounds
        if (this.y > canvas.height + 10 || this.opacity <= 0) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
          this.opacity = 1;
          this.speedY = Math.random() * 3 + 2;
        }

        // Bounce off sides
        if (this.x < 0 || this.x > canvas.width) {
          this.speedX *= -1;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        if (this.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else {
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();
      }
    }

    // Create confetti pieces
    const numPieces = 150;
    confettiPieces.current = [];
    for (let i = 0; i < numPieces; i++) {
      confettiPieces.current.push(new ConfettiPiece());
    }

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > duration) {
        cancelAnimationFrame(animationRef.current);
        confettiPieces.current = [];
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.current.forEach((piece) => {
        piece.update();
        piece.draw();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ background: 'transparent' }}
    />
  );
};

export default ConfettiCelebration;
