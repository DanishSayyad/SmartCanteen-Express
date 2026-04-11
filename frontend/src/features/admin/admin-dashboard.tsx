import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/app/toasts';
import { AppShell } from '@/components/app-shell';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  Panel,
  SectionHeading,
  SkeletonBlock,
  StatCard
} from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { formatCompactNumber, formatCurrencyFromPaise } from '@/lib/format';
import { orderStatusMeta } from '@/lib/order';
import type { Canteen, CollegeSummary } from '@/types/api';

type CollegeFormState = {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  defaultCanteenName: string;
  defaultCanteenLocation: string;
};

type ManagerFormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  canteenId: string;
};

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Cross-tenant analytics and live platform health.'
  },
  {
    id: 'colleges',
    label: 'Colleges',
    description: 'Create, update, deactivate, and share registration links.'
  },
  {
    id: 'managers',
    label: 'Managers',
    description: 'Inspect canteens and assign campus managers.'
  }
] as const;

const emptyCollegeForm: CollegeFormState = {
  name: '',
  code: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  defaultCanteenName: '',
  defaultCanteenLocation: ''
};

const emptyManagerForm: ManagerFormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  canteenId: ''
};

export const AdminDashboard = () => {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeSummary | null>(null);
  const [collegeForm, setCollegeForm] = useState<CollegeFormState>(emptyCollegeForm);
  const [managerModalOpen, setManagerModalOpen] = useState(false);
  const [managerForm, setManagerForm] = useState<ManagerFormState>(emptyManagerForm);

  const activeTab = tabs.some((tab) => tab.id === searchParams.get('tab')) ? searchParams.get('tab')! : 'overview';

  const analyticsQuery = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.admin.analytics()
  });

  const collegesQuery = useQuery({
    queryKey: ['admin', 'colleges'],
    queryFn: () => api.admin.listColleges()
  });

  const filteredColleges = useMemo(() => {
    const colleges = collegesQuery.data ?? [];
    if (!deferredSearch.trim()) {
      return colleges;
    }

    const query = deferredSearch.toLowerCase();
    return colleges.filter((college) =>
      [college.name, college.code, college.contactEmail].join(' ').toLowerCase().includes(query)
    );
  }, [collegesQuery.data, deferredSearch]);

  useEffect(() => {
    if (!selectedCollegeId && filteredColleges[0]) {
      setSelectedCollegeId(filteredColleges[0].id);
    }
  }, [filteredColleges, selectedCollegeId]);

  const selectedCollege =
    filteredColleges.find((college) => college.id === selectedCollegeId) ??
    collegesQuery.data?.find((college) => college.id === selectedCollegeId) ??
    null;

  const canteensQuery = useQuery({
    queryKey: ['admin', 'canteens', selectedCollegeId],
    queryFn: () => api.admin.listCollegeCanteens(selectedCollegeId),
    enabled: Boolean(selectedCollegeId)
  });

  const managersQuery = useQuery({
    queryKey: ['admin', 'managers', selectedCollegeId],
    queryFn: () => api.admin.listManagers(selectedCollegeId),
    enabled: Boolean(selectedCollegeId)
  });

  useEffect(() => {
    const firstCanteenId = canteensQuery.data?.[0]?.id;
    if (!managerForm.canteenId && firstCanteenId) {
      setManagerForm((current) => ({ ...current, canteenId: firstCanteenId }));
    }
  }, [canteensQuery.data, managerForm.canteenId]);

  const invalidateAdminQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'canteens', selectedCollegeId] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers', selectedCollegeId] })
    ]);
  };

  const createCollegeMutation = useMutation({
    mutationFn: (payload: CollegeFormState) =>
      api.admin.createCollege({
        ...payload,
        contactPhone: payload.contactPhone || undefined,
        address: payload.address || undefined,
        defaultCanteenLocation: payload.defaultCanteenLocation || undefined
      }),
    onSuccess: async (result) => {
      setCollegeModalOpen(false);
      setCollegeForm(emptyCollegeForm);
      setSelectedCollegeId(result.canteen.tenantId);
      await invalidateAdminQueries();
      pushToast({
        title: 'College created',
        description: `${result.college.name} is now active with ${result.canteen.name}.`,
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Could not create college',
        description: error instanceof ApiError ? error.message : 'Please review the college details.',
        tone: 'error'
      });
    }
  });

  const updateCollegeMutation = useMutation({
    mutationFn: (payload: { id: string; values: Partial<CollegeFormState> & { isActive?: boolean } }) =>
      api.admin.updateCollege(payload.id, payload.values),
    onSuccess: async () => {
      setEditingCollege(null);
      setCollegeModalOpen(false);
      setCollegeForm(emptyCollegeForm);
      await invalidateAdminQueries();
      pushToast({
        title: 'College updated',
        description: 'The college profile has been refreshed.',
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Update failed',
        description: error instanceof ApiError ? error.message : 'Please try again.',
        tone: 'error'
      });
    }
  });

  const deactivateCollegeMutation = useMutation({
    mutationFn: (collegeId: string) => api.admin.deactivateCollege(collegeId),
    onSuccess: async () => {
      await invalidateAdminQueries();
      pushToast({
        title: 'College deactivated',
        description: 'The tenant has been disabled for future sign-ins and registrations.',
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Deactivation failed',
        description: error instanceof ApiError ? error.message : 'Please try again.',
        tone: 'error'
      });
    }
  });

  const assignManagerMutation = useMutation({
    mutationFn: (payload: ManagerFormState) =>
      api.admin.assignManager({
        ...payload,
        tenantId: selectedCollegeId
      }),
    onSuccess: async () => {
      setManagerModalOpen(false);
      setManagerForm({
        ...emptyManagerForm,
        canteenId: canteensQuery.data?.[0]?.id ?? ''
      });
      await invalidateAdminQueries();
      pushToast({
        title: 'Manager assigned',
        description: 'The canteen manager account is live and linked to the selected canteen.',
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Assignment failed',
        description: error instanceof ApiError ? error.message : 'Please review the manager details.',
        tone: 'error'
      });
    }
  });

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      next.set('tab', tabId);
      setSearchParams(next, { replace: true });
    });
  };

  const openCreateModal = () => {
    setEditingCollege(null);
    setCollegeForm(emptyCollegeForm);
    setCollegeModalOpen(true);
  };

  const openEditModal = (college: CollegeSummary) => {
    setEditingCollege(college);
    setCollegeForm({
      name: college.name,
      code: college.code,
      contactEmail: college.contactEmail,
      contactPhone: college.contactPhone ?? '',
      address: college.address ?? '',
      defaultCanteenName: '',
      defaultCanteenLocation: ''
    });
    setCollegeModalOpen(true);
  };

  const copySignupLink = async (college: CollegeSummary) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/register?tenantId=${college.id}`);
      pushToast({
        title: 'Invite link copied',
        description: `The student signup link for ${college.name} is ready to share.`,
        tone: 'success'
      });
    } catch {
      pushToast({
        title: 'Clipboard unavailable',
        description: 'Copying is blocked in this browser context.',
        tone: 'error'
      });
    }
  };

  const handleCollegeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingCollege) {
      await updateCollegeMutation.mutateAsync({
        id: editingCollege.id,
        values: {
          name: collegeForm.name,
          contactEmail: collegeForm.contactEmail,
          contactPhone: collegeForm.contactPhone || undefined,
          address: collegeForm.address || undefined
        }
      });
      return;
    }

    await createCollegeMutation.mutateAsync(collegeForm);
  };

  const handleManagerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await assignManagerMutation.mutateAsync(managerForm);
  };

  const stats = analyticsQuery.data;

  return (
    <>
      <AppShell
        eyebrow="Platform control room"
        title="Operate every tenant from a single service dashboard."
        description="Analytics, college lifecycle management, registration links, and manager assignment all stay anchored to the live backend contracts."
        tabs={[...tabs]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        actions={<Button onClick={openCreateModal}>Create college</Button>}
      >
        <div className="space-y-6">
          {activeTab === 'overview' ? (
            <Panel>
              <SectionHeading
                eyebrow="Analytics"
                title="Live platform health"
                description="These figures come directly from the backend overview analytics route and give you instant visibility into adoption, volume, and payment activity."
              />
              {analyticsQuery.isLoading ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonBlock key={index} className="h-40" />
                  ))}
                </div>
              ) : stats ? (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Active tenants"
                      value={formatCompactNumber(stats.activeTenants)}
                      hint="Live colleges currently enabled for operations."
                    />
                    <StatCard
                      label="Customers"
                      value={formatCompactNumber(stats.totalCustomers)}
                      hint="Registered students and faculty across all tenants."
                    />
                    <StatCard
                      label="Managers"
                      value={formatCompactNumber(stats.totalManagers)}
                      hint="Canteen operators with active manager access."
                    />
                    <StatCard
                      label="GMV"
                      value={formatCurrencyFromPaise(stats.grossMerchandiseValueInPaise)}
                      hint={`${formatCompactNumber(stats.totalOrders)} orders recorded on the platform.`}
                    />
                  </div>
                  <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                    <div className="rounded-[1.75rem] border border-[#dcccae] bg-white/75 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Order mix</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {stats.ordersByStatus.map((statusRow) => (
                          <div
                            key={statusRow.status}
                            className="rounded-full border border-[#ddcfb3] bg-[#f8f1e3] px-4 py-2"
                          >
                            <span className="text-sm font-semibold text-ink">
                              {orderStatusMeta[statusRow.status].label}
                            </span>
                            <span className="ml-2 text-sm text-[#6f695b]">{statusRow._count._all}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-[#dcccae] bg-gradient-to-br from-[#fff7ea] to-[#efe3cf] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Payment health</p>
                      <p className="mt-4 font-display text-4xl text-ink">{formatCompactNumber(stats.paidPayments)}</p>
                      <p className="mt-2 text-sm text-[#5d584d]">
                        Successful payment records completed across the platform.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Analytics unavailable"
                  description="The overview route did not return data. Check connectivity and try again."
                />
              )}
            </Panel>
          ) : null}

          {activeTab === 'colleges' ? (
            <Panel>
              <SectionHeading
                eyebrow="Tenant directory"
                title="Create and manage colleges"
                description="Search the tenant catalog, update contact details, pause access, and generate the exact signup links students can use for registration."
                action={
                  <div className="w-full sm:w-80">
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by college, code, or email"
                    />
                  </div>
                }
              />

              {collegesQuery.isLoading ? (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonBlock key={index} className="h-56" />
                  ))}
                </div>
              ) : filteredColleges.length ? (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {filteredColleges.map((college) => (
                    <article
                      key={college.id}
                      className="rounded-[1.9rem] border border-[#ddcfb3] bg-white/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-display text-3xl text-ink">{college.name}</h3>
                            <Badge tone={college.isActive ? 'success' : 'danger'}>
                              {college.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-[#5d584d]">
                            {college.code} • {college.contactEmail}
                          </p>
                          <p className="mt-2 text-sm text-[#6f695b]">
                            {college.address || 'Address not configured'}
                          </p>
                        </div>
                        <Button variant="secondary" onClick={() => setSelectedCollegeId(college.id)}>
                          Inspect
                        </Button>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.4rem] bg-[#f8f1e3] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">Users</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{college._count.users}</p>
                        </div>
                        <div className="rounded-[1.4rem] bg-[#f8f1e3] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">Canteens</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{college._count.canteens}</p>
                        </div>
                        <div className="rounded-[1.4rem] bg-[#f8f1e3] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">Orders</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{college._count.orders}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={() => openEditModal(college)}>
                          Edit college
                        </Button>
                        {college.isActive ? (
                          <>
                            <Button variant="ghost" onClick={() => copySignupLink(college)}>
                              Copy signup link
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => {
                                deactivateCollegeMutation.mutate(college.id);
                              }}
                            >
                              Deactivate
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="No colleges matched"
                    description="Try a different search term or create a new college tenant."
                    action={<Button onClick={openCreateModal}>Create college</Button>}
                  />
                </div>
              )}
            </Panel>
          ) : null}

          {activeTab === 'managers' ? (
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Panel>
                <SectionHeading
                  eyebrow="Selected tenant"
                  title={selectedCollege?.name ?? 'Choose a college'}
                  description={
                    selectedCollege
                      ? 'Use the manager list and canteen directory below to keep operational ownership up to date.'
                      : 'Choose a college from the tenant directory to inspect its manager assignments.'
                  }
                  action={selectedCollege ? <Button onClick={() => setManagerModalOpen(true)}>Assign manager</Button> : null}
                />

                {!selectedCollege ? (
                  <div className="mt-6">
                    <EmptyState
                      title="No college selected"
                      description="Open the Colleges tab or inspect one of the tenant cards to continue."
                    />
                  </div>
                ) : (
                  <>
                    <div className="mt-6 rounded-[1.75rem] border border-[#ddcfb3] bg-[#f8f1e3] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Canteens</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {canteensQuery.isLoading ? (
                          <>
                            <SkeletonBlock className="h-12 w-40" />
                            <SkeletonBlock className="h-12 w-40" />
                          </>
                        ) : canteensQuery.data?.length ? (
                          canteensQuery.data.map((canteen) => (
                            <CanteenBadge key={canteen.id} canteen={canteen} />
                          ))
                        ) : (
                          <p className="text-sm text-[#5d584d]">No canteens are available for this tenant.</p>
                        )}
                      </div>
                    </div>
                    {selectedCollege.isActive ? (
                      <div className="mt-6 rounded-[1.75rem] border border-[#ddcfb3] bg-white/75 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Shareable student signup link</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Input readOnly value={`${window.location.origin}/register?tenantId=${selectedCollege.id}`} />
                          <Button onClick={() => copySignupLink(selectedCollege)}>Copy</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-[1.75rem] border border-[#ddcfb3] bg-[#fef0e6] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6f5b]">Signup limited</p>
                        <p className="mt-2 text-sm text-[#5d584d]">This college is currently deactivated. Activate it to share signup links with students.</p>
                      </div>
                    )}
                  </>
                )}
              </Panel>

              <Panel>
                <SectionHeading
                  eyebrow="Manager roster"
                  title="Current operators"
                  description="This view consumes the manager listing route for the currently selected college."
                />
                {managersQuery.isLoading ? (
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonBlock key={index} className="h-24" />
                    ))}
                  </div>
                ) : managersQuery.data?.length ? (
                  <div className="mt-6 space-y-4">
                    {managersQuery.data.map((manager) => (
                      <div
                        key={manager.id}
                        className="rounded-[1.7rem] border border-[#ddcfb3] bg-white/75 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-ink">{manager.fullName}</h3>
                            <p className="mt-1 text-sm text-[#5d584d]">{manager.email}</p>
                            <p className="mt-1 text-sm text-[#6f695b]">{manager.phone}</p>
                          </div>
                          <Badge tone="accent">{manager.role.code.replace(/_/g, ' ')}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="No managers assigned"
                      description="Assign the first canteen manager for this tenant to begin menu and order operations."
                      action={selectedCollege ? <Button onClick={() => setManagerModalOpen(true)}>Assign manager</Button> : undefined}
                    />
                  </div>
                )}
              </Panel>
            </div>
          ) : null}
        </div>
      </AppShell>

      <Modal
        open={collegeModalOpen}
        title={editingCollege ? 'Update college' : 'Create college'}
        description={
          editingCollege
            ? 'Refresh the tenant profile details. Existing canteen assignments will be preserved.'
            : 'A default canteen will be created together with the new college tenant.'
        }
        onClose={() => setCollegeModalOpen(false)}
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCollegeSubmit}>
          <Field label="College name">
            <Input
              required
              value={collegeForm.name}
              onChange={(event) => setCollegeForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>
          <Field label="College code">
            <Input
              required
              value={collegeForm.code}
              disabled={Boolean(editingCollege)}
              onChange={(event) => setCollegeForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
            />
          </Field>
          <Field label="Contact email">
            <Input
              required
              type="email"
              value={collegeForm.contactEmail}
              onChange={(event) => setCollegeForm((current) => ({ ...current, contactEmail: event.target.value }))}
            />
          </Field>
          <Field label="Contact phone">
            <Input
              value={collegeForm.contactPhone}
              onChange={(event) => setCollegeForm((current) => ({ ...current, contactPhone: event.target.value }))}
            />
          </Field>
          <Field label="Address">
            <Input
              value={collegeForm.address}
              onChange={(event) => setCollegeForm((current) => ({ ...current, address: event.target.value }))}
            />
          </Field>
          {!editingCollege ? (
            <>
              <Field label="Default canteen name">
                <Input
                  required
                  value={collegeForm.defaultCanteenName}
                  onChange={(event) =>
                    setCollegeForm((current) => ({ ...current, defaultCanteenName: event.target.value }))
                  }
                />
              </Field>
              <Field label="Default canteen location">
                <Input
                  value={collegeForm.defaultCanteenLocation}
                  onChange={(event) =>
                    setCollegeForm((current) => ({ ...current, defaultCanteenLocation: event.target.value }))
                  }
                />
              </Field>
            </>
          ) : null}
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={createCollegeMutation.isPending || updateCollegeMutation.isPending}>
              {createCollegeMutation.isPending || updateCollegeMutation.isPending
                ? 'Saving...'
                : editingCollege
                  ? 'Save changes'
                  : 'Create tenant'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setCollegeModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={managerModalOpen}
        title="Assign canteen manager"
        description="This flow uses the manager assignment route and binds the new operator to a specific tenant canteen."
        onClose={() => setManagerModalOpen(false)}
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleManagerSubmit}>
          <Field label="Full name">
            <Input
              required
              value={managerForm.fullName}
              onChange={(event) => setManagerForm((current) => ({ ...current, fullName: event.target.value }))}
            />
          </Field>
          <Field label="Email">
            <Input
              required
              type="email"
              value={managerForm.email}
              onChange={(event) => setManagerForm((current) => ({ ...current, email: event.target.value }))}
            />
          </Field>
          <Field label="Phone">
            <Input
              required
              minLength={8}
              value={managerForm.phone}
              onChange={(event) => setManagerForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </Field>
          <Field label="Temporary password">
            <Input
              required
              type="password"
              minLength={8}
              value={managerForm.password}
              onChange={(event) => setManagerForm((current) => ({ ...current, password: event.target.value }))}
            />
          </Field>
          <Field label="Canteen">
            <select
              className="input-base"
              value={managerForm.canteenId}
              onChange={(event) => setManagerForm((current) => ({ ...current, canteenId: event.target.value }))}
            >
              <option value="">Choose a canteen</option>
              {canteensQuery.data?.map((canteen) => (
                <option key={canteen.id} value={canteen.id}>
                  {canteen.name} {canteen.location ? `• ${canteen.location}` : ''}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={assignManagerMutation.isPending || !selectedCollegeId}>
              {assignManagerMutation.isPending ? 'Assigning...' : 'Assign manager'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setManagerModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const CanteenBadge = ({ canteen }: { canteen: Canteen }) => (
  <div className="rounded-full border border-[#ddcfb3] bg-white px-4 py-3 text-sm text-ink">
    <span className="font-semibold">{canteen.name}</span>
    {canteen.location ? <span className="ml-2 text-[#6f695b]">{canteen.location}</span> : null}
  </div>
);
