import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  return (
    <img 
      src="/logo.png" 
      alt="BharatPrint Logo" 
      className={`${sizes[size]} ${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;
