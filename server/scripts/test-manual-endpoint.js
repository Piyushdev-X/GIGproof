import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const email = process.env.TEST_USER_EMAIL || 'test@example.com';
const password = process.env.TEST_USER_PASSWORD || 'testpassword';
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in server/.env.');
}

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) throw new Error(`Test-user sign-in failed: ${authError.message}`);
const accessToken = authData.session?.access_token;
if (!accessToken) throw new Error('Test-user sign-in returned no access token.');

const requestBody = {
  amount: 32500,
  payoutDate: '2026-10-06',
  platform: 'Upwork',
};

const response = await fetch(`${apiBaseUrl}/api/income/manual`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});
const responsePayload = await response.json().catch(() => null);

console.log('POST /api/income/manual status:', response.status);
console.log('POST response payload:', JSON.stringify(responsePayload, null, 2));

if (response.status !== 201 && response.status !== 200) {
  throw new Error(`Manual income request failed with HTTP ${response.status}.`);
}
if (responsePayload?.data?.is_verified !== false || responsePayload?.data?.source_type !== 'manual') {
  throw new Error('Manual income response did not mark the payout as unverified manual income.');
}
if (responsePayload?.verificationStatus !== 'Self-Reported') {
  throw new Error('Manual income response did not report Self-Reported verification status.');
}

const scoreResponse = await fetch(`${apiBaseUrl}/api/income/score`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const scorePayload = await scoreResponse.json().catch(() => null);

console.log('GET /api/income/score status:', scoreResponse.status);
console.log('Score response payload:', JSON.stringify(scorePayload, null, 2));

if (!scoreResponse.ok) throw new Error(`Income score request failed with HTTP ${scoreResponse.status}.`);

const profile = scorePayload?.data;
if (profile?.verificationStatus !== 'Self-Reported' || profile?.hasUnverifiedIncome !== true) {
  throw new Error('Income score did not flag the profile as Self-Reported with unverified income.');
}

const expectedReliabilityScore = Math.round((profile.baseReliabilityScore * 0.8 + Number.EPSILON) * 10) / 10;
if (profile.verificationPenaltyMultiplier !== 0.8 || profile.reliabilityScore !== expectedReliabilityScore) {
  throw new Error(`Expected a 0.80 verification multiplier and score ${expectedReliabilityScore}; received multiplier ${profile.verificationPenaltyMultiplier} and score ${profile.reliabilityScore}.`);
}

console.log(`Verification penalty confirmed: base ${profile.baseReliabilityScore.toFixed(1)} → reliability ${profile.reliabilityScore.toFixed(1)} (×0.80).`);
