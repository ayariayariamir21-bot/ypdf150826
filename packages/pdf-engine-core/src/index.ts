import type { PdfEngine, PdfEngineFactory, PdfEngineInitOptions } from './interfaces';
import type { PdfEngineId } from './types';

export * from './types';
export * from './interfaces';

const engineFactories = new Map<PdfEngineId, PdfEngineFactory>();

export function registerPdfEngine(factory: PdfEngineFactory): void {
  engineFactories.set(factory.id, factory);
}

export function unregisterPdfEngine(id: PdfEngineId): boolean {
  return engineFactories.delete(id);
}

export function isEngineRegistered(id: PdfEngineId): boolean {
  return engineFactories.has(id);
}

export function listRegisteredEngines(): readonly PdfEngineFactory[] {
  return [...engineFactories.values()];
}

export async function createEngine(
  id: PdfEngineId,
  options?: PdfEngineInitOptions
): Promise<PdfEngine> {
  const factory = engineFactories.get(id);
  if (!factory) {
    throw new PdfEngineNotFoundError(id);
  }
  return factory.create(options);
}

export class PdfEngineNotFoundError extends Error {
  readonly engineId: PdfEngineId;

  constructor(engineId: PdfEngineId) {
    super(`No PDF engine registered for id "${engineId}".`);
    this.name = 'PdfEngineNotFoundError';
    this.engineId = engineId;
  }
}
