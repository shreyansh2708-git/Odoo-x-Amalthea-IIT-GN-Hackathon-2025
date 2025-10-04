import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertCircle, FileEdit } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'draft';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants = {
    pending: {
      variant: 'secondary' as const,
      icon: Clock,
      label: 'Pending',
    },
    approved: {
      variant: 'default' as const,
      icon: CheckCircle2,
      label: 'Approved',
      className: 'bg-success text-success-foreground hover:bg-success/90',
    },
    rejected: {
      variant: 'destructive' as const,
      icon: XCircle,
      label: 'Rejected',
    },
    processing: {
      variant: 'secondary' as const,
      icon: AlertCircle,
      label: 'Processing',
      className: 'bg-warning text-warning-foreground hover:bg-warning/90',
    },
    draft: {
      variant: 'outline' as const,
      icon: FileEdit,
      label: 'Draft',
    },
  };

  const config = variants[status];
  if (!config) {
    // Return a fallback badge if status is somehow invalid
    return <Badge className={className}>Unknown</Badge>;
  }
  
  const Icon = config.icon;
  const customClass = 'className' in config ? config.className : '';

  return (
    <Badge variant={config.variant} className={`${customClass} ${className || ''}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};