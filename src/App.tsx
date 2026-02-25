import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/features/auth/components/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
