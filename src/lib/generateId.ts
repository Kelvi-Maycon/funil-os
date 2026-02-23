/**
 * Generate a unique ID with an optional prefix.
 * Uses crypto.randomUUID() for collision-free IDs.
 * Example: generateId('t') → "t_a1b2c3d4-e5f6-..."
 */
export function generateId(prefix?: string): string {
  const uuid = crypto.randomUUID()
  return prefix ? `${prefix}_${uuid}` : uuid
}
