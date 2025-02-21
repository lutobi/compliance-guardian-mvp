// Example endpoint that returns system update status
// Run this as a separate service that checks your systems
const express = require('express');
const app = express();

app.get('/api/system-updates', async (req, res) => {
  const updates = {
    total_systems: 10,
    systems_up_to_date: 8,
    systems_pending_updates: 2,
    last_update_check: new Date().toISOString(),
    critical_updates_pending: 0,
    update_compliance_percentage: 80
  };
  
  res.json(updates);
});

app.get('/api/patch-management', async (req, res) => {
  const patchStatus = {
    total_patches: 150,
    critical_patches_applied: 150,
    high_patches_applied: 145,
    medium_patches_applied: 140,
    patch_compliance_percentage: 95
  };
  
  res.json(patchStatus);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`System updates monitoring endpoint running on port ${port}`);
});
