import { useState } from "react";
import { useGetRolesQuery, useCreateUserMutation } from "@/api/endpoints/staffApi";
import { useGetClusterMarketsQuery } from "@/api/endpoints/clustersApi";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

// ── Component ──────────────────────────────────────────────────────

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: rolesRes, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: marketsRes, isLoading: marketsLoading } = useGetClusterMarketsQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const { toast } = useToast();

  const roles = rolesRes?.data ?? [];
  const markets = marketsRes?.data ?? [];

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [marketId, setMarketId] = useState("");

  // Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = name && email && phone && password && roleId && marketId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const res = await createUser({
        name,
        email,
        phone_number: phone,
        password,
        role_id: roleId,
        market_id: marketId,
      }).unwrap();

      toast({
        title: "User created",
        description: `${res.data?.name ?? name} can now sign in with the assigned role.`,
      });

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRoleId("");
      setMarketId("");
      onSuccess?.();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Failed to create user. Please try again."),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
      <p className="text-sm font-semibold">Create New User</p>

      {/* Result Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Full Name" required>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>

        <FieldGroup label="Email Address" required>
          <input
            type="email"
            placeholder="e.g. john@betamoni.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>
      </div>

      {/* Phone & Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Phone Number" required>
          <input
            type="tel"
            placeholder="e.g. 08023456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>

        <FieldGroup label="Password" required>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
        </FieldGroup>
      </div>

      {/* Role & Market selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Account Type" required>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="input-field"
            required
            disabled={rolesLoading}
          >
            <option value="">
              {rolesLoading ? "Loading roles..." : "Select a role"}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label="Assigned Market" required>
          <select
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            className="input-field"
            required
            disabled={marketsLoading}
          >
            <option value="">
              {marketsLoading ? "Loading markets..." : "Select a market"}
            </option>
            {markets.map((market) => (
              <option key={market.id} value={String(market.id)}>
                {market.name}
              </option>
            ))}
          </select>
        </FieldGroup>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid || isCreating}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isCreating ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}

// ── Field Group ────────────────────────────────────────────────────

function FieldGroup({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
