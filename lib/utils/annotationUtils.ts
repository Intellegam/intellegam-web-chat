import {
  AnnotationType,
  type AnnotationTypeMap,
  type SearchWidgetData,
  type TypedAnnotation,
  WidgetId,
} from '../types/annotations';

/**
 * Checks if a given value is a TypedAnnotation object.
 *
 * @param value to check.
 * @returns True if the value is a TypedAnnotation, false otherwise.
 */
export function isTypedAnnotation(value: unknown): value is TypedAnnotation {
  // i am unsure if unknown is the right type here because message Annotations are
  // of type JSONValue but using it here is restrictive and with these runtime checks
  // it should be safe enough to assume it is a typed Annotation --Meris
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'annotationType' in value &&
    typeof (value as any).annotationType === 'string' &&
    'toolCallId' in value &&
    typeof (value as any).toolCallId === 'string'
  );
}

/**
 * Gets a list of annotations of the given type from an array of
 * unknown values.
 *
 * @param annotations Array of unknown values to search for annotations
 * @param type Type of annotations to search for
 * @returns Array of annotations of the given type
 */
export function getAnnotationsByType<T extends AnnotationType>(
  annotations: unknown[] | undefined,
  type: T,
): AnnotationTypeMap[T][] {
  if (!annotations || !Array.isArray(annotations)) {
    return [];
  }

  return annotations
    .filter((item) => isTypedAnnotation(item) && item.annotationType === type)
    .map((item) => item as AnnotationTypeMap[T]);
}

/**
 * Gets a list of annotations of the given type and tool call ID from an
 * array of unknown values.
 *
 * @param annotations Array of unknown values to search for annotations
 * @param type Type of annotations to search for
 * @param toolCallId ID of the tool call to search for annotations
 * @returns Array of annotations of the given type and tool call ID
 */
export function getAnnotationsByTypeAndToolId<T extends AnnotationType>(
  annotations: unknown[] | undefined,
  type: T,
  toolCallId: string,
): AnnotationTypeMap[T][] {
  if (!annotations || !Array.isArray(annotations)) {
    return [];
  }

  return annotations.filter((item): item is AnnotationTypeMap[T] => {
    return (
      isTypedAnnotation(item) &&
      item.annotationType === type &&
      item.toolCallId === toolCallId
    );
  });
}

/**
 * Gets the search widget data associated with a tool call ID from an array of
 * unknown values.
 *
 * @param annotations Array of unknown values to search for annotations
 * @param toolCallId ID of the tool call to search for annotations
 * @returns The search widget data associated with the given tool call ID, or
 * undefined if no such annotation was found.
 */
export function getSearchWidgetDataByToolCallId(
  annotations: unknown[] | undefined,
  toolCallId: string,
): SearchWidgetData | undefined {
  const widgetDataAnnotations = getAnnotationsByTypeAndToolId(
    annotations,
    AnnotationType.WidgetData,
    toolCallId,
  );
  return widgetDataAnnotations.find(
    (a) =>
      a.widgetId === WidgetId.WebSearch ||
      a.widgetId === WidgetId.DatabaseSearch,
  ) as SearchWidgetData | undefined;
}
