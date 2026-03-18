import { ShieldCheck, UserCheck, Users } from "lucide-react";
import type { StaffUser } from "@/types/staff.types";

// ── Component ──────────────────────────────────────────────────────

interface StaffOverviewCardProps {
  users: StaffUser[];
}

export function StaffOverviewCard({ users }: StaffOverviewCardProps) {
  const superAdminCount = users.filter((u) => u.role === "super-admin").length;
  const supervisorCount = users.filter((u) => u.role === "supervisor").length;
  const agentCount = users.filter((u) => u.role === "agent").length;

  const stats = [
    {
      label: "Super Admins",
      count: superAdminCount,
      icon: ShieldCheck,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Supervisors",
      count: supervisorCount,
      icon: UserCheck,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: "Agents",
      count: agentCount,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, count, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="rounded-xl border bg-card p-4 flex flex-col items-center gap-2"
        >
          <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <p className={`text-2xl font-bold ${color}`}>{count}</p>
          <p className="text-[11px] text-muted-foreground font-medium text-center uppercase tracking-wide">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
