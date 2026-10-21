// First match wins: Edge and Firefox on iOS also mention Chrome/Safari; iPhones and Android mention Mac/Linux.
const browsers: [RegExp, string][] = [
  [/Edg/, 'Edge'],
  [/Firefox|FxiOS/, 'Firefox'],
  [/Chrome|CriOS/, 'Chrome'],
  [/Safari/, 'Safari'],
]
const systems: [RegExp, string][] = [
  [/iPhone/, 'iPhone'],
  [/iPad/, 'iPad'],
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/Macintosh|Mac OS X/, 'Mac'],
  [/Linux/, 'Linux'],
]

// "Chrome on Windows". Brave reports itself as Chrome.
export function describeDevice(userAgent: string): string {
  const browser = browsers.find(([pattern]) => pattern.test(userAgent))?.[1]
  const system = systems.find(([pattern]) => pattern.test(userAgent))?.[1]
  if (!browser) return 'Web browser'
  return system ? `${browser} on ${system}` : browser
}
