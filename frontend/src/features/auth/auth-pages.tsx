import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { useToast } from '@/app/toasts';
import { BackendStatusCard } from '@/components/backend-status-card';
import { Button, EmptyState, Field, Input, Panel, Select, SkeletonBlock } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { appConfig } from '@/lib/config';
import type { RegistrationPayload } from '@/types/api';

const demoAccounts = [
  { label: 'Super Admin', email: 'owner@smartcanteen.com', password: 'SuperAdmin@123' },
  { label: 'Alpha Manager', email: 'manager.alpha@smartcanteen.com', password: 'Manager@123' },
  { label: 'Alpha Customer', email: 'student.alpha@smartcanteen.com', password: 'Customer@123' }
];

const authHeroCards = [
  'One role-aware workspace for platform, kitchen, and customer journeys.',
  'Live cart, order, QR, payment, and campus operations all driven from the backend contract.',
  'Optimized for daily canteen operations on both desktop counters and mobile handsets.'
];

export const LandingRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [formState, setFormState] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formState);
      pushToast({
        title: 'Session started',
        description: 'Your dashboard has been restored.',
        tone: 'success'
      });
      navigate('/app', { replace: true });
    } catch (error) {
      pushToast({
        title: 'Could not sign in',
        description: error instanceof ApiError ? error.message : 'Please check your credentials and try again.',
        tone: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-gradient min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="overflow-hidden bg-gradient-to-br from-pine via-[#355243] to-[#223228] text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/55">Smart Canteen</p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl leading-tight">
            A sharper front desk for campus food operations.
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-white/78">
            Sign in once and the workspace adapts itself for owners, managers, or customers without splitting the
            product into disconnected tools.
          </p>
          <div className="mt-8 grid gap-4">
            {authHeroCards.map((copy) => (
              <div
                key={copy}
                className="rounded-[1.75rem] border border-white/10 bg-white/8 p-4 text-sm text-white/80"
              >
                {copy}
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="animate-in">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Access portal</p>
          <h2 className="mt-4 font-display text-4xl text-ink">Welcome back</h2>
          <p className="mt-3 text-sm text-[#5d584d]">
            Use the same credential flow for every backend role. Refresh rotation and role-based routing happen
            automatically.
          </p>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <Field label="Email">
              <Input
                required
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              />
            </Field>
            <Field label="Password">
              <Input
                required
                type="password"
                minLength={8}
                value={formState.password}
                onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
              />
            </Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {appConfig.enableQaTools ? (
            <div className="mt-8 rounded-[1.75rem] border border-[#dcccae] bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Demo accounts</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.label}
                    type="button"
                    className="rounded-[1.4rem] border border-[#ddcfb3] bg-[#f8f1e3] px-4 py-3 text-left transition hover:border-accent/40 hover:bg-white"
                    onClick={() => setFormState({ email: account.email, password: account.password })}
                  >
                    <p className="text-sm font-semibold text-ink">{account.label}</p>
                    <p className="mt-1 text-xs text-[#6f695b]">{account.email}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <BackendStatusCard
              title="Public service checks"
              description="The root and health routes are queried live here so sign-in issues are easier to separate from backend outages."
            />
          </div>

          <p className="mt-8 text-sm text-[#5d584d]">
            Need a new student account?{' '}
            <Link className="font-semibold text-accent" to="/register">
              Create one here
            </Link>
            .
          </p>
        </Panel>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { pushToast } = useToast();
  const [searchParams] = useSearchParams();
  const linkedTenantId = searchParams.get('tenantId') ?? '';
  const [selectedTenantId, setSelectedTenantId] = useState(linkedTenantId);
  const [manualTenantId, setManualTenantId] = useState('');
  const [formState, setFormState] = useState<RegistrationPayload>({
    tenantId: linkedTenantId,
    email: '',
    password: '',
    fullName: '',
    phone: '',
    studentFacultyId: '',
    yearOfStudy: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tenantsQuery = useQuery({
    queryKey: ['auth', 'tenants'],
    queryFn: () => api.auth.listTenants()
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const linkedTenant = useMemo(
    () => tenantsQuery.data?.find((tenant) => tenant.id === linkedTenantId) ?? null,
    [linkedTenantId, tenantsQuery.data]
  );

  const resolvedTenantId = linkedTenant?.id || selectedTenantId || manualTenantId;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resolvedTenantId) {
      pushToast({
        title: 'Tenant required',
        description: 'Choose a campus or paste a tenant ID before continuing.',
        tone: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        ...formState,
        tenantId: resolvedTenantId,
        studentFacultyId: formState.studentFacultyId || undefined,
        yearOfStudy: formState.yearOfStudy || undefined
      });

      pushToast({
        title: 'Account created',
        description: 'Your session is live and the customer workspace is ready.',
        tone: 'success'
      });
      navigate('/app', { replace: true });
    } catch (error) {
      pushToast({
        title: 'Could not create account',
        description: error instanceof ApiError ? error.message : 'Please review your details and try again.',
        tone: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-gradient min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel className="overflow-hidden bg-gradient-to-br from-[#fff7ea] via-card to-[#f3ead7]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Student onboarding</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-ink">Create your campus canteen account.</h1>
          <p className="mt-4 text-sm text-[#5d584d]">
            Registration uses the live tenant catalog from the backend, and admins can deep-link students directly into
            the right college from the platform dashboard.
          </p>

          <div className="mt-8 space-y-4">
            {tenantsQuery.isLoading ? (
              <>
                <SkeletonBlock className="h-20" />
                <SkeletonBlock className="h-20" />
              </>
            ) : tenantsQuery.data?.length ? (
              tenantsQuery.data.map((tenant) => (
                <div
                  key={tenant.id}
                  className="rounded-[1.6rem] border border-[#ddd0b8] bg-white/70 p-4"
                >
                  <p className="text-sm font-semibold text-ink">{tenant.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#7b6f5b]">{tenant.code}</p>
                  <p className="mt-3 text-xs text-[#6b665a]">Tenant ID: {tenant.id}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No active colleges yet"
                description="The registration route is live, but the platform does not currently expose any active college tenants."
              />
            )}
          </div>
        </Panel>

        <Panel className="animate-in">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Secure signup</p>
          <h2 className="mt-4 font-display text-4xl text-ink">Open a customer session</h2>
          <p className="mt-3 text-sm text-[#5d584d]">
            Your session tokens are issued immediately after registration, so there is no dead-end handoff after the
            form is complete.
          </p>

          <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            {linkedTenant ? (
              <div className="sm:col-span-2 rounded-[1.6rem] border border-accent/20 bg-accent/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Linked campus</p>
                <p className="mt-2 text-base font-semibold text-ink">{linkedTenant.name}</p>
                <p className="mt-1 text-sm text-[#5d584d]">{linkedTenant.code}</p>
              </div>
            ) : (
              <>
                <Field label="College">
                  <Select
                    value={selectedTenantId}
                    onChange={(event) => setSelectedTenantId(event.target.value)}
                  >
                    <option value="">Choose a college</option>
                    {tenantsQuery.data?.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.code})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Manual tenant ID"
                  hint="Use this if your college shared a tenant ID directly."
                >
                  <Input
                    value={manualTenantId}
                    onChange={(event) => setManualTenantId(event.target.value)}
                    placeholder="Paste tenant UUID"
                  />
                </Field>
              </>
            )}

            <Field label="Full name">
              <Input
                required
                value={formState.fullName}
                onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
              />
            </Field>
            <Field label="Email">
              <Input
                required
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <Input
                required
                minLength={8}
                value={formState.phone}
                onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              />
            </Field>
            <Field label="Password" hint="Minimum 8 characters required">
              <Input
                required
                type="password"
                minLength={8}
                value={formState.password}
                onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
              />
            </Field>
            <Field label="Student or faculty ID">
              <Input
                value={formState.studentFacultyId ?? ''}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, studentFacultyId: event.target.value }))
                }
              />
            </Field>
            <Field label="Year of study">
              <Input
                min={1}
                max={8}
                type="number"
                value={formState.yearOfStudy ?? ''}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    yearOfStudy: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
              />
            </Field>

            <div className="sm:col-span-2">
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <BackendStatusCard
              title="Registration route status"
              description="Tenant lookup, service identity, and API heartbeat are visible before account creation starts."
            />
          </div>

          <p className="mt-8 text-sm text-[#5d584d]">
            Already have an account?{' '}
            <Link className="font-semibold text-accent" to="/login">
              Return to sign in
            </Link>
            .
          </p>
        </Panel>
      </div>
    </div>
  );
};

export const NotFoundPage = () => (
  <div className="page-gradient flex min-h-screen items-center justify-center px-4 py-10">
    <Panel className="max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Not found</p>
      <h1 className="mt-4 font-display text-5xl text-ink">This route is off the menu.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-[#5d584d]">
        The page you requested does not exist in the current frontend map. Use the main workspace or the authentication
        screens to get back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white" to="/app">
          Go to workspace
        </Link>
        <Link className="inline-flex rounded-full border border-[#d7c8ab] px-5 py-3 text-sm font-semibold text-ink" to="/login">
          Go to login
        </Link>
      </div>
    </Panel>
  </div>
);
