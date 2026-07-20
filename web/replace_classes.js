const fs = require('fs');

function replaceClass(file, from, to) {
  let c = fs.readFileSync(file, 'utf-8');
  c = c.replace(new RegExp(from, 'g'), to);
  fs.writeFileSync(file, c);
}

// DashboardClient.tsx
replaceClass(
  'src/app/DashboardClient.tsx', 
  'className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"', 
  'className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-2xl p-5"'
);
replaceClass(
  'src/app/DashboardClient.tsx',
  'className="bg-white shadow-sm border border-slate-200/60 rounded-3xl overflow-hidden flex flex-col min-h-\\[500px\\]"',
  'className="bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-white/50 rounded-3xl overflow-hidden flex flex-col min-h-[500px]"'
);

// OverviewClient.tsx
replaceClass(
  'src/app/overview/OverviewClient.tsx',
  'className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"',
  'className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden flex flex-col"'
);

// ReferencesClient.tsx
replaceClass(
  'src/app/references/ReferencesClient.tsx',
  'className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"',
  'className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden"'
);

console.log('Done');
