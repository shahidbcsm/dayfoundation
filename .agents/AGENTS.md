# Workspace Rules

## Deployment Constraints
- **Vercel Deployment**: NEVER trigger Vercel deployment (`vercel --prod`, `vercel`, etc.) automatically after any prompt or feature completion.
- **Explicit Confirmation Required**: ALWAYS ask the user for explicit confirmation ("Should I proceed with Vercel deployment?") and wait for their explicit "yes" before running any `vercel` command.
dont stop untill the command isnt completed.
