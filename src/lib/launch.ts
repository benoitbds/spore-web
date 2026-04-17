/**
 * Client-side launch-mode flag.
 *
 * Mirrors the LAUNCH_MODE env on the API. Default true — flip to
 * "false" via NEXT_PUBLIC_LAUNCH_MODE once paid checkout is ready to
 * restore the Stripe flow without a code edit.
 */
export const LAUNCH_MODE: boolean =
  (process.env.NEXT_PUBLIC_LAUNCH_MODE ?? 'true').toLowerCase() === 'true';
