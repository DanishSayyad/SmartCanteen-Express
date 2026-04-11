import { useQuery } from '@tanstack/react-query';
import { Badge, SkeletonBlock } from '@/components/ui';
import { api } from '@/lib/api';
import { appConfig } from '@/lib/config';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export const BackendStatusCard = ({
  title,
  description,
  className
}: {
  title: string;
  description: string;
  className?: string;
}) => {
  const statusQuery = useQuery({
    queryKey: ['system', 'public-status'],
    queryFn: async () => {
      const [serviceInfo, health] = await Promise.all([api.system.serviceInfo(), api.system.health()]);
      return { serviceInfo, health };
    },
    staleTime: 60_000
  });

  return (
    <section className={cn('rounded-[1.75rem] border border-[#ddcfb3] bg-white/70 p-5', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Live backend</p>
      <h3 className="mt-3 font-display text-3xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-[#5d584d]">{description}</p>

      {statusQuery.isLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-16 sm:col-span-2" />
        </div>
      ) : statusQuery.data ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge tone={statusQuery.data.health.status === 'ok' ? 'success' : 'danger'}>
              {statusQuery.data.health.status}
            </Badge>
            <span className="text-sm text-[#5d584d]">{statusQuery.data.health.environment}</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatusRow label="Service route" value={statusQuery.data.serviceInfo} />
            <StatusRow label="Heartbeat" value={formatDateTime(statusQuery.data.health.timestamp)} />
            <StatusRow label="API base" value={appConfig.apiBaseUrl} className="sm:col-span-2" />
          </div>
        </>
      ) : (
        <p className="mt-5 text-sm text-danger">Backend status is unavailable right now.</p>
      )}
    </section>
  );
};

const StatusRow = ({
  label,
  value,
  className
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={cn('rounded-[1.35rem] border border-[#e4d5ba] bg-[#fff8ed] p-4', className)}>
    <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">{label}</p>
    <p className="mt-2 text-sm font-semibold text-ink break-all">{value}</p>
  </div>
);
