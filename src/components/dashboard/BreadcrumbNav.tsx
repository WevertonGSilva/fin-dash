import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm font-body mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-primary hover:underline cursor-pointer transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
