import type { JSONValue } from 'ai';

export enum AnnotationType {
  ToolCall = 'toolCallMetadata',
  Source = 'source',
}

interface TypedAnnotation {
  annotationType: string;
  [key: string]: any;
}

export interface ToolCallAnnotation extends TypedAnnotation {
  annotationType: AnnotationType.ToolCall;
  toolCallId: string;
  widgetName: string;
}

export interface SourcesAnnotation extends TypedAnnotation {
  annotationType: AnnotationType.Source;
  toolCallId: string;
  sources: Source[];
}

export interface Source {
  type: string;
  text: string;
  headings?: string[];
  url?: string;
  file_reference?: string;
  position?: number;
}

type AnnotationTypeMap = {
  [AnnotationType.ToolCall]: ToolCallAnnotation;
  [AnnotationType.Source]: SourcesAnnotation;
};

/**
 * Checks if a given value is a TypedAnnotation object.
 *
 * @param value Value to check.
 * @returns True if the value is a TypedAnnotation, false otherwise.
 */
export function isTypedAnnotation(value: JSONValue): value is TypedAnnotation {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'annotationType' in value &&
    typeof (value as any).annotationType === 'string'
  );
}

/**
 * Gets a list of annotations of the given type from an array of
 * arbitrary JSON values.
 *
 * @param annotations Array of JSON values to search for annotations
 * @param type Type of annotations to search for
 * @returns Array of annotations of the given type
 */
export function getAnnotationsByType<T extends AnnotationType>(
  annotations: JSONValue[] | undefined,
  type: T,
): AnnotationTypeMap[T][] {
  if (!annotations || !Array.isArray(annotations)) {
    return [];
  }

  return annotations.filter((item): item is AnnotationTypeMap[T] => {
    if (!isTypedAnnotation(item)) return false;
    return item.annotationType === type;
  });
}
