const ACTIVE_THRESHOLD_DAYS = 7;

// Completed  — latest stage is "Completed" (case-insensitive)
// Active     — latest update within the last 7 days and not Completed
// At Risk    — no updates yet, or latest update older than 7 days

const computeStatus = (latestStage, latestUpdateAt) => {
  if (latestStage && latestStage.toLowerCase() === 'completed') {
    return 'Completed';
  }

  if (!latestUpdateAt) {
    return 'At Risk';
  }

  const daysSinceUpdate = (Date.now() - new Date(latestUpdateAt).getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceUpdate <= ACTIVE_THRESHOLD_DAYS ? 'Active' : 'At Risk';
};

const attachStatus = (field) => ({
  ...field,
  computed_status: computeStatus(field.latest_stage, field.latest_update_at),
});

module.exports = { computeStatus, attachStatus };
