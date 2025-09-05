import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  linkToHome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'default',
  size = 'md',
  showTagline = false,
  className = '',
  linkToHome = true
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const variantClasses = {
    default: 'text-sage-700',
    dark: 'text-gray-900',
    light: 'text-white'
  };

  const logoContent = (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <svg 
        className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-12 h-12' : 'w-14 h-14'} mr-3`}
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Mind Bridge Symbol - Two connected semicircles representing connection and wellness */}
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"/>
        <path 
          d="M12 24C12 17.372 17.372 12 24 12V24L36 24C36 30.628 30.628 36 24 36V24L12 24Z" 
          fill="currentColor" 
          opacity="0.8"
        />
        <path 
          d="M18 24C18 20.686 20.686 18 24 18V24L30 24C30 27.314 27.314 30 24 30V24L18 24Z" 
          fill="currentColor" 
        />
      </svg>

      <div>
        {/* Main Logo Text */}
        <h1 className={`${sizeClasses[size]} ${variantClasses[variant]} font-bold tracking-tight leading-none`}>
          Interpret<span className="text-sage-500">Reflect</span>
        </h1>
        
        {/* Tagline */}
        {showTagline && (
          <p className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} ${
            variant === 'light' ? 'text-gray-200' : 'text-gray-600'
          } mt-1 font-medium tracking-wide`}>
            Wellness for Language Professionals
          </p>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link 
        to="/" 
        className="inline-block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 rounded-lg"
        aria-label="InterpretReflect - Home"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;