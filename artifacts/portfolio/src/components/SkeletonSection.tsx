interface SkeletonSectionProps {
  height?: string;
  className?: string;
}

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 rounded-xl animate-pulse ${className}`}
    />
  );
}

export default function SkeletonSection({
  height = "400px",
  className = "",
}: SkeletonSectionProps) {
  return (
    <section className={`relative py-24 lg:py-32 overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SkeletonPulse className="h-3 w-20 mx-auto mb-4 rounded-full" />
          <SkeletonPulse className="h-10 w-64 mx-auto mb-4" />
          <SkeletonPulse className="h-4 w-96 mx-auto" />
        </div>
        <div style={{ height }} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonPulse key={i} className="rounded-2xl h-40" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SkeletonHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <SkeletonPulse className="h-6 w-40 rounded-full" />
            <SkeletonPulse className="h-20 w-full max-w-md" />
            <div className="flex gap-2">
              <SkeletonPulse className="h-7 w-28 rounded-md" />
              <SkeletonPulse className="h-7 w-32 rounded-md" />
              <SkeletonPulse className="h-7 w-36 rounded-md" />
            </div>
            <SkeletonPulse className="h-16 w-full max-w-xl" />
            <div className="flex gap-4">
              <SkeletonPulse className="h-12 w-32 rounded-xl" />
              <SkeletonPulse className="h-12 w-36 rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end">
            <SkeletonPulse className="w-80 h-96 rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
