import { LoginForm } from "../components/LoginForm";
import { motion } from "framer-motion";

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-100/30 blur-3xl" />
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-4 shadow-lg shadow-emerald-200">
            <span className="text-2xl font-bold text-white">B</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
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
