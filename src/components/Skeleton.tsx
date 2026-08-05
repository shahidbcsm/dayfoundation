import React from 'react';
import '../styles/pages.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius, 
  className = '', 
  style 
}) => {
  return (
    <div 
      className={`skeleton-base ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        borderRadius: borderRadius || '8px',
        ...style
      }}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card">
      <Skeleton height="190px" borderRadius="12px 12px 0 0" />
      <div className="skeleton-card-content">
        <Skeleton height="24px" width="80%" style={{ marginBottom: '12px' }} />
        <Skeleton height="16px" width="100%" style={{ marginBottom: '8px' }} />
        <Skeleton height="16px" width="90%" style={{ marginBottom: '8px' }} />
        <Skeleton height="16px" width="60%" />
      </div>
    </div>
  );
};
