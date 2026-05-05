interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = "w-4 h-4 text-white" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 8.5L12 3l7 5.5-2 1.5-5-4-5 4-2-1.5z" />
      <path d="M5 14L12 8.5l7 5.5-2 1.5-5-4-5 4-2-1.5z" opacity="0.75" />
      <path d="M5 19.5L12 14l7 5.5-2 1.5-5-4-5 4-2-1.5z" opacity="0.5" />
    </svg>
  );
}
