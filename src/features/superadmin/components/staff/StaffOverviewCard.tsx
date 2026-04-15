import { ShieldCheck, UserCheck, Users } from "lucide-react";
import type { StaffUser } from "@/types/staff.types";
import { SummaryCard } from "@/components/shared/SummaryCard";

// ── Component ──────────────────────────────────────────────────────

interface StaffOverviewCardProps {
  users: StaffUser[];
}

export function StaffOverviewCard({ users }: StaffOverviewCardProps) {
  const superAdminCount = users.filter((u) => u.role.slug === "super-admin").length;
  const supervisorCount = users.filter((u) => u.role.slug === "supervisor").length;
  const agentCount = users.filter((u) => u.role.slug === "agent").length;

  const stats = [
    {
      label: "Super Admins",
      count: superAdminCount,
      icon: ShieldCheck,
      tone: "primary" as const,
    },
    {
      label: "Supervisors",
      count: supervisorCount,
      icon: UserCheck,
      tone: "info" as const,
    },
    {
      label: "Agents",
      count: agentCount,
      icon: Users,
      tone: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, count, icon, tone }) => (
        <SummaryCard
          key={label}
          icon={icon}
          label={label}
          value={count}
          tone={tone}
        />
      ))}
    </div>
  );
}
