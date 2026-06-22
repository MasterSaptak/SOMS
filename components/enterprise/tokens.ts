// ============================================================
// SOMS Enterprise — Design Token Constants (JS-side)
// ============================================================

/** Curated chart color palette — harmonious and accessible */
export const CHART_COLORS = {
  blue:    'hsl(var(--chart-1))',
  emerald: 'hsl(var(--chart-2))',
  purple:  'hsl(var(--chart-3))',
  amber:   'hsl(var(--chart-4))',
  red:     'hsl(var(--chart-5))',
  sky:     'hsl(var(--chart-6))',
} as const

export const CHART_COLOR_ARRAY = [
  CHART_COLORS.blue,
  CHART_COLORS.emerald,
  CHART_COLORS.purple,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.sky,
]

/** Widget size definitions for the Bento layout engine */
export type WidgetSize = 'hero' | 'wide' | 'medium' | 'tall' | 'small'

export const WIDGET_SIZES: Record<WidgetSize, { colSpan: number; rowSpan: number }> = {
  hero:   { colSpan: 2, rowSpan: 2 },
  wide:   { colSpan: 2, rowSpan: 1 },
  medium: { colSpan: 1, rowSpan: 1 },
  tall:   { colSpan: 1, rowSpan: 2 },
  small:  { colSpan: 1, rowSpan: 1 },
}

/** Recharts tooltip styling — matches the Enterprise surface system */
export const RECHARTS_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'hsl(var(--surface-elevated))',
    borderColor: 'hsl(var(--border))',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.06)',
    padding: '12px 16px',
    fontSize: '13px',
  },
  labelStyle: {
    color: 'hsl(var(--foreground))',
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '13px',
    padding: '2px 0',
  },
}

/** Recharts axis styling — clean, minimal, Enterprise typography */
export const RECHARTS_AXIS_STYLE = {
  axisLine: false,
  tickLine: false,
  tick: {
    fontSize: 11,
    fill: 'hsl(var(--muted-foreground))',
  },
}

/** Recharts grid styling — ultra-subtle */
export const RECHARTS_GRID_STYLE = {
  strokeDasharray: '3 3',
  vertical: false as const,
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.5,
}

/** Widget state types */
export type WidgetState = 'idle' | 'loading' | 'empty' | 'error' | 'updating' | 'offline' | 'live'

/** Status indicator variants */
export const STATUS_VARIANTS = {
  online:  { color: 'bg-emerald-500', pulse: true,  label: 'Online' },
  offline: { color: 'bg-gray-400',    pulse: false, label: 'Offline' },
  busy:    { color: 'bg-red-500',     pulse: false, label: 'Busy' },
  away:    { color: 'bg-amber-500',   pulse: false, label: 'Away' },
  live:    { color: 'bg-emerald-500', pulse: true,  label: 'Live' },
} as const

export type StatusVariant = keyof typeof STATUS_VARIANTS

/** Surface class compositions — for programmatic surface application */
export const SURFACE_CLASSES = {
  base:      'surface-base',
  primary:   'surface-primary',
  secondary: 'surface-secondary',
  elevated:  'surface-elevated',
  glass:     'surface-glass',
} as const

export type SurfaceVariant = keyof typeof SURFACE_CLASSES
