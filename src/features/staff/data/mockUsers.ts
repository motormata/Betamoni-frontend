// ── Mock Users ─────────────────────────────────────────────────────
// Used until a GET /api/admin/users list endpoint is available.

import type { StaffUser } from "@/types/staff.types";

export const MOCK_STAFF_USERS: StaffUser[] = [
  // Super Admins
  {
    id: "sa-001",
    name: "Chukwuemeka Obi",
    email: "emeka.obi@betamoni.com",
    phone: "08012345678",
    role: "super-admin",
    role_name: "Super Admin",
    market: null,
    market_id: null,
    agent_code: null,
    is_active: 1,
  },

  // Supervisors
  {
    id: "sv-001",
    name: "Ngozi Eze",
    email: "ngozi.eze@betamoni.com",
    phone: "08123456789",
    role: "supervisor",
    role_name: "Supervisor",
    market: "Oshodi Market",
    market_id: 1,
    agent_code: null,
    is_active: 1,
  },
  {
    id: "sv-002",
    name: "Bade Adeleke",
    email: "bade.adeleke@betamoni.com",
    phone: "08076543210",
    role: "supervisor",
    role_name: "Supervisor",
    market: "Ikeja Market",
    market_id: 2,
    agent_code: null,
    is_active: 1,
  },

  // Agents
  {
    id: "ag-001",
    name: "Fatima Bello",
    email: "fatima.bello@betamoni.com",
    phone: "07034567890",
    role: "agent",
    role_name: "Agent",
    market: "Oshodi Market",
    market_id: 1,
    agent_code: "AG-OSH-001",
    is_active: 1,
  },
  {
    id: "ag-002",
    name: "Chidi Nwosu",
    email: "chidi.nwosu@betamoni.com",
    phone: "09023456789",
    role: "agent",
    role_name: "Agent",
    market: "Ikeja Market",
    market_id: 2,
    agent_code: "AG-IKJ-001",
    is_active: 1,
  },
  {
    id: "ag-003",
    name: "Amina Yusuf",
    email: "amina.yusuf@betamoni.com",
    phone: "08098765432",
    role: "agent",
    role_name: "Agent",
    market: null,
    market_id: null,
    agent_code: "AG-UNS-001",
    is_active: 0,
  },
];
