import { readFile } from 'node:fs/promises';
import { NextRequest } from 'next/server';
import { getContentType, resolveRepoPath } from '../../../lib/docs';

export async function GET(request: NextRequest) {
  const requestedPath = request.nextUrl.searchParams.get('path');
  const resolved = resolveRepoPath(requestedPath);

  if (!resolved) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const content = await readFile(resolved.absolutePath);
    return new Response(content, {
      headers: {
        'Content-Type': getContentType(resolved.relativePath),
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
