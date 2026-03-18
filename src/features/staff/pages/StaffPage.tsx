import { UserPlus } from "lucide-react";
import { StaffOverviewCard } from "../components/StaffOverviewCard";
import { UserListTabs } from "../components/UserListTabs";
import { CreateUserForm } from "../components/CreateUserForm";
import { MOCK_STAFF_USERS } from "../data/mockUsers";

export function StaffPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Staff Management</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          View, manage, and assign roles across your team
        </p>
      </div>

      {/* Main Grid: 2 equal columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Overview + List */}
        <div className="space-y-6">
          <StaffOverviewCard users={MOCK_STAFF_USERS} />
          <UserListTabs users={MOCK_STAFF_USERS} />
        </div>

        {/* Right Column: Create User Form */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm sticky top-24">
          <div className="px-5 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">Create New User</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  Add Super Admin, Supervisor, or Agent
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <CreateUserForm />
          </div>
        </div>
      </div>
    </div>
  );
}
