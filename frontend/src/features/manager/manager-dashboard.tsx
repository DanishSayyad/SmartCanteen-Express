import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/app/auth';
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
  Select,
  SkeletonBlock,
  StatCard,
  Textarea
} from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { formatCompactNumber, formatCurrencyFromPaise, formatDateTime } from '@/lib/format';
import { managerActionsByStatus, orderStatusMeta } from '@/lib/order';
import type { MenuItem, OrderRecord } from '@/types/api';

type MenuFormState = {
  canteenId: string;
  name: string;
  description: string;
  category: string;
  priceInPaise: string;
  stockQuantity: string;
  isAvailable: boolean;
  imageFile: File | null;
};

type OrderActionDraft = {
  orderId: string;
  nextStatus: 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  reason: string;
};

const tabs = [
  { id: 'orders', label: 'Orders', description: 'Drive the kitchen lifecycle with only valid backend transitions.' },
  { id: 'menu', label: 'Menu', description: 'Create, update, and retire menu items assigned to your canteens.' },
  { id: 'payments', label: 'Payments', description: 'Review payment and refund activity scoped to your canteens.' },
  { id: 'scanner', label: 'Scanner', description: 'Confirm paid orders by scanning or pasting the signed QR token.' }
] as const;

const emptyMenuForm: MenuFormState = {
  canteenId: '',
  name: '',
  description: '',
  category: '',
  priceInPaise: '',
  stockQuantity: '0',
  isAvailable: true,
  imageFile: null
};

const orderStatusOptions = [
  '',
  'CREATED',
  'PAYMENT_PENDING',
  'QR_GENERATED',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'DELAYED',
  'CANCELLED',
  'REFUNDED',
  'ISSUE_REPORTED'
] as const;

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = tabs.some((tab) => tab.id === searchParams.get('tab')) ? searchParams.get('tab')! : 'orders';
  const assignedCanteens = user?.assignedCanteens ?? [];
  const [selectedCanteenId, setSelectedCanteenId] = useState(assignedCanteens[0]?.id ?? '');
  const [menuSearch, setMenuSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [paymentDateFrom, setPaymentDateFrom] = useState('');
  const [paymentDateTo, setPaymentDateTo] = useState('');
  const deferredMenuSearch = useDeferredValue(menuSearch);
  const deferredOrderSearch = useDeferredValue(orderSearch);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<MenuFormState>({
    ...emptyMenuForm,
    canteenId: assignedCanteens[0]?.id ?? ''
  });
  const [actionDraft, setActionDraft] = useState<OrderActionDraft | null>(null);
  const [manualScanToken, setManualScanToken] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastScanSummary, setLastScanSummary] = useState<{ orderId: string; status: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanBusyRef = useRef(false);

  useEffect(() => {
    if (!selectedCanteenId && assignedCanteens[0]) {
      setSelectedCanteenId(assignedCanteens[0].id);
      setMenuForm((current) => ({ ...current, canteenId: assignedCanteens[0].id }));
    }
  }, [assignedCanteens, selectedCanteenId]);

  const menuItemsQuery = useQuery({
    queryKey: ['manager', 'menu-items', selectedCanteenId],
    queryFn: () => api.manager.menuItems(selectedCanteenId || undefined),
    enabled: assignedCanteens.length > 0
  });

  const ordersQuery = useQuery({
    queryKey: ['manager', 'orders', orderStatusFilter],
    queryFn: () => api.manager.orders(orderStatusFilter || undefined),
    enabled: assignedCanteens.length > 0,
    refetchInterval: (query) => {
      const orders = query.state.data as OrderRecord[] | undefined;
      return orders?.some((order) =>
        ['QR_GENERATED', 'CONFIRMED', 'PREPARING', 'READY', 'DELAYED'].includes(order.status)
      )
        ? 7000
        : false;
    }
  });

  const paymentsQuery = useQuery({
    queryKey: ['manager', 'payments'],
    queryFn: () => api.manager.paymentReport(),
    enabled: assignedCanteens.length > 0
  });

  const filteredMenuItems = useMemo(() => {
    const query = deferredMenuSearch.toLowerCase();
    return (menuItemsQuery.data ?? []).filter((item) =>
      [item.name, item.description ?? '', item.category ?? ''].join(' ').toLowerCase().includes(query)
    );
  }, [deferredMenuSearch, menuItemsQuery.data]);

  const filteredOrders = useMemo(() => {
    const query = deferredOrderSearch.toLowerCase();
    const fromDate = orderDateFrom ? new Date(orderDateFrom) : null;
    const toDate = orderDateTo ? new Date(orderDateTo) : null;

    return (ordersQuery.data ?? []).filter((order) => {
      // Text search filter
      if (query) {
        const matches = [order.id, order.status, order.customer.fullName, order.canteen.name, ...order.orderItems.map((item) => item.menuItemName)]
          .join(' ')
          .toLowerCase()
          .includes(query);
        if (!matches) return false;
      }

      // Status filter
      if (orderStatusFilter && order.status !== orderStatusFilter) return false;

      // Date range filter
      const orderDate = new Date(order.createdAt);
      if (fromDate && orderDate < fromDate) return false;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        if (orderDate >= nextDay) return false;
      }

      return true;
    });
  }, [deferredOrderSearch, orderDateFrom, orderDateTo, orderStatusFilter, ordersQuery.data]);

  const paymentStats = useMemo(() => {
    const payments = paymentsQuery.data ?? [];
    const fromDate = paymentDateFrom ? new Date(paymentDateFrom) : null;
    const toDate = paymentDateTo ? new Date(paymentDateTo) : null;

    const filteredPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      if (fromDate && paymentDate < fromDate) return false;
      if (toDate) {
        const nextDay = new Date(toDate);
        nextDay.setDate(nextDay.getDate() + 1);
        if (paymentDate >= nextDay) return false;
      }
      return true;
    });

    return {
      total: filteredPayments.length,
      success: filteredPayments.filter((payment) => payment.status === 'SUCCESS').length,
      refunded: filteredPayments.filter((payment) => payment.status === 'REFUNDED').length,
      gmv: filteredPayments.reduce((sum, payment) => sum + payment.amountInPaise, 0)
    };
  }, [paymentDateFrom, paymentDateTo, paymentsQuery.data]);

  const invalidateManagerQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['manager', 'menu-items'] }),
      queryClient.invalidateQueries({ queryKey: ['manager', 'orders'] }),
      queryClient.invalidateQueries({ queryKey: ['manager', 'payments'] })
    ]);
  };

  const createMenuItemMutation = useMutation({
    mutationFn: async (payload: MenuFormState) => {
      const imageBase64 = payload.imageFile ? await readFileAsDataUrl(payload.imageFile) : undefined;
      return api.manager.createMenuItem({
        canteenId: payload.canteenId,
        name: payload.name,
        description: payload.description || undefined,
        category: payload.category || undefined,
        priceInPaise: Number(payload.priceInPaise),
        stockQuantity: Number(payload.stockQuantity),
        isAvailable: payload.isAvailable,
        imageBase64
      });
    },
    onSuccess: async () => {
      setMenuModalOpen(false);
      setMenuForm({ ...emptyMenuForm, canteenId: selectedCanteenId || assignedCanteens[0]?.id || '' });
      await invalidateManagerQueries();
      pushToast({
        title: 'Menu item created',
        description: 'The new item is immediately available through the manager menu route.',
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Menu creation failed',
        description: error instanceof ApiError ? error.message : 'Please review the menu item fields.',
        tone: 'error'
      });
    }
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async (payload: { id: string; values: MenuFormState }) => {
      const imageBase64 = payload.values.imageFile ? await readFileAsDataUrl(payload.values.imageFile) : undefined;
      return api.manager.updateMenuItem(payload.id, {
        canteenId: payload.values.canteenId,
        name: payload.values.name,
        description: payload.values.description || undefined,
        category: payload.values.category || undefined,
        priceInPaise: Number(payload.values.priceInPaise),
        stockQuantity: Number(payload.values.stockQuantity),
        isAvailable: payload.values.isAvailable,
        imageBase64
      });
    },
    onSuccess: async () => {
      setMenuModalOpen(false);
      setEditingMenuItem(null);
      setMenuForm({ ...emptyMenuForm, canteenId: selectedCanteenId || assignedCanteens[0]?.id || '' });
      await invalidateManagerQueries();
      pushToast({
        title: 'Menu item updated',
        description: 'The item changes are now reflected across manager and customer views.',
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

  const deleteMenuItemMutation = useMutation({
    mutationFn: (menuItemId: string) => api.manager.deleteMenuItem(menuItemId),
    onSuccess: async () => {
      await invalidateManagerQueries();
      pushToast({
        title: 'Menu item removed',
        description: 'The item has been deleted from the current canteen catalog.',
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Delete failed',
        description: error instanceof ApiError ? error.message : 'Please try again.',
        tone: 'error'
      });
    }
  });

  const orderActionMutation = useMutation({
    mutationFn: (payload: OrderActionDraft) =>
      api.manager.updateOrderStatus(payload.orderId, {
        nextStatus: payload.nextStatus,
        reason: payload.reason || undefined
      }),
    onSuccess: async (result) => {
      setActionDraft(null);
      await invalidateManagerQueries();
      pushToast({
        title: 'Order updated',
        description:
          'refundId' in result
            ? `Refund completed with id ${result.refundId}.`
            : `Order moved to ${orderStatusMeta[result.status].label}.`,
        tone: 'success'
      });
    },
    onError: (error) => {
      pushToast({
        title: 'Order update failed',
        description: error instanceof ApiError ? error.message : 'Please try again.',
        tone: 'error'
      });
    }
  });

  const executeScan = useCallback(
    async (signedToken: string) => {
      const result = await api.manager.scanQr(signedToken);
      setLastScanSummary({
        orderId: result.order.id,
        status: result.order.status
      });
      setManualScanToken('');
      await invalidateManagerQueries();
      pushToast({
        title: 'QR confirmed',
        description: `Order ${result.order.id.slice(0, 8)} is now ${orderStatusMeta[result.order.status].label}.`,
        tone: 'success'
      });
    },
    [pushToast, queryClient]
  );

  useEffect(() => {
    if (activeTab !== 'scanner' || !cameraEnabled) {
      return;
    }

    const Detector = window.BarcodeDetector;

    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not support live QR scanning. Use manual token entry instead.');
      return;
    }

    let stream: MediaStream | null = null;
    let frameId = 0;
    let cancelled = false;

    const stop = () => {
      cancelled = true;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startScanner = async () => {
      try {
        setCameraError('');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }
          }
        });

        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const detector = new Detector({ formats: ['qr_code'] });

        const tick = async () => {
          if (cancelled || !videoRef.current) {
            return;
          }

          if (videoRef.current.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && !scanBusyRef.current) {
            const codes = await detector.detect(videoRef.current);
            const rawValue = codes[0]?.rawValue?.trim();

            if (rawValue) {
              scanBusyRef.current = true;
              try {
                await executeScan(rawValue);
                setCameraEnabled(false);
              } catch (error) {
                setCameraError(error instanceof ApiError ? error.message : 'The scanned token could not be processed.');
              } finally {
                scanBusyRef.current = false;
              }

              return;
            }
          }

          frameId = requestAnimationFrame(() => {
            void tick();
          });
        };

        frameId = requestAnimationFrame(() => {
          void tick();
        });
      } catch (error) {
        setCameraError(error instanceof Error ? error.message : 'Camera access was denied.');
      }
    };

    void startScanner();

    return stop;
  }, [activeTab, cameraEnabled, executeScan]);

  const changeTab = (tabId: string) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      next.set('tab', tabId);
      setSearchParams(next, { replace: true });
    });
  };

  const openCreateMenuItem = () => {
    setEditingMenuItem(null);
    setMenuForm({ ...emptyMenuForm, canteenId: selectedCanteenId || assignedCanteens[0]?.id || '' });
    setMenuModalOpen(true);
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      canteenId: item.canteenId,
      name: item.name,
      description: item.description ?? '',
      category: item.category ?? '',
      priceInPaise: String(item.priceInPaise),
      stockQuantity: String(item.stockQuantity),
      isAvailable: item.isAvailable,
      imageFile: null
    });
    setMenuModalOpen(true);
  };

  const handleSaveMenuItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingMenuItem) {
      await updateMenuItemMutation.mutateAsync({
        id: editingMenuItem.id,
        values: menuForm
      });
      return;
    }

    await createMenuItemMutation.mutateAsync(menuForm);
  };

  const submitOrderAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actionDraft) {
      return;
    }
    await orderActionMutation.mutateAsync(actionDraft);
  };

  const submitManualScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!manualScanToken.trim()) {
      return;
    }

    try {
      await executeScan(manualScanToken.trim());
    } catch (error) {
      pushToast({
        title: 'Scan failed',
        description: error instanceof ApiError ? error.message : 'The QR token could not be validated.',
        tone: 'error'
      });
    }
  };

  return (
    <>
      <AppShell
        eyebrow="Kitchen operations"
        title="Run menu, fulfillment, payment reports, and QR confirmation from one console."
        description="The manager workspace is scoped to assigned canteens and surfaces only the actions the backend will actually accept."
        tabs={[...tabs]}
        activeTab={activeTab}
        onTabChange={changeTab}
        actions={activeTab === 'menu' ? <Button onClick={openCreateMenuItem}>Create menu item</Button> : undefined}
      >
        {assignedCanteens.length === 0 ? (
          <Panel>
            <EmptyState
              title="No canteens assigned"
              description="This manager account does not currently have any canteen assignments, so menu and order routes will remain empty."
            />
          </Panel>
        ) : (
          <div className="space-y-6">
            {activeTab === 'orders' ? (
              <Panel>
                <SectionHeading
                  eyebrow="Fulfillment board"
                  title="Operational order queue"
                  description="Delay marking and QR expiry handling are triggered by the backend manager order listing flow, so this screen stays aligned with the service lifecycle."
                  action={
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                        <Input
                          type="date"
                          value={orderDateFrom}
                          onChange={(event) => setOrderDateFrom(event.target.value)}
                          placeholder="From date"
                        />
                        <Input
                          type="date"
                          value={orderDateTo}
                          onChange={(event) => setOrderDateTo(event.target.value)}
                          placeholder="To date"
                        />
                      </div>
                      <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                        <Input
                          value={orderSearch}
                          onChange={(event) => setOrderSearch(event.target.value)}
                          placeholder="Search order, item, or customer"
                        />
                        <Select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
                          {orderStatusOptions.map((status) => (
                            <option key={status || 'all'} value={status}>
                              {status || 'All statuses'}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  }
                />
                {ordersQuery.isLoading ? (
                  <div className="mt-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonBlock key={index} className="h-72" />
                    ))}
                  </div>
                ) : filteredOrders.length ? (
                  <div className="mt-6 space-y-5">
                    {filteredOrders.map((order) => {
                      const actions = managerActionsByStatus[order.status] ?? [];
                      return (
                        <article
                          key={order.id}
                          className="rounded-[2rem] border border-[#ddcfb3] bg-white/80 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="font-display text-3xl text-ink">Order {order.id.slice(0, 8)}</h3>
                                <Badge tone={orderStatusMeta[order.status].tone}>{orderStatusMeta[order.status].label}</Badge>
                              </div>
                              <p className="mt-2 text-sm text-[#5d584d]">{orderStatusMeta[order.status].blurb}</p>
                              <p className="mt-2 text-sm text-[#6f695b]">
                                {order.customer.fullName} • {order.canteen.name} • {formatDateTime(order.createdAt)}
                              </p>
                            </div>
                            <div className="rounded-[1.5rem] bg-[#f8f1e3] px-4 py-3 text-right">
                              <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">Total</p>
                              <p className="mt-2 text-xl font-semibold text-ink">
                                {formatCurrencyFromPaise(order.totalInPaise)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {order.orderItems.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-[1.4rem] border border-[#e4d5ba] bg-[#fff8ed] p-4"
                              >
                                <p className="font-semibold text-ink">{item.menuItemName}</p>
                                <p className="mt-1 text-sm text-[#5d584d]">Quantity {item.quantity}</p>
                                <p className="mt-2 text-sm font-semibold text-ink">
                                  {formatCurrencyFromPaise(item.totalPriceInPaise)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {actions.length ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                              {actions.map((nextStatus) => (
                                <Button
                                  key={nextStatus}
                                  variant={nextStatus === 'CANCELLED' || nextStatus === 'REFUNDED' ? 'danger' : 'secondary'}
                                  onClick={() => setActionDraft({ orderId: order.id, nextStatus, reason: '' })}
                                >
                                  Mark {orderStatusMeta[nextStatus].label}
                                </Button>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="No orders matched"
                      description="Change the status filter or search term to widen the queue."
                    />
                  </div>
                )}
              </Panel>
            ) : null}

            {activeTab === 'menu' ? (
              <Panel>
                <SectionHeading
                  eyebrow="Catalog manager"
                  title="Menu items by canteen"
                  description="Menu CRUD is restricted to your assigned canteens and supports optional image uploads encoded as base64."
                  action={
                    <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                      <Select value={selectedCanteenId} onChange={(event) => setSelectedCanteenId(event.target.value)}>
                        {assignedCanteens.map((canteen) => (
                          <option key={canteen.id} value={canteen.id}>
                            {canteen.name}
                          </option>
                        ))}
                      </Select>
                      <Input
                        value={menuSearch}
                        onChange={(event) => setMenuSearch(event.target.value)}
                        placeholder="Search menu items"
                      />
                    </div>
                  }
                />
                {menuItemsQuery.isLoading ? (
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonBlock key={index} className="h-64" />
                    ))}
                  </div>
                ) : filteredMenuItems.length ? (
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {filteredMenuItems.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-[1.9rem] border border-[#ddcfb3] bg-white/75 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-semibold text-ink">{item.name}</h3>
                              <Badge tone={item.isAvailable ? 'success' : 'danger'}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-[#5d584d]">
                              {item.description || 'No description has been added yet.'}
                            </p>
                          </div>
                          <div className="rounded-[1.4rem] bg-[#f8f1e3] px-4 py-3 text-right">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">Price</p>
                            <p className="mt-2 text-lg font-semibold text-ink">
                              {formatCurrencyFromPaise(item.priceInPaise)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#6f695b]">
                          {item.category ? <Badge tone="accent">{item.category}</Badge> : null}
                          <span>Stock {item.stockQuantity}</span>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Button variant="secondary" onClick={() => openEditMenuItem(item)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              deleteMenuItemMutation.mutate(item.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="No menu items found"
                      description="Create the first item for this canteen or adjust the search term."
                      action={<Button onClick={openCreateMenuItem}>Create menu item</Button>}
                    />
                  </div>
                )}
              </Panel>
            ) : null}

            {activeTab === 'payments' ? (
              <Panel>
                <SectionHeading
                  eyebrow="Payment report"
                  title="Revenue and refund visibility"
                  description="The report is filtered by your canteen assignments on the backend before it reaches the UI."
                />
                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                  <Input
                    type="date"
                    value={paymentDateFrom}
                    onChange={(event) => setPaymentDateFrom(event.target.value)}
                    placeholder="From date"
                  />
                  <Input
                    type="date"
                    value={paymentDateTo}
                    onChange={(event) => setPaymentDateTo(event.target.value)}
                    placeholder="To date"
                  />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Payments"
                    value={formatCompactNumber(paymentStats.total)}
                    hint="All payment records visible to this manager."
                  />
                  <StatCard
                    label="Successful"
                    value={formatCompactNumber(paymentStats.success)}
                    hint="Confirmed successful payment records."
                  />
                  <StatCard
                    label="Refunded"
                    value={formatCompactNumber(paymentStats.refunded)}
                    hint="Refunded payment records."
                  />
                  <StatCard
                    label="GMV"
                    value={formatCurrencyFromPaise(paymentStats.gmv)}
                    hint="Aggregate payment amount observed in the report."
                  />
                </div>

                {paymentsQuery.isLoading ? (
                  <div className="mt-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonBlock key={index} className="h-28" />
                    ))}
                  </div>
                ) : paymentsQuery.data?.length ? (
                  <div className="mt-6 space-y-4">
                    {paymentsQuery.data.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-[1.7rem] border border-[#ddcfb3] bg-white/80 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-ink">Payment {payment.id.slice(0, 8)}</h3>
                              <Badge tone={payment.status === 'SUCCESS' ? 'success' : payment.status === 'REFUNDED' ? 'danger' : 'warning'}>
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-[#5d584d]">
                              Order {payment.order?.id.slice(0, 8)} • {payment.provider}
                            </p>
                            <p className="mt-1 text-sm text-[#6f695b]">{formatDateTime(payment.createdAt)}</p>
                          </div>
                          <div className="rounded-[1.4rem] bg-[#f8f1e3] px-4 py-3 text-right">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">Amount</p>
                            <p className="mt-2 text-lg font-semibold text-ink">
                              {formatCurrencyFromPaise(payment.amountInPaise)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InfoPill label="Provider order" value={payment.providerOrderId ?? 'Not available'} />
                          <InfoPill label="Provider payment" value={payment.providerPaymentId ?? 'Pending'} />
                          <InfoPill label="Method" value={payment.method ?? 'Not available'} />
                          <InfoPill label="Currency" value={payment.currency} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="No payments reported"
                      description="Payments will appear here as soon as your canteens start processing orders."
                    />
                  </div>
                )}
              </Panel>
            ) : null}

            {activeTab === 'scanner' ? (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Panel>
                  <SectionHeading
                    eyebrow="QR scanner"
                    title="Confirm customer arrival"
                    description="Scanning the signed token moves the order into CONFIRMED and consumes the QR token according to backend policy."
                  />
                  <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-[#ddcfb3] bg-[#1f241f]">
                    <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => setCameraEnabled((current) => !current)}>
                      {cameraEnabled ? 'Stop camera' : 'Start camera'}
                    </Button>
                    <Button variant="secondary" onClick={() => setCameraError('')}>
                      Clear status
                    </Button>
                  </div>
                  {cameraError ? <p className="mt-4 text-sm text-danger">{cameraError}</p> : null}
                  {lastScanSummary ? (
                    <div className="mt-4 rounded-[1.5rem] border border-[#ddcfb3] bg-white/75 p-4">
                      <p className="text-sm font-semibold text-ink">Last confirmed order</p>
                      <p className="mt-1 text-sm text-[#5d584d]">
                        {lastScanSummary.orderId} • {lastScanSummary.status}
                      </p>
                    </div>
                  ) : null}
                </Panel>

                <Panel>
                  <SectionHeading
                    eyebrow="Manual fallback"
                    title="Paste a signed token"
                    description="This keeps the scan route usable even on browsers that do not support native camera-based QR detection."
                  />
                  <form className="mt-6 grid gap-4" onSubmit={submitManualScan}>
                    <Field label="Signed token">
                      <Textarea
                        required
                        minLength={20}
                        value={manualScanToken}
                        onChange={(event) => setManualScanToken(event.target.value)}
                        placeholder="Paste the QR signed token here"
                      />
                    </Field>
                    <div className="flex flex-wrap gap-3">
                      <Button type="submit">Validate QR</Button>
                      <Button variant="secondary" type="button" onClick={() => setManualScanToken('')}>
                        Clear
                      </Button>
                    </div>
                  </form>
                </Panel>
              </div>
            ) : null}
          </div>
        )}
      </AppShell>

      <Modal
        open={menuModalOpen}
        title={editingMenuItem ? 'Update menu item' : 'Create menu item'}
        description="The manager menu item routes accept canteen-scoped item details and an optional base64 image."
        onClose={() => setMenuModalOpen(false)}
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSaveMenuItem}>
          <Field label="Canteen">
            <Select
              value={menuForm.canteenId}
              onChange={(event) => setMenuForm((current) => ({ ...current, canteenId: event.target.value }))}
            >
              {assignedCanteens.map((canteen) => (
                <option key={canteen.id} value={canteen.id}>
                  {canteen.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Item name">
            <Input
              required
              value={menuForm.name}
              onChange={(event) => setMenuForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Input
              value={menuForm.category}
              onChange={(event) => setMenuForm((current) => ({ ...current, category: event.target.value }))}
            />
          </Field>
          <Field label="Price in paise">
            <Input
              required
              type="number"
              min={1}
              value={menuForm.priceInPaise}
              onChange={(event) => setMenuForm((current) => ({ ...current, priceInPaise: event.target.value }))}
            />
          </Field>
          <Field label="Stock quantity">
            <Input
              required
              type="number"
              min={0}
              value={menuForm.stockQuantity}
              onChange={(event) => setMenuForm((current) => ({ ...current, stockQuantity: event.target.value }))}
            />
          </Field>
          <Field label="Image upload" hint="Max 5MB, JPG/PNG/WebP only">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (!file) {
                  setMenuForm((current) => ({ ...current, imageFile: null }));
                  return;
                }

                const MAX_SIZE = 5 * 1024 * 1024; // 5MB
                const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

                if (!ALLOWED_TYPES.includes(file.type)) {
                  pushToast({
                    title: 'Invalid file type',
                    description: 'Only JPG, PNG, and WebP images are supported.',
                    tone: 'error'
                  });
                  event.target.value = '';
                  return;
                }

                if (file.size > MAX_SIZE) {
                  pushToast({
                    title: 'File too large',
                    description: 'Image must be smaller than 5MB.',
                    tone: 'error'
                  });
                  event.target.value = '';
                  return;
                }

                setMenuForm((current) => ({ ...current, imageFile: file }));
              }}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                value={menuForm.description}
                onChange={(event) => setMenuForm((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
          </div>
          <label className="sm:col-span-2 flex items-center gap-3 rounded-[1.5rem] border border-[#ddcfb3] bg-white/75 px-4 py-3 text-sm text-ink">
            <input
              checked={menuForm.isAvailable}
              type="checkbox"
              onChange={(event) => setMenuForm((current) => ({ ...current, isAvailable: event.target.checked }))}
            />
            Item is available for customers
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}>
              {createMenuItemMutation.isPending || updateMenuItemMutation.isPending
                ? 'Saving...'
                : editingMenuItem
                  ? 'Save changes'
                  : 'Create item'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setMenuModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(actionDraft)}
        title={actionDraft ? `Update order to ${orderStatusMeta[actionDraft.nextStatus].label}` : 'Update order'}
        description="The backend enforces the valid state machine. Reasons are especially useful for cancel and refund actions."
        onClose={() => setActionDraft(null)}
      >
        <form className="grid gap-4" onSubmit={submitOrderAction}>
          <Field label="Reason">
            <Textarea
              value={actionDraft?.reason ?? ''}
              onChange={(event) =>
                setActionDraft((current) => (current ? { ...current, reason: event.target.value } : current))
              }
              placeholder="Optional context for the audit trail"
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={orderActionMutation.isPending}>
              {orderActionMutation.isPending ? 'Updating...' : 'Confirm action'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setActionDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read the uploaded file.'));
    reader.readAsDataURL(file);
  });

const InfoPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.35rem] border border-[#e4d5ba] bg-[#fff8ed] p-4">
    <p className="text-xs uppercase tracking-[0.18em] text-[#7b6f5b]">{label}</p>
    <p className="mt-2 text-sm font-semibold text-ink break-all">{value}</p>
  </div>
);
