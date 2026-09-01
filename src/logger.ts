export function logAppEvent(event: string, details?: Record<string, unknown>) {
  if (__DEV__) {
    console.info(`[hōm] ${event}`, details ?? '');
  }
}
