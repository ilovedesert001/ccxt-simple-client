/// <reference types="react-scripts" />

declare global {
  interface Window {
    aa: number;
    ccxt: typeof ccxt;
    accounting: any;
  }
}

declare var accounting: any;
