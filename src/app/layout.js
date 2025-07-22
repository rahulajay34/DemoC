import "./globals.css";
import Sidebar from "../components/Sidebar";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import Toast from "../components/Toast";

function AnimatedBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <div className="absolute top-0 -left-1/2 w-96 h-96 bg-orange-500/30 rounded-full filter blur-3xl opacity-50 animate-liquid-move"></div>
      <div className="absolute -bottom-1/2 right-0 w-96 h-96 bg-red-500/30 rounded-full filter blur-3xl opacity-50 animate-liquid-move" style={{animationDelay: '-5s'}}></div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="block md:flex min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <AnimatedBackground />
            <Sidebar />
            <main className="flex-1 px-2 py-6 md:px-10 md:py-8 relative isolate">
              {children}
            </main>
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}