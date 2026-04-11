import { useEffect } from 'react';
import { useSigma } from '../hooks/useSigma';
import { createSigmaGraph, filterGraphByDepth } from '../lib/graph-adapter';
import type { KGNode, KGEdge } from '../lib/graph-adapter';
import { CodeViewer } from './CodeViewer';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface GraphViewerProps {
  data: { nodes: KGNode[]; relationships: KGEdge[] } | null;
  loading: boolean;
  error: string | null;
  searchTerm?: string;
  visibleEdgeTypes: string[];
  depthFilter: number | null;
  visibleLabels: string[];
}

export const GraphViewer = ({ 
  data, 
  loading, 
  error, 
  searchTerm,
  visibleEdgeTypes, 
  depthFilter, 
  visibleLabels 
}: GraphViewerProps) => {
  const {
    containerRef,
    setGraph,
    zoomIn,
    zoomOut,
    resetZoom,
    selectedNode,
    setSelectedNode,
    sigmaRef
  } = useSigma({
    visibleEdgeTypes,
    searchTerm,
  });

  // Transform and load Graphology instance
  useEffect(() => {
    if (!data || data.nodes.length === 0) return;
    const graph = createSigmaGraph(data.nodes, data.relationships);
    setGraph(graph);
  }, [data, setGraph]);

  // Apply Graph depth filter
  useEffect(() => {
    if (sigmaRef.current && data) {
      const g = sigmaRef.current.getGraph();
      const labels = visibleLabels.length > 0 ? visibleLabels : Array.from(new Set(data.nodes.map(n => n.properties?.elementType || n.label)));
      filterGraphByDepth(g as any, selectedNode, depthFilter, labels);
      sigmaRef.current.refresh();
    }
  }, [depthFilter, selectedNode, visibleLabels, sigmaRef, data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#0A0F24]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mb-4"></div>
        <p>Analyzing Knowledge Graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 bg-[#0A0F24]">
        <p className="text-xl mb-2">Failed to load graph</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0A0F24] overflow-hidden flex">
      {/* Sigma Container */}
      <div ref={containerRef} className="absolute inset-0 outline-none" />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-[#12182b]/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl flex flex-col p-1">
          <button onClick={zoomIn} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
          <div className="h-px w-full bg-slate-700/50 my-1" />
          <button onClick={zoomOut} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
          <div className="h-px w-full bg-slate-700/50 my-1" />
          <button onClick={resetZoom} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors" title="Fit to screen"><Maximize className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      {selectedNode && (
        <CodeViewer 
          selectedNode={selectedNode} 
          graphData={data} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
};
