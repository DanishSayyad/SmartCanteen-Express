import { type PropsWithChildren, type ReactNode } from 'react';
import { useAuth } from '@/app/auth';
import { Button, Panel } from '@/components/ui';
import { cn } from '@/lib/utils';

export type ShellTab = {
  id: string;
  label: string;
  description: string;
};

export const AppShell = ({
  eyebrow,
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  children,
  actions
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  tabs: ShellTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  actions?: ReactNode;
}>) => {
  const { user, logout } = useAuth();

  return (
    <div className="page-gradient min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Panel className="overflow-hidden bg-gradient-to-br from-[#fff7eb] via-card to-[#f5ebd8]">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
              <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-ink">{title}</h1>
              <p className="mt-4 max-w-2xl text-sm text-[#5d584d]">{description}</p>
              <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
            </div>
            <div className="rounded-[1.75rem] border border-white/60 bg-[#2d4338] p-5 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/60">Signed in as</p>
              <h2 className="mt-3 font-display text-3xl">{user?.fullName}</h2>
              <p className="mt-2 text-sm text-white/75">{user?.email}</p>
              <div className="mt-5 grid gap-3 text-sm text-white/80">
                <div className="rounded-2xl bg-white/8 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Role</p>
                  <p className="mt-2 font-semibold">{user?.role.replace(/_/g, ' ')}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Tenant</p>
                  <p className="mt-2 font-semibold">{user?.tenantId ?? 'Platform scope'}</p>
                </div>
              </div>
              <Button
                className="mt-5 w-full bg-white/12 text-white hover:bg-white/18"
                variant="ghost"
                onClick={logout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <Panel className="h-fit">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7b6f5b]">Workspace</p>
            <div className="mt-4 flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    'rounded-[1.5rem] px-4 py-4 text-left transition',
                    activeTab === tab.id
                      ? 'bg-pine text-white shadow-card'
                      : 'bg-white/60 text-ink hover:bg-white/85'
                  )}
                  onClick={() => onTabChange(tab.id)}
                >
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className={cn('mt-1 text-xs', activeTab === tab.id ? 'text-white/70' : 'text-[#6b665a]')}>
                    {tab.description}
                  </p>
                </button>
              ))}
            </div>
          </Panel>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
};
