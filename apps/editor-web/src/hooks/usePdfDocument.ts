import { useSyncExternalStore } from 'react';
import { getPdfLibSnapshot, subscribeToPdfLib } from '@/lib/pdfLib';

export function usePdfDocument() {
  return useSyncExternalStore(subscribeToPdfLib, getPdfLibSnapshot);
}
