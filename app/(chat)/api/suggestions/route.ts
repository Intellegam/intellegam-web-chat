import { getSuggestionsByDocumentId } from '@/lib/db/queries';
import { getDbUserId } from '@/lib/auth/helpers';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await withAuth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const dbUserId = await getDbUserId(session.user);
  if (!dbUserId) {
    return new Response('User not found', { status: 404 });
  }

  const suggestions = await getSuggestionsByDocumentId({
    documentId,
  });

  const [suggestion] = suggestions;

  if (!suggestion) {
    return Response.json([], { status: 200 });
  }

  if (suggestion.userId !== dbUserId) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(suggestions, { status: 200 });
}
