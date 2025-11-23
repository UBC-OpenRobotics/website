/// <reference types="vite/client" />

interface Window {
  navigationData?: Array<{
    name: string;
    link: string;
  }>;
}
