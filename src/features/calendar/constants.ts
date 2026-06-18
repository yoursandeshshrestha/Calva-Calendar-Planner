export const DAY_START_HOUR = 0
export const DAY_END_HOUR = 24
export const HOUR_HEIGHT = 72
export const TOP_PADDING_ROWS = 2
export const TOP_PADDING_HEIGHT = TOP_PADDING_ROWS * HOUR_HEIGHT
export const GRID_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT
export const TOTAL_GRID_HEIGHT = TOP_PADDING_HEIGHT + GRID_HEIGHT
export const TIME_GUTTER_WIDTH = 64
export const DAY_COLUMN_MIN_WIDTH = 150
export const EVENT_GAP = 2

export const GRID_BORDER = 'border-gray-200 dark:border-gray-800'

export const HOUR_GRID_BACKGROUND = {
  backgroundImage: `repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.07) 0, rgb(0 0 0 / 0.07) 1px, transparent 1px, transparent ${HOUR_HEIGHT}px)`,
  backgroundPosition: `0 ${TOP_PADDING_HEIGHT}px`,
  backgroundRepeat: 'repeat-y' as const,
}
