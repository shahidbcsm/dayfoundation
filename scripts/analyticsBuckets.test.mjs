import { buildSeries } from '../src/utils/analyticsBuckets.ts';
const NOW = new Date(2026, 7, 12, 15, 0, 0); // 12 Aug 2026, local
const iso = (y,m,d,h=12) => new Date(y,m,d,h).toISOString();
let pass=0, fail=0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got)===JSON.stringify(want);
  ok?pass++:fail++;
  console.log(`${ok?'PASS':'FAIL'}  ${name}` + (ok?'':`\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`));
};

// 1. week = trailing 7 days inclusive of today
const wk = buildSeries([], 'week', ()=>1, NOW);
t('week: 7 buckets', wk.data.length, 7);
t('week: last bucket is today', wk.data[6].key, '2026-08-12');
t('week: first bucket is 6 days back', wk.data[0].key, '2026-08-06');

// 2. counting + deleted filter + out-of-range exclusion
const recs = [
  {createdAt: iso(2026,7,12)},               // today
  {createdAt: iso(2026,7,12)},               // today
  {createdAt: iso(2026,7,10)},               // in week
  {createdAt: iso(2026,7,1)},                // out of week, in month
  {createdAt: iso(2026,7,12), deleted:true}, // must be ignored
  {createdAt: undefined},                    // must be ignored
  {createdAt: 'garbage'},                    // must be ignored
];
const wk2 = buildSeries(recs,'week',()=>1,NOW);
t('week: today counts 2', wk2.data[6].value, 2);
t('week: total excludes deleted/invalid/out-of-range', wk2.total, 3);

// 3. month = every day of current month, Aug=31
const mo = buildSeries(recs,'month',()=>1,NOW);
t('month: 31 buckets for Aug', mo.data.length, 31);
t('month: total includes Aug 1', mo.total, 4);

// 4. year = 12 months
const yr = buildSeries(recs,'year',()=>1,NOW);
t('year: 12 buckets', yr.data.length, 12);
t('year: grouping', yr.grouping, 'month');
t('year: Aug bucket = 4', yr.data[7].value, 4);

// 5. donation amounts sum rather than count
const don = [{createdAt:iso(2026,7,12),amount:500},{createdAt:iso(2026,7,12),amount:'250'}];
t('donations: sums amounts', buildSeries(don,'week',r=>Number(r.amount)||0,NOW).total, 750);

// 6. ALL TIME auto-grouping
const short=[{createdAt:iso(2026,7,1)},{createdAt:iso(2026,7,20)}];
t('all/short span -> day', buildSeries(short,'all',()=>1,NOW).grouping, 'day');
const mid=[{createdAt:iso(2025,0,1)},{createdAt:iso(2026,7,1)}];
t('all/mid span -> month', buildSeries(mid,'all',()=>1,NOW).grouping, 'month');
const long=[{createdAt:iso(2018,0,1)},{createdAt:iso(2026,7,1)}];
const L=buildSeries(long,'all',()=>1,NOW);
t('all/long span -> year', L.grouping, 'year');
t('all: no history lost (2018..2026)', L.data.length, 9);
t('all: total preserved', L.total, 2);

// 7. empty
const e = buildSeries([],'all',()=>1,NOW);
t('all/empty -> empty data', e.data.length, 0);
t('all/empty -> zero total', e.total, 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
