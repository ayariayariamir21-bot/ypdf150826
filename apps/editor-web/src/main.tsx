import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { registerPdfEngine } from '@pdfplatform/pdf-engine-core';
import '@pdfplatform/ui/globals.css';
import './index.css';
import { App } from './App';
import { GlobalToastRegion } from '@/components/layout/GlobalToastRegion';
import { pdfJsEngineFactory } from '@/lib/pdfjsEngine';

registerPdfEngine(pdfJsEngineFactory);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <GlobalToastRegion />
  </React.StrictMode>
);
