export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Log for Vercel function logs (visible in dashboard)
  console.log(`[WAITLIST] ${new Date().toISOString()} | ${email}`);

  // TODO: Add Resend/Supabase/Upstash storage when keys are available
  // For now, emails are captured in Vercel function logs

  return res.status(200).json({ success: true, message: "You're on the list!" });
}
