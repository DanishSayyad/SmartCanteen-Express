/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BACKEND_BASE_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_PAYMENT_MODE?: 'razorpay' | 'fake';
  readonly VITE_ENABLE_QA_TOOLS?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type DetectedBarcode = {
  rawValue?: string;
};

interface BarcodeDetector {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetector;
  getSupportedFormats?: () => Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export {};
