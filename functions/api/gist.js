const GIST_FILE = 'garden-notes.json';

export async function onRequest(context) {
  const token  = context.env.GITHUB_TOKEN;
  const gistId = context.env.GIST_ID;

  if (!token || !gistId) {
    return new Response(JSON.stringify({ configured: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { request } = context;
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    'User-Agent':  'Garden-App',
    Accept:        'application/vnd.github+json',
  };

  if (request.method === 'GET') {
    const r = await fetch(`https://api.github.com/gists/${gistId}`, { headers: ghHeaders });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'PATCH') {
    const body = await request.json();
    const r = await fetch(`https://api.github.com/gists/${gistId}`, {
      method:  'PATCH',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
