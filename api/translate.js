export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, fromLang, toLang } = req.body;

  if (!text || !fromLang || !toLang) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Translate from ${fromLang} to ${toLang}. Return ONLY the translation, nothing else.`,
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();
    const translated = data.content?.[0]?.text?.trim() || '⚠️ Translation failed';
    return res.status(200).json({ translated });
  } catch (err) {
    return res.status(500).json({ error: 'Translation error', detail: err.message });
  }
}
