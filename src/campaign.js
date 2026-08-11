export const CAMPAIGN_END = new Date('2026-08-15T03:00:00.000Z');

export function getCampaignState(date = new Date()) {
  return date.getTime() < CAMPAIGN_END.getTime() ? 'prelaunch' : 'launched';
}
