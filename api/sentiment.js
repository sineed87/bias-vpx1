export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'API ključ ni nastavljen.' });
  const { instrument } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'Trading analyst. Find latest retail trader positioning data. Respond only in the exact format requested.',
        messages: [{
          role: 'user',
          content: `Find the latest retail trader positioning data for ${instrument}. Search for: "${instrument} long short ratio", "${instrument} retail positioning", "${instrument} COT data".

Respond ONLY in this exact format, nothing else:
LONG: [number 0-100]
SHORT: [number 0-100]
SOURCE: [where data is from, max 5 words]`
        }]
      })
    });
    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n') || '';
    res.json({ sentiment: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
