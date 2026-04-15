import { LoginForm } from "../components/LoginForm";
import { motion } from "framer-motion";

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-accent/60 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo mark */}
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/15">
            <span className="text-2xl font-bold text-primary-foreground">B</span>
          </div>

          <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">
            BetaMoni
          </h1>
          <p className="text-muted-foreground text-sm">Admin Dashboard</p>
        </motion.div>

        {/* Login form with entrance animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <LoginForm />
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Nano-lending platform for market traders
        </motion.p>
      </div>
    </div>
  );
}
