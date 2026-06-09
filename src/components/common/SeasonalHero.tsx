import { useEffect, useState } from 'react';
import { getSeasonalImage } from '@/lib/seasonalImages';

interface SeasonalHeroProps {
  pageKey: string;
  title: string;
  description: string;
  className?: string;
}

/**
 * SeasonalHero Component
 * 
 * Features:
 * - Automatic seasonal background switching
 * - Smooth fade-in animation on load
 * - Subtle parallax scrolling effect
 * - Responsive image loading
 * - WebP support with fallback
 */
export function SeasonalHero({ pageKey, title, description, className = '' }: SeasonalHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const imageUrl = getSeasonalImage(pageKey);

  // Preload image for smooth fade-in
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImageLoaded(true);
  }, [imageUrl]);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5; // Subtle parallax effect

  return (
    <div 
      className={`seasonal-hero gradient-animate rounded-lg p-8 text-white relative overflow-hidden ${className}`}
      style={{
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out',
      }}
    >
      {/* Background Image Layer with Parallax */}
      <div
        className="seasonal-hero-bg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: imageUrl ? `url('${imageUrl}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: `center ${-parallaxOffset}px`,
          transform: `translateY(${parallaxOffset * 0.3}px)`,
          transition: 'transform 0.1s ease-out',
          zIndex: 0,
        }}
      />
      
      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(46, 125, 50, 0.85), rgba(46, 125, 50, 0.85))',
          zIndex: 1,
        }}
      />
      
      {/* Content Layer */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 className="text-3xl font-bold mb-2 animate-fade-in">{title}</h1>
        <p className="text-white/90 animate-fade-in-delay">{description}</p>
      </div>
    </div>
  );
}

// Default export for compatibility
export default SeasonalHero;