import { useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import { StaffOverviewCard } from "../components/staff/StaffOverviewCard";
import { UserListTabs } from "../components/staff/UserListTabs";
import { CreateUserForm } from "../components/staff/CreateUserForm";
import { useGetUsersQuery } from "@/api/endpoints/staffApi";
import { PageHeader } from "@/components/shared/PageHeader";

export function StaffPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: usersRes, isLoading } = useGetUsersQuery();
  const users = usersRes?.data ?? [];

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <PageHeader
        icon={Users}
        title="Staff"
        description="View, manage, and assign roles across your team"
        action={
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            User
          </button>
        }
      />

      <StaffOverviewCard users={users} />

      {showForm && (
        <CreateUserForm onSuccess={() => setShowForm(false)} />
      )}

      <UserListTabs users={users} />
    </div>
  );
}
