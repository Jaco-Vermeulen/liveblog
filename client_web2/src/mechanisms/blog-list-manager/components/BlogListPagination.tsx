import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LbButton } from '@/components/ui/LbButton';

export interface BlogListPaginationProps {
  page: number;
  maxResults: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function BlogListPagination({
  page,
  maxResults,
  total,
  onPageChange,
}: BlogListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / maxResults));
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-3"
      aria-label="Bloglys-bladsy"
    >
      <LbButton
        type="button"
        variant="secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Vorige bladsy"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Vorige
      </LbButton>
      <span className="text-sm text-mar-muted">
        Bladsy {page} van {totalPages}
      </span>
      <LbButton
        type="button"
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Volgende bladsy"
      >
        Volgende
        <ChevronRight className="h-4 w-4" aria-hidden />
      </LbButton>
    </nav>
  );
}
