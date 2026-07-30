export {};

declare global {
  interface Window {
    Razorpay: new (options: unknown) => { open: () => void };
    html2pdf: () => {
      from: (element: HTMLElement) => {
        set: (options: unknown) => {
          save: () => void;
        };
      };
    };
  }
}
