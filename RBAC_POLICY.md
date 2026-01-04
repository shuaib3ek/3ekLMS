# Role-Based Access Control (RBAC) Policy
## Governance Model: "Monitors, Not Controllers"

This document defines the strict RBAC model for the Multi-Tenant Training & Lab Platform.

### 1. Role vs Capability Matrix

| Feature Domain | Super Admin (Platform Owner) | **Org Admin** (Governance) | Trainer (Delivery) | Learner (Consumer) |
| :--- | :---: | :---: | :---: | :---: |
| **Organization** | **CRUD** | **Read-Only** | - | - |
| **Programs** | **CRUD** | **Read-Only** (Own Org) | Read-Only | Read Assigned |
| **Batches** | **CRUD** | **Read-Only** (Own Org) | Manage Assigned | Read Enrolled |
| **Users** | **CRUD** | **Read-Only** (Own Org) | View Students | View Peer (Limited) |
| **Enrollment** | **Manage** | **Read-Only** | View | - |
| **Labs** | **Config & Manage** | **View Usage** | Manage Session | Launch |
| **Assessments** | **Create & Config** | **View Results** | Grade | Take |
| **Reports** | **Platform-Wide** | **Org-Wide** | Batch-Level | Personal |
| **Audit Logs** | **Full Access** | - | - | - |
| **Billing** | **Full Access** | - | - | - |

*(Legend: CRUD = Create, Read, Update, Delete)*

---

### 2. The Logic: Why Org Admin is Read-Only

The **Org Admin** role is designed strictly for **Governance, Compliance, and Stakeholder Visibility**.

1.  **Separation of Concerns**: Operational tasks (creating users, scheduling batches) are delegated to the **Platform Operations Team (Super Admins)** or **Instructors**. The Org Admin represents the "Client" or "Manager" who needs to ensure training is effective but should not touch the machinery.
2.  **Data Integrity**: Preventing Org Admins from modifying programs ensures that the standardized curriculum (sold/assigned to them) remains 100% consistent with what was agreed upon.
3.  **Security boundaries**: By removing write access, we eliminate the risk of an Org Admin accidentally deleting users, changing configurations, or escalating privileges within the tenant.
4.  **"outcomes over Operations"**: This role focuses on *results* (Completion rates, Assessment scores, ROI) rather than *inputs* (Adding users, Fixing typos).

**One-Line Philosophy**: *"Org Admins monitor outcomes; they do not control delivery."*

---

### 3. Enforcement Strategy

#### A. Database Level (Schema)
*   **Tenant Isolation**: All queries for Org Admin MUST include `where: { orgId: current_user.org_id }`.
*   **Immutable Role**: The Role `ORG_ADMIN` is strictly defined in the code enum and cannot be modified by the Org Admin themselves.

#### B. API Level (Middleware / Actions)
*   **Action Guards**: Every mutation action (Create, Update, Delete) must check:
    ```typescript
    if (user.role === 'ORG_ADMIN') throw new Error("Permission Denied: Read-Only Access");
    ```
*   **Read Guards**: All fetch actions for Org Admin must enforce the Org ID filter.

#### C. UI Level
*   **Visual Cues**: Hide "Create", "Edit", and "Delete" buttons for Org Admins.
*   **Read-Only Forms**: Render input fields as text or disabled inputs.
*   **Navigation**: Remove links to "Settings", "Billing", or "Audit Logs".

---

### 4. Sample Permission Policy (JSON Rule Set)

```json
{
  "roles": {
    "SUPER_ADMIN": {
      "can": ["*"]
    },
    "ORG_ADMIN": {
      "can": [
        "org:read",
        "program:read",
        "batch:read",
        "user:read",
        "report:read",
        "lab:view_usage",
        "assessment:view_results"
      ],
      "cannot": [
        "*:create",
        "*:update",
        "*:delete",
        "billing:*",
        "system:*"
      ]
    },
    "TRAINER": {
      "can": [
        "batch:manage_session",
        "assessment:grade",
        "report:read_batch"
      ]
    },
    "LEARNER": {
      "can": [
        "course:access",
        "lab:launch",
        "assessment:take"
      ]
    }
  }
}
```
