import "./globals.css";
import Sidebar from "../components/Sidebar";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext"; // ➕ new
import Toast from "../components/Toast"; // ➕ new

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="block md:flex bg-[#f7f7f7] text-[#212121] min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <Sidebar />
            <main className="flex-1 px-2 py-6 md:px-10 md:py-8 relative">{children}</main>
            <Toast /> {/* 📢 Toast always available */}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
