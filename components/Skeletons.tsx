import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="retro-card p-6 animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-700 rounded w-5/6"></div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-gray-800 border-2 border-gray-700 p-4 rounded animate-pulse flex items-center gap-4"
      >
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="retro-card p-5 h-32 animate-pulse bg-gray-800/50">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="retro-card p-6 h-64 animate-pulse bg-gray-800/50"></div>
      </div>
      <div className="space-y-6">
        <div className="retro-card p-6 h-48 animate-pulse bg-gray-800/50"></div>
        <div className="retro-card p-6 h-48 animate-pulse bg-gray-800/50"></div>
      </div>
    </div>
  </div>
);
