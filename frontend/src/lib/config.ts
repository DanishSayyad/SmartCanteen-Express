export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api',
  backendBaseUrl:
    import.meta.env.VITE_BACKEND_BASE_URL?.replace(/\/$/, '') ??
    (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api').replace(/\/api$/, ''),
  paymentMode: import.meta.env.VITE_PAYMENT_MODE ?? 'fake',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? 'rzp_test_key',
  enableQaTools: import.meta.env.VITE_ENABLE_QA_TOOLS === 'true'
} as const;
