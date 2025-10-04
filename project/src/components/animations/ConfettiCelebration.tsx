import type React from "react";
import { useEffect, useState } from "react";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  trigger,
  onComplete,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);

      // Generate confetti particles
      const newParticles: ConfettiParticle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: [
          'var(--color-green-500)',
          'var(--color-indigo-500)',
          'var(--color-success)',
          'var(--color-green-400)',
          'var(--color-indigo-400)',
        ][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.3,
      }));

      setParticles(newParticles);

      // Clear after animation
      setTimeout(() => {
        setParticles([]);
        setIsAnimating(false);
        onComplete?.();
      }, 3000);
    }
  }, [trigger, isAnimating, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: '10px',
            height: '10px',
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            borderRadius: '2px',
            animation: `confettiFall 2.5s ease-out ${particle.delay}s forwards`,
          }}
        />
      ))}

      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
