# Admin Guide

## Who this is for
Super admins managing the platform, users, providers, content, and system settings.

## Access
- Admin access is enforced by `profiles.role = admin`.
- Non-admins are redirected to their portal.

## Page-to-feature map
| Page | Purpose | Key actions |
| --- | --- | --- |
| `/admin` | Platform overview | Review snapshot metrics, jump to key areas |
| `/admin/users` | User management | Search by email, change roles, delete users |
| `/admin/providers` | Doctor registry | Review BMDC details, remove doctors |
| `/admin/clinics` | Clinic registry | Review clinic listings, remove clinics |
| `/admin/ai-models` | AI config | Set API endpoints, input types, timeouts |
| `/admin/analytics` | Analytics | View platform-wide counts |
| `/admin/reports` | Weekly report | View 7-day activity metrics |
| `/admin/support` | Support | Advance ticket status and review details |
| `/admin/pricing` | Pricing CMS | Create and edit public pricing plans |
| `/admin/system` | System CMS | Branding, site config, contact details |
| `/admin/data` | Data manager | Table-level access and bulk review |
| `/admin/settings` | Admin profile | Profile, password, add admins |

## Core workflows
### Role changes
```mermaid
flowchart LR
	A[Admin selects user] --> B[Change role]
	B --> C[Save]
	C --> D[Profile updated]
	D --> E[User routed to new portal]
```

### AI model configuration
```mermaid
flowchart TD
	A[Open AI Models] --> B[Edit or add config]
	B --> C[Set API URL, input mode, timeout]
	C --> D[Activate config]
	D --> E[Chat/Triage uses active API]
```

### Support ticket lifecycle
```mermaid
stateDiagram-v2
	[*] --> Open
	Open --> InProgress: Start working
	InProgress --> Resolved: Mark resolved
	Resolved --> Closed: Close
```

## Notes
- Some sections are marked "Coming soon" and may not be fully functional yet.
