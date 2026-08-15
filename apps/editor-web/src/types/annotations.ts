export const ANNOTATION_TYPES = [
  'highlight',
  'underline',
  'strike',
  'note',
  'drawing',
  'stamp',
  'signature',
  'redaction',
] as const;
export type AnnotationType = (typeof ANNOTATION_TYPES)[number];

export interface AnnotationBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  page: number;
  bbox: AnnotationBBox;
  content?: string;
  color?: string;
  createdAt: string;
}

export type AnnotationPatch = Partial<Pick<Annotation, 'bbox' | 'content' | 'color'>>;
