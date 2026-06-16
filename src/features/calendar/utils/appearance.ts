export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getEventAppearance(color: string) {
  return {
    bg: { backgroundColor: hexToRgba(color, 0.2) },
    text: { color },
    mutedText: { color: hexToRgba(color, 0.78) },
  }
}
