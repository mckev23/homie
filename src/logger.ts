export function logAppEvent(event: string, details?: Record<string, unknown>) {
  if (__DEV__) {
    console.info(`[Homie] ${event}`, details ?? '');
  }
}
