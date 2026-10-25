const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

export async function onRequestPost({ request, env }) {
  if (!env.N8N_WEBHOOK_URL) return json({ error: 'Enquiry delivery is not configured yet. Please email hello@web-connector.win.' }, 503);
  let data;
  try { data = await request.json(); } catch { return json({ error: 'Please check the form and try again.' }, 400); }
  if (typeof data.website === 'string' && data.website.trim()) return json({ ok: true });
  const name = String(data.name || '').trim().slice(0, 100);
  const business = String(data.business || '').trim().slice(0, 120);
  const email = String(data.email || '').trim().slice(0, 254);
  const phone = String(data.phone || '').trim().slice(0, 40);
  const service = String(data.service || '').trim().slice(0, 100);
  const timing = String(data.timing || '').trim().slice(0, 100);
  const message = String(data.message || '').trim().slice(0, 3000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 3 || data.consent !== 'yes') return json({ error: 'Please complete the required fields and consent checkbox.' }, 400);
  const payload = { type: 'service_enquiry', name, business, email, phone, service, timing, message, consent: true, submittedAt: new Date().toISOString(), source: new URL(request.url).origin };
  try {
    const response = await fetch(env.N8N_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) return json({ error: 'The enquiry could not be delivered. Please try again or email hello@web-connector.win.' }, 502);
  } catch {
    return json({ error: 'The enquiry could not be delivered. Please try again or email hello@web-connector.win.' }, 502);
  }
  return json({ ok: true, message: 'Thanks — your enquiry has been sent. We’ll be in touch.' }, 201);
}
