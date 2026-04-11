import { appConfig } from '@/lib/config';
import { sleep } from '@/lib/utils';

let razorpayLoader: Promise<void> | null = null;

export const ensureRazorpayCheckout = async () => {
  if (window.Razorpay) {
    return;
  }

  if (!razorpayLoader) {
    razorpayLoader = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')), {
          once: true
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.razorpayCheckout = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  }

  return razorpayLoader;
};

export const waitForWebhookSettlement = async () => {
  await sleep(350);
};
