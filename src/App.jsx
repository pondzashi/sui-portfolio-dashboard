import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUYkXpjU-M3nI6K_CEZuRF-gL_hIwe2niwICCcd-5cja6jzEjd_7MDZefQUoScmfW5WQf_4nHsvB6d/pub?output=csv';

const formatCurrency = (value) => {
  const amount = Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(amount)
    : '$0.00';
};

const parseNumber = (value) => {
  const amount = Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

function App() {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }

        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header?.trim(),
          complete: (results) => {
            const fieldNames = results.meta.fields?.map((field) => field.trim()) || [];
            const parsedRows = results.data.map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([key, value]) => [
                  key.trim(),
                  typeof value === 'string' ? value.trim() : value,
                ])
              )
            );
            setHeaders(fieldNames);
            setRows(
              parsedRows.filter((row) =>
                Object.values(row).some((value) => value !== '' && value != null)
              )
            );
            setLoading(false);
          },
          error: (err) => {
            setError(err.message || 'CSV parse error');
            setLoading(false);
          },
        });
      } catch (err) {
        setError(err.message || 'Unable to load CSV');
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const latestRow = useMemo(() => {
    if (!rows.length) return null;
    const dateKey = headers.find((field) => /date/i.test(field)) || 'Date';
    return [...rows].sort((a, b) => {
      const aDate = new Date(a[dateKey]);
      const bDate = new Date(b[dateKey]);
      return bDate - aDate;
    })[0];
  }, [rows, headers]);

  const latestDate = latestRow?.Date || latestRow?.date || 'Latest';
  const netWorth = parseNumber(latestRow?.['Net Worth ($)']);
  const totalSupplied = parseNumber(latestRow?.['Total Supplied ($)']);
  const totalBorrowed = parseNumber(latestRow?.['Total Borrowed ($)']);
  const unclaimedRewards = parseNumber(latestRow?.['Unclaimed Rewards ($)']);
  const walletSui = parseNumber(latestRow?.['Wallet SUI']);
  const walletCetus = parseNumber(latestRow?.['Wallet CETUS']);
  const cetusNetValue = parseNumber(latestRow?.['Cetus Net Value ($)']);
  const naviNetValue = parseNumber(latestRow?.['NAVI Net Value ($)']);
  const suilendNetValue = parseNumber(latestRow?.['Suilend Net Value ($)']);
  const netExposure = totalSupplied;
  const totalDebt = totalBorrowed;
  const healthFactor = latestRow?.['NAVI Main Health Factor'] || latestRow?.['NAVI E-mode Health Factor'] || '-';
  const cetusApr = latestRow?.['Cetus APR (%)'] || '-';
  const naviApr = latestRow?.['NAVI APR (%)'] || '-';
  const suilendApr = latestRow?.['Suilend APR (%)'] || '-';

  const totalAssetValue = Math.max(1, walletSui + walletCetus + cetusNetValue + naviNetValue + suilendNetValue);
  const allocation = [
    { label: 'Wallet SUI', value: walletSui, color: 'asset-cyan' },
    { label: 'Wallet CETUS', value: walletCetus, color: 'asset-violet' },
    { label: 'Cetus Net', value: cetusNetValue, color: 'asset-emerald' },
    { label: 'NAVI Net', value: naviNetValue, color: 'asset-pink' },
    { label: 'Suilend Net', value: suilendNetValue, color: 'asset-amber' },
  ];

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Exclusive Portfolio</p>
          <h1>Premium SUI dashboard</h1>
          <p className="subtitle">
            Live analytics from your Google Sheet. The latest snapshot is shown below.
          </p>
        </div>
        <div className="top-chip">Updated: {latestDate}</div>
      </header>

      <section className="hero-card">
        <div className="hero-left">
          <div className="hero-title-row">
            <div>
              <span className="hero-label">Total Net Worth</span>
              <h2>{formatCurrency(netWorth)}</h2>
            </div>
            <div className="status-pill positive">
              <span className="status-dot" /> Tracking positive
            </div>
          </div>

          <p className="hero-copy">A clean investment snapshot built from your published Google Sheet data.</p>

          <div className="hero-stats-row">
            <StatCard label="Gross Exposure" value={formatCurrency(netExposure)} accent="blue" />
            <StatCard label="Active Debt" value={formatCurrency(totalDebt)} accent="red" />
            <StatCard label="Rewards" value={formatCurrency(unclaimedRewards)} accent="emerald" />
          </div>
        </div>

        <div className="hero-visual">
          <div className="wallet-icon" />
        </div>
      </section>

      <section className="cards-row">
        <FeatureCard title="Total Gross Exposure" value={formatCurrency(netExposure)} subtitle="Supplied across all protocols." accent="blue" />
        <FeatureCard title="Total Active Debt" value={formatCurrency(totalDebt)} subtitle="Debt currently in position." accent="rose" />
        <FeatureCard title="Health Factor" value={healthFactor} subtitle="NAVI / E-mode health score." accent="emerald" />
      </section>

      <section className="dashboard-split">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Allocation</p>
              <h3>Current asset breakdown</h3>
            </div>
          </div>
          <div className="allocation-list">
            {allocation.map((item) => {
              const percent = Math.round((item.value / totalAssetValue) * 100);
              return (
                <AllocationRow key={item.label} item={item} percent={percent} />
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Insights</p>
              <h3>APR snapshot</h3>
            </div>
          </div>
          <div className="insight-grid">
            <InsightCard label="Cetus APR" value={cetusApr} />
            <InsightCard label="NAVI APR" value={naviApr} />
            <InsightCard label="Suilend APR" value={suilendApr} />
            <InsightCard label="Wallet total" value={formatCurrency(walletSui + walletCetus)} />
          </div>
        </div>
      </section>

      <section className="panel large-panel">
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Latest data</p>
            <h3>Raw row details</h3>
          </div>
        </div>
        <div className="data-grid">
          {headers.map((header) => (
            <div key={header} className="data-card">
              <span className="data-label">{header}</span>
              <p>{latestRow?.[header] ?? '—'}</p>
            </div>
          ))}
        </div>
      </section>

      {loading && <div className="status-banner">Loading latest sheet data…</div>}
      {error && <div className="status-banner status-error">{error}</div>}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`card-pill card-pill-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FeatureCard({ title, value, subtitle, accent }) {
  return (
    <div className={`feature-card feature-${accent}`}>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
      <span>{subtitle}</span>
    </div>
  );
}

function AllocationRow({ item, percent }) {
  return (
    <div className="allocation-row">
      <div className="allocation-header">
        <span>{item.label}</span>
        <strong>{formatCurrency(item.value)}</strong>
      </div>
      <div className="allocation-bar">
        <div className={`allocation-fill ${item.color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="allocation-meta">{percent}% of assets</span>
    </div>
  );
}

function InsightCard({ label, value }) {
  return (
    <div className="insight-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
