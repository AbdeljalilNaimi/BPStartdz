import logoStartDz from '@/assets/start-dz-logo.png';
import { cn } from '@/lib/utils';

interface BrandHeaderProps {
  variant?: 'compact' | 'full' | 'pdf';
  className?: string;
  hideText?: boolean;
}

/**
 * BrandHeader — institutional branding block.
 * - compact : sidebar/header (logo + 3 lines)
 * - full    : landing page (large logo + larger text block)
 * - pdf     : PDF cover (centered)
 */
export function BrandHeader({ variant = 'compact', className, hideText = false }: BrandHeaderProps) {
  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <img
          src={logoStartDz}
          alt="Start'Dz"
          className="h-14 w-auto object-contain shrink-0"
        />
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight leading-none">BPstartdz</p>
          <p className="text-sm text-muted-foreground mt-1.5">University Djilali Liabes Sidi Bel Abbes</p>
          <p className="text-xs text-muted-foreground italic">Modèle Financier</p>
        </div>
      </div>
    );
  }

  if (variant === 'pdf') {
    return (
      <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
        <img src={logoStartDz} alt="Start'Dz" className="h-20 w-auto object-contain" />
        <div>
          <p className="text-3xl font-bold tracking-tight">BPstartdz</p>
          <p className="text-sm text-muted-foreground mt-1">University Djilali Liabes Sidi Bel Abbes</p>
          <p className="text-xs text-muted-foreground italic">Modèle Financier</p>
        </div>
      </div>
    );
  }

  // compact
  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <img
        src={logoStartDz}
        alt="Start'Dz"
        className="h-9 w-auto object-contain shrink-0"
      />
      {!hideText && (
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-bold tracking-tight truncate">BPstartdz</p>
          <p className="text-[10px] text-muted-foreground truncate">University Djilali Liabes</p>
          <p className="text-[10px] text-muted-foreground italic truncate">Modèle Financier</p>
        </div>
      )}
    </div>
  );
}
