export type RoleCode = 'SUPER_ADMIN' | 'CANTEEN_MANAGER' | 'CUSTOMER';

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'QR_GENERATED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'ISSUE_REPORTED'
  | 'DELAYED';

export type PaymentStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type ApiEnvelope<TData> = {
  success: boolean;
  message?: string;
  data?: TData;
  details?: unknown;
  errors?: unknown;
};

export type BackendHealth = {
  status: string;
  timestamp: string;
  environment: string;
};

export type UserProfile = {
  id: string;
  tenantId: string | null;
  email: string;
  fullName: string;
  phone: string;
  studentFacultyId: string | null;
  yearOfStudy: number | null;
  role: RoleCode;
  assignedCanteens: Canteen[];
};

export type AuthSession = {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
};

export type CollegePublic = {
  id: string;
  name: string;
  slug: string;
  code: string;
};

export type CollegeSummary = {
  id: string;
  name: string;
  slug: string;
  code: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    canteens: number;
    orders: number;
  };
};

export type Canteen = {
  id: string;
  tenantId: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ManagerSummary = {
  id: string;
  tenantId: string | null;
  email: string;
  fullName: string;
  phone: string;
  studentFacultyId: string | null;
  yearOfStudy: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role: {
    code: RoleCode;
    name?: string | null;
  };
};

export type ManagerAssignment = {
  id: string;
  tenantId: string;
  managerId: string;
  canteenId: string;
  createdAt: string;
  manager: ManagerSummary;
  canteen: Canteen;
};

export type MenuItem = {
  id: string;
  tenantId: string;
  canteenId: string;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  priceInPaise: number;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  canteen?: Canteen | null;
};

export type CartItem = {
  menuItemId: string;
  quantity: number;
};

export type OrderItem = {
  id: string;
  tenantId: string;
  orderId: string;
  menuItemId: string | null;
  menuItemName: string;
  imageUrl: string | null;
  unitPriceInPaise: number;
  quantity: number;
  totalPriceInPaise: number;
  createdAt: string;
};

export type OrderPayment = {
  id: string;
  tenantId: string;
  orderId: string;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  providerSignature: string | null;
  providerReceipt: string | null;
  method: string | null;
  idempotencyKey: string;
  amountInPaise: number;
  refundedAmountInPaise: number;
  currency: string;
  webhookEventId: string | null;
  status: PaymentStatus;
  gatewayResponse: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    tenantId: string;
    canteenId: string;
    customerId: string;
    totalInPaise: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
  };
};

export type QrToken = {
  id: string;
  tenantId: string;
  orderId: string;
  tokenHash: string;
  signedToken: string;
  nonce: string;
  expiresAt: string;
  scannedAt: string | null;
  scannedById: string | null;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = {
  id: string;
  tenantId: string;
  canteenId: string;
  customerId: string;
  status: OrderStatus;
  subtotalInPaise: number;
  taxInPaise: number;
  totalInPaise: number;
  currency: string;
  issueReason: string | null;
  delayMarkedAt: string | null;
  paymentInitiatedAt: string | null;
  paidAt: string | null;
  qrGeneratedAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  payment: OrderPayment | null;
  qrToken: QrToken | null;
  canteen: Canteen;
  customer: ManagerSummary;
};

export type AnalyticsOverview = {
  activeTenants: number;
  totalCustomers: number;
  totalManagers: number;
  totalOrders: number;
  paidPayments: number;
  grossMerchandiseValueInPaise: number;
  ordersByStatus: Array<{
    status: OrderStatus;
    _count: {
      _all: number;
    };
  }>;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegistrationPayload = {
  tenantId: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  studentFacultyId?: string;
  yearOfStudy?: number;
};
