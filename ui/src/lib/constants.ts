export const NODE_COLORS: Record<string, string> = {
  Project: '#a855f7',
  Package: '#8b5cf6',
  Module: '#7c3aed',
  Folder: '#6366f1',
  File: '#3b82f6',
  Class: '#f59e0b',
  Function: '#10b981',
  Method: '#14b8a6',
  Variable: '#64748b',
  Interface: '#ec4899',
  Enum: '#f97316',
  Decorator: '#eab308',
  Import: '#475569',
  Type: '#a78bfa',
  CodeElement: '#64748b',
  Struct: '#f59e0b',
  Trait: '#ec4899',
  Impl: '#14b8a6',
  TypeAlias: '#a78bfa',
  Const: '#64748b',
  Static: '#64748b',
  Namespace: '#7c3aed',
  Union: '#f97316',
};

export const NODE_SIZES: Record<string, number> = {
  Project: 20,
  Package: 16,
  Module: 13,
  Folder: 10,
  File: 6,
  Class: 8,
  Function: 4,
  Method: 3,
  Variable: 2,
  Interface: 7,
  Enum: 5,
  Decorator: 2,
  Import: 1.5,
  Type: 3,
  CodeElement: 2,
  Struct: 8,
  Trait: 7,
  Impl: 3,
  TypeAlias: 3,
  Namespace: 13,
  Union: 5,
};

export const EDGE_STYLES: Record<string, { color: string; sizeMultiplier: number }> = {
  // STRUCTURAL
  CONTAINS: { color: '#2d5a3d', sizeMultiplier: 0.4 }, // Forest green
  
  // DEFINITIONS
  DEFINES: { color: '#0e7490', sizeMultiplier: 0.5 }, // Cyan
  
  // DEPENDENCIES
  IMPORTS: { color: '#1d4ed8', sizeMultiplier: 0.6 }, // Blue
  
  // FUNCTION FLOW
  CALLS: { color: '#7c3aed', sizeMultiplier: 0.8 }, // Violet
  
  // OOP
  EXTENDS: { color: '#c2410c', sizeMultiplier: 1.0 }, // Orange
  IMPLEMENTS: { color: '#be185d', sizeMultiplier: 0.9 }, // Pink
};

export type EdgeType = keyof typeof EDGE_STYLES | string;

export const FILTERABLE_LABELS = [
  'Folder',
  'File',
  'Class',
  'Interface',
  'Enum',
  'Type',
  'Function',
  'Method',
  'Variable',
  'Decorator'
];

export const DEFAULT_VISIBLE_LABELS = [
  'Folder',
  'File',
  'Class',
  'Interface',
  'Function',
  'Method'
];
