export function calculateSlaStatus(createdAtStr: string): {
  daysPassed: number;
  remainingDays: number;
} {
  const createdTime = new Date(createdAtStr).getTime();
  const currentTime = Date.now();
  const diffDays = Math.floor((currentTime - createdTime) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(1, diffDays);
  const remainingDays = 14 - daysPassed;

  return {
    daysPassed,
    remainingDays,
  };
}
