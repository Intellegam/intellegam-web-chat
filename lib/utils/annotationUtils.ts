import type {
  AnnotationTypeMap,
  MessageAnnotationType,
  TypedMessageAnnotation,
} from '../types/annotations';

/**
 * Checks if a given value is a TypedMessageAnnotation object.
 *
 * @param value to check.
 * @returns True if the value is a TypedMessageAnnotation, false otherwise.
 */
export function isTypedMessageAnnotation(
  value: unknown,
): value is TypedMessageAnnotation {
  // i am unsure if unknown is the right type here because message Annotations are
  // of type JSONValue but using it here is restrictive and with these runtime checks
  // it should be safe enough to assume it is a typed Annotation --Meris
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
 * unknown Message Annotations.
 *
 * @param annotations Array of unknown Message Annotations to search for annotations
 * @param type Type of annotations to search for
 * @returns Array of annotations of the given type
 */
export function getMessageAnnotationsByType<T extends MessageAnnotationType>(
  annotations: unknown[] | undefined,
  type: T,
): AnnotationTypeMap[T][] {
  if (!annotations || !Array.isArray(annotations)) {
    return [];
  }

  return annotations
    .filter(
      (item) => isTypedMessageAnnotation(item) && item.annotationType === type,
    )
    .map((item) => item as AnnotationTypeMap[T]);
}

/**
 * This is an automatically generated type that contains all annotation types that have a toolCallId property.
 * It is used to ensure type safety when searching for annotations by type and tool call ID without manually
 * defining which annotations have a toolCallId property.
 */
type AnnotationTypesWithToolCallId = {
  [K in MessageAnnotationType]: AnnotationTypeMap[K] extends {
    toolCallId: string;
  }
    ? K
    : never;
}[MessageAnnotationType];

export function getMessageAnnotationsByTypeAndToolId<
  T extends AnnotationTypesWithToolCallId,
>(
  annotations: unknown[] | undefined,
  type: T,
  toolCallId: string,
): Extract<AnnotationTypeMap[T], { toolCallId: string }>[] {
  if (!annotations || !Array.isArray(annotations)) {
    return [];
  }

  return annotations.filter(
    (item): item is Extract<AnnotationTypeMap[T], { toolCallId: string }> => {
      return (
        isTypedMessageAnnotation(item) &&
        'toolCallId' in item &&
        item.annotationType === type &&
        item.toolCallId === toolCallId
      );
    },
  );
}
