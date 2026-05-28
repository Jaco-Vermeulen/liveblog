import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/mechanisms/auth-manager';

type NavDrawerUserBlockProps = {
  className?: string;
};

/** Signed-in user row inside the teal drawer (Maroela-style). */
export function NavDrawerUserBlock({ className }: NavDrawerUserBlockProps) {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const name = state.user?.display_name ?? state.user?.username ?? 'Gebruiker';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'mx-3 mb-3 flex items-center justify-between gap-3 rounded-[10px] border border-white/20 bg-black/15 px-3.5 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-sm font-bold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-semibold text-white">{name}</p>
          <button
            type="button"
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/65 hover:text-white"
            onClick={() => navigate('/profile')}
          >
            <User className="h-3.5 w-3.5" strokeWidth={2} />
            Profiel
          </button>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
        onClick={async () => {
          await logout();
          navigate('/login');
        }}
      >
        <LogOut className="h-3.5 w-3.5 text-mar-orange" strokeWidth={2} />
        Teken uit
      </button>
    </div>
  );
}
