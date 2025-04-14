import type { JSONValue } from 'ai';
import type { Source } from './search';

export enum AnnotationType {
  ToolCallMetadata = 'toolCallMetadata',
  Source = 'source',
}

export enum WidgetName {
  WebSearch = 'webSearch',
  DatabaseSearch = 'databaseSearch',
}

interface TypedAnnotation {
  annotationTypeId: string;
  [key: string]: any;
}

export interface ToolCallMetaAnnotation extends TypedAnnotation {
  annotationTypeId: AnnotationType.ToolCallMetadata;
  toolCallId: string;
  widgetName: WidgetName;
}

export interface SourcesAnnotation extends TypedAnnotation {
  annotationTypeId: AnnotationType.Source;
  toolCallId: string;
  sources: Source[];
}

type AnnotationTypeMap = {
  [AnnotationType.ToolCallMetadata]: ToolCallMetaAnnotation;
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
    'annotationTypeId' in value &&
    typeof (value as any).annotationTypeId === 'string'
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
    return item.annotationTypeId === type;
  });
}
