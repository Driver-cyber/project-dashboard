const GIST_FILE = 'garden-notes.json';

export async function onRequest(context) {
  const { request, env } = context;
  const token  = env.GITHUB_TOKEN;
  const gistId = env.GIST_ID;

  if (!token || !gistId) {
    return json({ error: 'not configured' }, 503);
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let text = '';
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      const body = await request.json();
      text = String(body.text ?? '').trim();
    } catch {}
  } else {
    text = (await request.text()).trim();
  }
  if (!text) return json({ error: 'empty text' }, 400);
  if (text.length > 4000) return json({ error: 'too long' }, 413);

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    'User-Agent':  'der-Hain-Inbox',
    Accept:        'application/vnd.github+json',
  };

  const getR = await fetch(`https://api.github.com/gists/${gistId}`, { headers: ghHeaders });
  if (!getR.ok) return json({ error: 'gist fetch failed', status: getR.status }, 502);
  const gist = await getR.json();
  const file = gist.files && gist.files[GIST_FILE];
  let notes = [];
  if (file && file.content) {
    try {
      const parsed = JSON.parse(file.content);
      if (Array.isArray(parsed)) notes = parsed;
    } catch {}
  }

  const newNote = {
    id: 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    project: 'Inbox',
    text,
    createdAt: new Date().toISOString(),
    status: 'active',
    source: 'inbox-api',
  };
  notes.unshift(newNote);

  const patchR = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: { ...ghHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: { [GIST_FILE]: { content: JSON.stringify(notes, null, 2) } },
    }),
  });
  if (!patchR.ok) {
    const errBody = await patchR.text();
    return json({ error: 'gist patch failed', status: patchR.status, body: errBody }, 502);
  }

  return json({ ok: true, id: newNote.id, count: notes.length });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
