export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-white/[0.04] animate-pulse ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full min-h-screen p-4 md:p-6 lg:p-8 space-y-6" aria-label="Loading content">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBlock className="w-32 h-4" />
          <SkeletonBlock className="w-20 h-3" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
      <SkeletonBlock className="h-32" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
      </div>
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div className="w-full p-4 md:p-8 space-y-6" aria-label="Loading content">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-8 h-8 rounded-xl" />
        <SkeletonBlock className="w-40 h-5" />
      </div>
      <SkeletonBlock className="h-48 w-full" />
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
      <SkeletonBlock className="h-32 w-full" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2" aria-label="Loading leaderboard">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
          <SkeletonBlock className="w-6 h-6 rounded-lg" />
          <SkeletonBlock className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBlock className="w-28 h-3" />
            <SkeletonBlock className="w-16 h-2" />
          </div>
          <SkeletonBlock className="w-16 h-4 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
