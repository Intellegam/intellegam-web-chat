/**
 * This file defines typed message annotations used in our system.
 *
 * Message annotations, a concept from the Vercel AI SDK, allow attaching
 * structured metadata to messages. This file specifically defines "typed"
 * annotations - those with predetermined structures - as opposed to
 * arbitrary untyped annotations.
 *
 * Only annotation types defined in this file are considered "typed" and
 * will have proper TypeScript types and validation.
 */

/**
 * Types of structured message annotations supported by the application.
 *
 * @enum {string}
 */
export enum MessageAnnotationType {
  ToolView = 'toolView',
  Sources = 'sources',
}

/**
 * Base interface for all typed message annotations.
 *
 * In our system, a "typed annotation" is a message annotation with a
 * predefined structure. This differs from arbitrary message annotations
 * which can contain any data. Only annotation types defined in this file
 * are considered typed.
 *
 * @interface
 * @property {AnnotationType} annotationType - Identifies the specific type of annotation
 * @property {string} toolCallId - The id of the tool call that created this annotation
 */
export interface TypedMessageAnnotation {
  annotationType: MessageAnnotationType;
}

/**
 * Message annotation containing source references.
 *
 * Contains search results or citations that provide evidence for
 * information presented in a message.
 *
 * @property {MessageAnnotationType.Sources} annotationType - Identifies this as a Sources annotation
 * @property {string} toolCallId - ID of the associated tool call
 * @property {Source[]} sources - List of information sources
 */
export interface SourcesMessageAnnotation extends TypedMessageAnnotation {
  annotationType: MessageAnnotationType.Sources;
  toolCallId: string;
  sources: Source[];
}

/**
 * Information source reference with content and metadata.
 *
 * @property {string} text - Main content text
 * @property {string[]} [headings] - Section headings or titles
 * @property {string} [url] - Source URL
 * @property {string} [fileReference] - File identifier
 * @property {number} [position] - Position index
 */
export interface Source {
  text: string;
  headings?: string[];
  url?: string;
  fileReference?: string;
  position?: number;
}

/**
 * The Identifiers for different types of tool views.
 * These are used to determine which component to render for a tool view.
 */
export enum ToolViewId {
  WebSearch = 'webSearch',
  DatabaseSearch = 'databaseSearch',
}

/**
 * Base interface for all tool view annotations.
 * This links a ToolCall to the Component that should be rendered.
 * It contains some data that is needed to render the component.
 * But it does not contain the result of the tool call.
 */
interface ToolViewMessageAnnotation extends TypedMessageAnnotation {
  annotationType: MessageAnnotationType.ToolView;
  toolCallId: string;
  toolViewId: ToolViewId;
  toolViewData: Record<string, unknown>;
}

export interface SearchToolViewMessageAnnotation
  extends ToolViewMessageAnnotation {
  toolViewId: ToolViewId.WebSearch | ToolViewId.DatabaseSearch;
  toolViewData: { query: string };
}

/**
 * Maps annotation types to their corresponding interfaces.
 *
 * Provides type safety when working with annotations by associating each
 * MessageAnnotationType with its properly typed interface.
 *
 * Note: Must be updated when adding new annotation types.
 */
export type MessageAnnotationTypeMap = {
  [MessageAnnotationType.ToolView]: ToolViewMessageAnnotation;
  [MessageAnnotationType.Sources]: SourcesMessageAnnotation;
};
