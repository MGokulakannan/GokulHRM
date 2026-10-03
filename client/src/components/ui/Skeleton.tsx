import "./Skeleton.css";

interface SkeletonProps {
  height?: number;
  width?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}

export const Skeleton = ({ height = 14, width = "100%", radius = 6, style }: SkeletonProps) => (
  <div
    className="gh-skeleton"
    style={{ height, width, borderRadius: radius, ...style }}
    aria-hidden="true"
  />
);

export const SkeletonRows = ({ rows = 4 }: { rows?: number }) => (
  <div className="gh-skeleton-rows">
    {Array.from({ length: rows }).map((_, index) => (
      <Skeleton key={index} height={16} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="gh-skeleton-card">
    <Skeleton height={12} width="40%" />
    <Skeleton height={28} width="60%" style={{ marginTop: 10 }} />
    <Skeleton height={10} width="50%" style={{ marginTop: 8 }} />
  </div>
);
