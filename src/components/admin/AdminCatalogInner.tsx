import { useEffect, useState } from 'react';
import { fetchLastRunPrices, runFreshScrape, type ScrapedPrice } from '../../lib/apifyPrices';
import { baseboardCasingCatalog, SCRAPE_ACTOR_INPUT } from '../../data/baseboardCasingCatalog';
import { btnPrimary, btnGhost } from '../theme';
import { saveScrapedPrices } from '../../lib/productPricesStore';

interface Row {
  url: string;
  name: string;
  category: 'baseboard' | 'casing';
  sizeLabel: string;
  price: number | null;
  outOfStock: boolean;
}

const SIZE_ORDER = ['Baseboard 3”', 'Baseboard 4”', 'Baseboard 5”', 'Baseboard 6”', 'Casing 2”', 'Casing 3”'];

function mergeCatalogWithPrices(prices: ScrapedPrice[]): Row[] {
  const byUrl = new Map(prices.map(p => [p.url, p]));
  return baseboardCasingCatalog.map(c => {
    const match = byUrl.get(c.url);
    return {
      url: c.url,
      name: c.name,
      category: c.category,
      sizeLabel: c.sizeLabel,
      price: match?.price ?? null,
      outOfStock: match?.outOfStock ?? false,
    };
  });
}

export default function AdminCatalogInner() {
  const [rows, setRows] = useState<Row[]>(
    baseboardCasingCatalog.map(c => ({ ...c, price: null, outOfStock: false }))
  );
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [debugRaw, setDebugRaw] = useState<ScrapedPrice[] | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const saveToCatalog = async (prices: ScrapedPrice[]) => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { saved, failed } = await saveScrapedPrices(prices);
      setSaveMsg(
        failed.length === 0
          ? `Saved ${saved} price(s) to catalog.`
          : `Saved ${saved}, but ${failed.length} failed (check RLS/update permissions).`
      );
    } catch (e: any) {
      setSaveMsg(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const prices = await fetchLastRunPrices();
      setRows(mergeCatalogWithPrices(prices));
      setDebugRaw(prices);
      setLastFetched(new Date());
      await saveToCatalog(prices);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runNew = async () => {
    if (!window.confirm('This runs a fresh scrape of all 24 product pages and costs Apify credits. It can take a few minutes — keep this tab open. Continue?')) return;
    setScraping(true);
    setError(null);
    try {
      const prices = await runFreshScrape(SCRAPE_ACTOR_INPUT);
      setRows(mergeCatalogWithPrices(prices));
      setDebugRaw(prices);
      setLastFetched(new Date());
      await saveToCatalog(prices);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setScraping(false);
    }
  };

  const missing = rows.filter(r => r.price === null && !r.outOfStock).length;

  return (
    <div className="p-8 w-full space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Baseboard / Casing Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live Home Depot prices from your Apify scraper.
            {lastFetched && <> Last loaded {lastFetched.toLocaleString()}.</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={load} disabled={loading || scraping || saving}>
            {loading ? 'Loading…' : 'Reload last run'}
          </button>
          <button className={btnPrimary} onClick={runNew} disabled={loading || scraping || saving}>
            {scraping ? 'Scraping…' : 'Run new scrape'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3">
          {saving ? 'Saving to catalog…' : saveMsg}
        </div>
      )}

      {!error && missing > 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
          {missing} item(s) came back with no price. Expand "Raw response" below to check the actual field names
          the actor is returning — the parser in <code>lib/apifyPrices.ts</code> may need adjusting.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {SIZE_ORDER.map(size => {
          const sizeRows = rows.filter(r => r.sizeLabel === size);
          if (sizeRows.length === 0) return null;
          return (
            <div key={size} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-fit">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-800">{size}</h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {sizeRows.map(r => (
                    <tr key={r.url} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-2.5">
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-[#2F9BF0]">
                          {r.name}
                        </a>
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono font-medium whitespace-nowrap">
                        {r.outOfStock ? (
                          <span className="text-red-500 font-sans font-medium">Out of stock</span>
                        ) : r.price != null ? (
                          `$${r.price.toFixed(2)}`
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <details className="text-xs text-slate-400">
        <summary className="cursor-pointer select-none">Raw response (debug)</summary>
        <pre className="mt-2 bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
          {JSON.stringify(debugRaw, null, 2)}
        </pre>
      </details>
    </div>
  );
}