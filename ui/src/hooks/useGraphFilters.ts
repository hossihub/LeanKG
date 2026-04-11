import { useState, useCallback } from 'react';
import type { EdgeType } from '../lib/constants';

export const useGraphFilters = () => {
  const [visibleLabels, setVisibleLabels] = useState<string[]>([]);
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState<EdgeType[]>([]);
  const [depthFilter, setDepthFilter] = useState<number | null>(null);

  const toggleLabelVisibility = useCallback((label: string) => {
    setVisibleLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }, []);

  const toggleEdgeVisibility = useCallback((edgeType: EdgeType) => {
    setVisibleEdgeTypes((prev) =>
      prev.includes(edgeType) ? prev.filter((e) => e !== edgeType) : [...prev, edgeType],
    );
  }, []);

  return {
    visibleLabels,
    setVisibleLabels,
    toggleLabelVisibility,
    visibleEdgeTypes,
    setVisibleEdgeTypes,
    toggleEdgeVisibility,
    depthFilter,
    setDepthFilter,
  };
};
