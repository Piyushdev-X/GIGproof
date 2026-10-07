import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { connections as demoConnections, monthlyIncome as demoMonthlyIncome, payouts as demoPayouts } from '../data/demoIncome.js';
import { calculateIncomeProfile } from '../lib/scoringEngine.js';
import { supabase } from '../lib/supabase.js';

const IncomeContext = createContext(null);

const STORAGE_KEY_PAYOUTS = 'gigproof_user_payouts';
const STORAGE_KEY_MOCK = 'gigproof_mock_data_enabled';

// Convert demo payouts into standard format with dates
const normalizedDemoPayouts = demoPayouts.map((p, idx) => ({
  id: `demo-payout-${idx}`,
  platform: p.platform,
  payout_date: p.date.includes('2026') ? '2026-09-28' : '2026-09-24',
  amount: p.amount,
  is_verified: true,
  source_type: 'argyle',
  mark: p.mark,
  tone: p.tone,
  isSample: true,
}));

export function IncomeProvider({ children, session }) {
  // Load mock data preference
  const [mockDataEnabled, setMockDataEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MOCK);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Load user manual payouts from localStorage as fast initial state
  const [userPayouts, setUserPayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYOUTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadingDb, setLoadingDb] = useState(false);

  // Sync with Supabase on mount / session change
  useEffect(() => {
    if (!supabase || !session?.user) return;
    let active = true;

    async function fetchFromSupabase() {
      try {
        setLoadingDb(true);
        const { data: connections, error: connErr } = await supabase
          .from('gig_connections')
          .select('id, platform, status')
          .eq('user_id', session.user.id);
        if (connErr) throw connErr;

        if (connections && connections.length > 0) {
          const connIds = connections.map((c) => c.id);
          const platformMap = new Map(connections.map((c) => [c.id, c.platform]));

          const { data: payoutsData, error: payErr } = await supabase
            .from('income_payouts')
            .select('id, payout_date, amount, is_verified, source_type, connection_id, created_at')
            .in('connection_id', connIds)
            .order('payout_date', { ascending: false });
          if (payErr) throw payErr;

          if (active && payoutsData) {
            const mapped = payoutsData.map((row) => ({
              id: row.id,
              payout_date: row.payout_date,
              amount: Number(row.amount),
              platform: platformMap.get(row.connection_id) || 'Unknown',
              is_verified: Boolean(row.is_verified),
              source_type: row.source_type || 'manual',
              isSample: false,
            }));

            setUserPayouts((prev) => {
              // Merge deduplicated by id or key
              const existingIds = new Set(mapped.map((m) => m.id));
              const localUnsynced = prev.filter((p) => !existingIds.has(p.id));
              const merged = [...mapped, ...localUnsynced];
              try {
                localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Could not sync payouts from database:', err.message);
      } finally {
        if (active) setLoadingDb(false);
      }
    }

    fetchFromSupabase();
    return () => { active = false; };
  }, [session]);

  const toggleMockData = () => {
    setMockDataEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_MOCK, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addPayout = (newPayout) => {
    setUserPayouts((prev) => {
      const entry = {
        id: newPayout.id || `local-${Date.now()}`,
        payout_date: newPayout.payoutDate || newPayout.payout_date || new Date().toISOString().slice(0, 10),
        amount: Number(newPayout.amount),
        platform: newPayout.platform,
        is_verified: Boolean(newPayout.is_verified),
        source_type: newPayout.source_type || 'manual',
        isSample: false,
      };
      const updated = [entry, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Active Payouts list
  const activePayouts = useMemo(() => {
    if (mockDataEnabled) {
      return [...userPayouts, ...normalizedDemoPayouts];
    }
    return userPayouts;
  }, [mockDataEnabled, userPayouts]);

  // Real-time calculated profile
  const incomeProfile = useMemo(() => {
    if (mockDataEnabled && userPayouts.length === 0) {
      // Return default curated demo metrics
      return {
        adjustedMonthlyIncome: 35000,
        reliabilityScore: 100,
        scoreDisplay: '100',
        scoreDisclaimer: '',
        isPurelyManual: false,
        annualGross: demoMonthlyIncome.reduce((sum, m) => sum + m.total, 0),
        verificationStatus: 'API Verified',
        activeMonths: 12,
        isSample: true,
        months: demoMonthlyIncome,
        sources: [
          { platform: 'Zomato', total: 180000 },
          { platform: 'Upwork', total: 150000 },
          { platform: 'Ola', total: 80000 },
        ],
      };
    }

    const calculated = calculateIncomeProfile(activePayouts);
    return {
      ...calculated,
      isSample: mockDataEnabled && userPayouts.length === 0,
    };
  }, [mockDataEnabled, userPayouts, activePayouts]);

  // Display Connections list
  const displayConnections = useMemo(() => {
    const userPlatforms = [...new Set(userPayouts.map((p) => p.platform))];
    const userConnList = userPlatforms.map((name) => ({
      name,
      detail: 'Manual entry active',
      mark: name.charAt(0).toUpperCase(),
      tone: 'green',
      isManual: true,
    }));

    if (mockDataEnabled) {
      const existingNames = new Set(userPlatforms);
      const remainingDemo = demoConnections.filter((c) => !existingNames.has(c.name));
      return [...userConnList, ...remainingDemo];
    }
    return userConnList;
  }, [mockDataEnabled, userPayouts]);

  // Formatted recent payouts list for dashboard
  const displayPayouts = useMemo(() => {
    return activePayouts.slice(0, 10).map((p) => {
      let mark = p.platform ? p.platform.charAt(0).toUpperCase() : 'G';
      let tone = 'green';
      const name = p.platform.toLowerCase();
      if (name.includes('zomato')) { tone = 'orange'; mark = 'Z'; }
      else if (name.includes('swiggy')) { tone = 'orange'; mark = 'S'; }
      else if (name.includes('uber')) { tone = 'charcoal'; mark = 'U'; }
      else if (name.includes('ola')) { tone = 'charcoal'; mark = 'O'; }
      else if (name.includes('upwork')) { tone = 'green'; mark = 'u'; }

      const dateStr = p.payout_date || p.payoutDate || p.date;
      const formattedDate = dateStr
        ? new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
        : 'Recent';

      return {
        id: p.id,
        platform: p.platform,
        date: formattedDate,
        rawDate: dateStr,
        amount: p.amount,
        isVerified: p.is_verified,
        sourceType: p.source_type,
        mark,
        tone,
        isSample: Boolean(p.isSample),
      };
    });
  }, [activePayouts]);

  const isEmpty = !mockDataEnabled && userPayouts.length === 0;

  const value = {
    mockDataEnabled,
    toggleMockData,
    setMockDataEnabled,
    userPayouts,
    addPayout,
    incomeProfile,
    activePayouts,
    displayPayouts,
    displayConnections,
    isEmpty,
    loadingDb,
  };

  return <IncomeContext.Provider value={value}>{children}</IncomeContext.Provider>;
}

export function useIncome() {
  const ctx = useContext(IncomeContext);
  if (!ctx) throw new Error('useIncome must be used within an IncomeProvider');
  return ctx;
}
