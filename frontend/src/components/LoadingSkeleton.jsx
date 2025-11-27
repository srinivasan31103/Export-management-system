import React from 'react';
import { motion } from 'framer-motion';

// Base skeleton component
export function Skeleton({ className = '', variant = 'rectangular', animation = true }) {
  const baseClass = 'bg-gray-200 dark:bg-gray-700';
  const variantClass =
    variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg';
  const animationClass = animation ? 'animate-shimmer' : '';

  return (
    <div
      className={`${baseClass} ${variantClass} ${animationClass} ${className}`}
      style={
        animation
          ? {
              backgroundImage:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              backgroundSize: '200% 100%',
            }
          : {}
      }
    />
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx} className="px-6 py-3">
                <Skeleton className="h-4 w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ count = 1 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="card p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton variant="circular" className="h-10 w-10" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </motion.div>
      ))}
    </div>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg"
        >
          <Skeleton variant="circular" className="h-12 w-12 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </motion.div>
      ))}
    </div>
  );
}

// Stats skeleton
export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton variant="circular" className="h-10 w-10" />
          </div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </motion.div>
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 6 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx}>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex items-end gap-2" style={{ height: '200px' }}>
            {Array.from({ length: 12 }).map((_, barIdx) => (
              <Skeleton
                key={barIdx}
                className="flex-1"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton variant="circular" className="h-20 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Page skeleton (full page loader)
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <StatsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={10} columns={6} />
    </div>
  );
}

// Custom loading message component
export function LoadingMessage({ message = 'Loading...', icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        {icon || (
          <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full" />
        )}
      </motion.div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}

export default Skeleton;
