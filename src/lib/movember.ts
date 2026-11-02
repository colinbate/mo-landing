import { campaign } from '../config/campaign';
import { createMemoryCache, type CacheStore } from './cache';

/**
 * The only shape the rest of the site knows about. Nothing from the upstream
 * response leaks past this module.
 */
export interface Fundraising {
  raised: number;
  goal: number;
  /** Whole-number percentage of goal, capped at 100 for display. */
  percent: number;
  /** Uncapped percentage, useful when the goal has been passed. */
  rawPercent: number;
  currency: string;
  donateUrl: string;
  profileUrl: string;
  headline: string | null;
  motivation: string | null;
  profileImage: string | null;
  yearsParticipated: number | null;
  fetchedAt: string;
}

export interface FundraisingResult {
  data: Fundraising | null;
  /** True when the data came from a cache entry older than the TTL. */
  stale: boolean;
}

/** Only the upstream fields we read. Everything else is ignored. */
interface UpstreamMember {
  targetAmount?: string | number | null;
  headline?: string | null;
  motivation?: string | null;
  donateURL?: string | null;
  mospaceURL?: string | null;
  participationNumYears?: number | null;
  currencyCode?: string | null;
  AmountRaised?: {
    originalAmount?: string | number | null;
    originalCurrencyCode?: string | null;
  } | null;
  ProfilePicture?: {
    defaultURL?: string | null;
  } | null;
}

const API_VERSION = 'v22';
const API_URL = `https://api.movember.com/${API_VERSION}/member/${campaign.memberId}`;
const CACHE_KEY = `movember:${API_VERSION}:${campaign.memberId}`;
const TTL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = `mo-landing/${campaign.year} (+${campaign.eventsUrl})`;

let cache: CacheStore<Fundraising> = createMemoryCache();

/** Swap in a different store (for example Cloudflare KV) at startup. */
export function setFundraisingCache(store: CacheStore<Fundraising>) {
  cache = store;
}

function toNumber(value: string | number | null | undefined, fallback: number): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function cleanText(value: string | null | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

function normalize(raw: UpstreamMember): Fundraising {
  const raised = toNumber(raw.AmountRaised?.originalAmount, 0);
  const goal = Math.max(toNumber(raw.targetAmount, campaign.fallbackGoal), 1);
  const rawPercent = (raised / goal) * 100;

  return {
    raised,
    goal,
    percent: Math.min(100, Math.round(rawPercent)),
    rawPercent: Math.round(rawPercent),
    currency: cleanText(raw.AmountRaised?.originalCurrencyCode) ?? cleanText(raw.currencyCode) ?? campaign.currency,
    donateUrl: cleanText(raw.donateURL) ?? campaign.donateUrl,
    profileUrl: cleanText(raw.mospaceURL) ?? campaign.profileUrl,
    headline: cleanText(raw.headline),
    motivation: cleanText(raw.motivation),
    profileImage: cleanText(raw.ProfilePicture?.defaultURL),
    yearsParticipated: typeof raw.participationNumYears === 'number' ? raw.participationNumYears : null,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchUpstream(): Promise<Fundraising> {
  const response = await fetch(API_URL, {
    // The API rejects requests without a User-Agent, and Workers send none by default.
    headers: { accept: 'application/json', 'user-agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Movember API responded ${response.status}`);
  }
  const json = (await response.json()) as UpstreamMember;
  return normalize(json);
}

/**
 * Returns the current fundraising snapshot. Serves from cache for 15 minutes,
 * falls back to a stale cached value if the API fails, and returns `null`
 * data only when nothing has ever been fetched successfully.
 */
export async function getFundraising(): Promise<FundraisingResult> {
  const cached = await cache.get(CACHE_KEY);
  const now = Date.now();

  if (cached && now - cached.storedAt < TTL_MS) {
    return { data: cached.value, stale: false };
  }

  try {
    const fresh = await fetchUpstream();
    await cache.set(CACHE_KEY, { value: fresh, storedAt: now });
    return { data: fresh, stale: false };
  } catch (error) {
    console.error('[movember] fetch failed:', error instanceof Error ? error.message : error);
    if (cached) {
      return { data: cached.value, stale: true };
    }
    return { data: null, stale: false };
  }
}

export function formatMoney(amount: number, currency = campaign.currency): string {
  return new Intl.NumberFormat(campaign.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
