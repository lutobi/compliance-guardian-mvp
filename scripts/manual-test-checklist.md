# Multi-Tenant Workspace Flow Manual Test Checklist

## Prerequisites
- A test user account with no workspaces
- A test user account with existing workspaces

## Test Scenarios

### 1. New User Flow
- [ ] Sign in with a user that has no workspaces
- [ ] Verify redirect to `/workspace/select`
- [ ] Create a new workspace
- [ ] Verify redirect to workspace dashboard (`/workspace/{slug}/dashboard`)
- [ ] Verify workspace name appears in the UI

### 2. Existing User Flow
- [ ] Sign in with a user that has existing workspaces
- [ ] Verify automatic redirect to the default workspace dashboard
- [ ] If multiple workspaces exist, verify ability to switch between workspaces
- [ ] After switching, verify the UI updates to reflect the selected workspace

### 3. API Endpoint Tests
- [ ] Test `/api/team/init` endpoint directly with Postman or curl:
  ```
  curl -X POST http://localhost:3000/api/team/init \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer {valid-token}" \
    --cookie "sb-{project-ref}={session-cookie}"
  ```
- [ ] Verify successful response with workspace details
- [ ] Test `/api/workspace/switch` endpoint:
  ```
  curl -X POST http://localhost:3000/api/workspace/switch \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer {valid-token}" \
    --cookie "sb-{project-ref}={session-cookie}" \
    -d '{"workspaceSlug": "your-workspace-slug"}'
  ```
- [ ] Verify successful response

### 4. Edge Cases
- [ ] Test behavior when a user's default workspace is deleted
- [ ] Test behavior when a user is removed from their current workspace
- [ ] Test workspace creation with duplicate slug names
- [ ] Test workspace switching with invalid workspace slug

## Verification Points
- No 500 errors on `/api/team/init` endpoint
- Proper redirection after authentication
- Correct workspace loading in the UI
- Proper error handling for invalid cases
