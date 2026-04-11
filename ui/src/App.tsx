import { useEffect, useState } from 'react';
import { GraphViewer } from './components/GraphViewer';
import { Database, Search, Network, Target } from 'lucide-react';
import { useGraphFilters } from './hooks/useGraphFilters';
import { EDGE_STYLES, FILTERABLE_LABELS, DEFAULT_VISIBLE_LABELS, NODE_COLORS } from './lib/constants';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lifted Graph state
  const { 
    visibleEdgeTypes, 
    toggleEdgeVisibility, 
    depthFilter, 
    setDepthFilter,
    visibleLabels, 
    toggleLabelVisibility,
    setVisibleLabels 
  } = useGraphFilters();
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize display labels properly matching GitNexus defaults
  useEffect(() => {
    setVisibleLabels(DEFAULT_VISIBLE_LABELS);
  }, [setVisibleLabels]);

  useEffect(() => {
    fetch('/api/graph/data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error || 'Failed to load graph data');
        }
      })
      .catch(err => setError(err.toString()))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen w-full bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#0A0F24] p-6 flex flex-col gap-6 relative z-10 shadow-[rgba(0,0,0,0.5)_4px_0_24px_-4px] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-500">
            LeanKG
          </h1>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 bg-blue-600/10 text-blue-400">
            <Database className="w-5 h-5" />
            <span className="font-medium">Explorer</span>
          </button>
        </nav>

        <div className="flex flex-col gap-4 mt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search node..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 max-h-[300px] overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 mb-3 text-slate-300 font-medium text-xs uppercase tracking-wider">
              <Database className="h-4 w-4 text-slate-400" />
              Node Types
            </div>
            <div className="flex flex-col gap-2">
              {FILTERABLE_LABELS.map((type) => {
                const isActive = visibleLabels.includes(type);
                const color = NODE_COLORS[type] || '#666';
                return (
                  <button
                    key={type}
                    onClick={() => toggleLabelVisibility(type)}
                    className={`w-full px-2 py-1.5 flex items-center gap-3 rounded-md border text-xs transition-colors ${
                      isActive 
                        ? 'bg-slate-800 border-slate-600 text-slate-200' 
                        : 'bg-transparent border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3 text-slate-300 font-medium text-xs uppercase tracking-wider">
              <Network className="h-4 w-4 text-slate-400" />
              Edge Types
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(EDGE_STYLES).map(([type, style]) => {
                const isActive = visibleEdgeTypes.length === 0 || visibleEdgeTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleEdgeVisibility(type)}
                    className={`w-full px-2 py-1.5 flex items-center gap-3 rounded-md border text-xs transition-colors ${
                      isActive 
                        ? 'bg-slate-800 border-slate-600 text-slate-200' 
                        : 'bg-transparent border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }}></div>
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Depth Filter matching GitNexus */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2 text-slate-300 font-medium text-xs uppercase tracking-wider">
              <Target className="h-4 w-4 text-slate-400" />
              Focus Depth
            </div>
            <p className="mb-3 text-[11px] text-slate-500">
              Show nodes within N hops of selection
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: null, label: 'All' },
                { value: 1, label: '1 hop' },
                { value: 2, label: '2 hops' },
                { value: 3, label: '3 hops' },
                { value: 5, label: '5 hops' },
              ].map(({ value, label }) => (
                <button
                  key={label}
                  onClick={() => setDepthFilter(value)}
                  className={`rounded px-2 py-1 border text-xs transition-colors ${
                    depthFilter === value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Graph Stats</h4>
            {data ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-slate-400">Nodes</span>
                  <span className="text-blue-400 font-bold">{data.nodes.length}</span>
                </div>
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-slate-400">Relationships</span>
                  <span className="text-amber-400 font-bold">{data.relationships.length}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading...</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)] z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-mono">Loading Graph Engine...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background)] z-20">
            <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl max-w-lg text-center">
              <h2 className="text-red-400 font-bold mb-2 text-xl">Connection Error</h2>
              <p className="text-slate-300 font-mono text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <GraphViewer 
            data={data} 
            loading={loading} 
            error={error} 
            searchTerm={searchTerm}
            visibleEdgeTypes={visibleEdgeTypes}
            depthFilter={depthFilter}
            visibleLabels={visibleLabels}
          />
        )}
      </main>
    </div>
  );
}

export default App;
