/**
 * An enumeration of typed annotations that are being sent from the
 * server.
 *
 * @enum {string}
 */
export enum AnnotationType {
  WidgetData = 'widgetData',
  Sources = 'sources',
}

/**
 * A TypedAnnotation is an annotation with a specific type that
 * defines the structure of its associated data.
 *
 * TypedAnnotations are used to identify the type of annotation and
 * determine the structure of the data associated with it.
 *
 * This interface is only used to extend other interfaces with the
 * annotation type and data.
 *
 * @interface
 * @property {AnnotationType} annotationType - The type of annotation.
 * @property {any} [key: string] - The data associated with the annotation.
 */
export interface TypedAnnotation {
  annotationType: AnnotationType;
  toolCallId: string;
}

/**
 * A TypedAnnotation that represents the sources for a widget.
 *
 * This annotation is used to display the sources of a toolCall. The sources are the
 * results of a search query.
 *
 * @interface
 * @property {AnnotationType} annotationType - The type of annotation.
 * @property {string} toolCallId - The id of the tool call that created the
 * widget.
 * @property {Source[]} sources - The sources for the widget.
 */
export interface SourcesAnnotation extends TypedAnnotation {
  annotationType: AnnotationType.Sources;
  sources: Source[];
}

/**
 * Represents a source of information, which can be a document, webpage, or
 * other media. It includes the text content and optional metadata such as
 * headings, URL, file reference, and position.
 *
 * @interface
 * @property {string} text - The main content text of the source.
 * @property {string[]} [headings] - An optional list of headings associated with the source.
 * @property {string} [url] - An optional URL linking to the source.
 * @property {string} [fileReference] - An optional file reference for the source.
 * @property {number} [position] - An optional position index or marker for the source.
 */
export interface Source {
  text: string;
  headings?: string[];
  url?: string;
  fileReference?: string;
  position?: number;
}

/**
 * An enumeration of the types of widgets that can be used in the chat.
 * Which correspond to a specific tool call.
 *
 * @enum {string}
 */
export enum WidgetId {
  WebSearch = 'webSearch',
  DatabaseSearch = 'databaseSearch',
}

/**
 * A TypedAnnotation that represents the data for a widget.
 *
 * This annotation is used to display a widget that is associated
 * with a tool call.
 *
 * This interface is only used to extend other interfaces with the
 * which have their own
 *
 * @interface
 * @property {AnnotationType} annotationType - The type of annotation.
 * @property {WidgetId} widgetId - The id of the widget.
 * @property {string} toolCallId - The id of the tool call that created the
 * widget.
 * @property {Record<string, unknown>} widgetData - The data for the widget. The structure of this
 * data is determined by the type of widget.
 */
interface WidgetDataAnnotation extends TypedAnnotation {
  annotationType: AnnotationType.WidgetData;
  widgetId: WidgetId;

  widgetData: Record<string, unknown>;
}

export interface SearchWidgetData extends WidgetDataAnnotation {
  widgetData: { query: string };
}

/**
 * A map of annotation types to their associated TypedAnnotation interfaces.
 *
 * The keys of this map are the values of the AnnotationType enum, and the values are
 * the interfaces that extend TypedAnnotation.
 *
 * This map is used to provide types for annotations that are retrieved from the server.
 *
 * For example, if the server sends an annotation with type 'widgetData', this map
 * can be used to determine the type of the annotation, and the shape of its data.
 *
 * Always update when adding Annotation types!!
 */
export type AnnotationTypeMap = {
  [AnnotationType.WidgetData]: WidgetDataAnnotation;
  [AnnotationType.Sources]: SourcesAnnotation;
};
