import { Router } from 'express';
import { z } from 'zod';
import { getAuthenticatedSupabaseContext } from '../lib/supabaseAuth.js';
import { calculateIncomeProfile } from '../services/scoringEngine.js';

const router = Router();
const manualIncomeSchema = z.object({
  payoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD.'),
  amount: z.number().finite().positive().max(10_000_000),
  platform: z.string().trim().min(2).max(80).regex(/^[\p{L}\p{N} .&'()+/_-]+$/u, 'Platform contains unsupported characters.'),
}).strict();

async function requireUser(req, res) {
  const { data: context, error } = await getAuthenticatedSupabaseContext(req);
  if (error) {
    res.status(error.status || 401).json({
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Sign in with a valid account to continue.' },
    });
    return null;
  }
  return context;
}

router.post('/manual', async (req, res) => {
  const parsed = manualIncomeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Check the date, amount, and platform, then try again.',
        details: parsed.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
      },
    });
  }

  const payoutDate = new Date(`${parsed.data.payoutDate}T00:00:00.000Z`);
  if (Number.isNaN(payoutDate.getTime()) || payoutDate.toISOString().slice(0, 10) !== parsed.data.payoutDate) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Enter a valid payout date.' } });
  }
  if (payoutDate > new Date()) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Payout date cannot be in the future.' } });
  }

  try {
    const context = await requireUser(req, res);
    if (!context) return;

    const userId = context.jwtClaims.sub;
    const userEmail = context.jwtClaims.email || `${userId}@anonymous.gigproof`;
    const platform = parsed.data.platform;
    const supabase = context.supabaseAdmin;

    // Ensure the user row exists in public.users to satisfy foreign key constraints
    await supabase.from('users').upsert(
      { id: userId, email: userEmail },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    const { data: existingConnection, error: lookupError } = await supabase
      .from('gig_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('status', 'manual')
      .limit(1)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let connectionId = existingConnection?.id;
    if (!connectionId) {
      const { data: newConnection, error: connectionError } = await supabase
        .from('gig_connections')
        .insert({ user_id: userId, platform, status: 'manual' })
        .select('id')
        .single();
      if (connectionError) throw connectionError;
      connectionId = newConnection.id;
    }

    const { data: payout, error: payoutError } = await supabase
      .from('income_payouts')
      .insert({
        connection_id: connectionId,
        payout_date: parsed.data.payoutDate,
        amount: parsed.data.amount,
        is_verified: false,
        source_type: 'manual',
      })
      .select('id, payout_date, amount, is_verified, source_type')
      .single();
    if (payoutError) throw payoutError;

    return res.status(201).json({
      data: { ...payout, platform },
      verificationStatus: 'Self-Reported',
    });
  } catch (error) {
    console.error('Manual income insertion failed:', error?.message || error?.name || error);
    return res.status(500).json({
      error: { code: 'INCOME_SAVE_FAILED', message: error?.message || 'We could not save this income entry. Try again.' },
    });
  }
});

router.get('/score', async (req, res) => {
  try {
    const context = await requireUser(req, res);
    if (!context) return;
    const supabase = context.supabaseAdmin;
    const userId = context.jwtClaims.sub;

    const { data: connections, error: connectionsError } = await supabase
      .from('gig_connections')
      .select('id, platform')
      .eq('user_id', userId);
    if (connectionsError) throw connectionsError;

    const asOf = new Date();
    const cutoff = new Date(asOf.getTime() - 364 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const connectionIds = (connections || []).map((connection) => connection.id);
    let payouts = [];
    if (connectionIds.length) {
      const { data, error: payoutsError } = await supabase
        .from('income_payouts')
        .select('payout_date, amount, is_verified, source_type, connection_id')
        .in('connection_id', connectionIds)
        .gte('payout_date', cutoff)
        .lte('payout_date', asOf.toISOString().slice(0, 10))
        .order('payout_date', { ascending: true });
      if (payoutsError) throw payoutsError;
      const platforms = new Map(connections.map((connection) => [connection.id, connection.platform]));
      payouts = (data || []).map((payout) => ({ ...payout, platform: platforms.get(payout.connection_id) || 'Unknown' }));
    }

    return res.json({ data: calculateIncomeProfile(payouts, asOf) });
  } catch (error) {
    console.error('Income profile calculation failed:', error?.name || 'unknown error');
    return res.status(500).json({
      error: { code: 'INCOME_PROFILE_FAILED', message: 'We could not calculate this income profile.' },
    });
  }
});

export default router;
