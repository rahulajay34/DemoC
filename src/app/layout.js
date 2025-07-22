import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import Toast from "../components/Toast";
import MainLayout from "@/components/MainLayout"; // Correctly import the new component

export const metadata = {
  title: "Cheetah Admin",
  description: "Admin dashboard for Cheetah services",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

function AnimatedBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <div className="absolute top-0 -left-1/2 w-96 h-96 bg-orange-500/30 rounded-full filter blur-3xl opacity-50 animate-liquid-move"></div>
      <div
        className="absolute -bottom-1/2 right-0 w-96 h-96 bg-red-500/30 rounded-full filter blur-3xl opacity-50 animate-liquid-move"
        style={{ animationDelay: "-5s" }}
      ></div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <AnimatedBackground />
            <MainLayout>{children}</MainLayout>
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}