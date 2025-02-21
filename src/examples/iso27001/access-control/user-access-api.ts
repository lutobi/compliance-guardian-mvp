import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Schema for user access metrics
const UserAccessMetrics = z.object({
  total_users: z.number(),
  active_users: z.number(),
  inactive_users: z.number(),
  privileged_accounts: z.number(),
  accounts_requiring_review: z.number(),
  last_review_date: z.string(),
  compliance_percentage: z.number(),
});

// Schema for password metrics
const PasswordMetrics = z.object({
  total_passwords: z.number(),
  compliant_passwords: z.number(),
  non_compliant_passwords: z.number(),
  expired_passwords: z.number(),
  expiring_soon: z.number(),
  compliance_percentage: z.number(),
});

// Schema for access review metrics
const AccessReviewMetrics = z.object({
  total_reviews_required: z.number(),
  reviews_completed: z.number(),
  reviews_pending: z.number(),
  overdue_reviews: z.number(),
  last_review_date: z.string(),
  compliance_percentage: z.number(),
});

// Mock data store
const mockMetrics = {
  userAccess: {
    total_users: 100,
    active_users: 85,
    inactive_users: 15,
    privileged_accounts: 10,
    accounts_requiring_review: 5,
    last_review_date: new Date().toISOString(),
    compliance_percentage: 95,
  },
  
  passwords: {
    total_passwords: 100,
    compliant_passwords: 92,
    non_compliant_passwords: 8,
    expired_passwords: 3,
    expiring_soon: 5,
    compliance_percentage: 92,
  },
  
  accessReview: {
    total_reviews_required: 50,
    reviews_completed: 45,
    reviews_pending: 5,
    overdue_reviews: 2,
    last_review_date: new Date().toISOString(),
    compliance_percentage: 90,
  }
};

// Endpoints
app.get('/api/access-control/user-management', (req, res) => {
  try {
    const metrics = UserAccessMetrics.parse(mockMetrics.userAccess);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Invalid metrics data' });
  }
});

app.get('/api/access-control/password-management', (req, res) => {
  try {
    const metrics = PasswordMetrics.parse(mockMetrics.passwords);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Invalid metrics data' });
  }
});

app.get('/api/access-control/access-review', (req, res) => {
  try {
    const metrics = AccessReviewMetrics.parse(mockMetrics.accessReview);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Invalid metrics data' });
  }
});

// Start server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Access Control monitoring API running on port ${port}`);
});
