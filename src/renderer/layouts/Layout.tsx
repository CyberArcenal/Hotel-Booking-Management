// src/layouts/Layout.tsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Shared/SideBar";
import TopBar from "../components/Shared/TopBar";
import updaterAPI, { type UpdateInfo } from "../api/updater";
import { Download, X } from "lucide-react";

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Listen for update available (for toast)
    const unsubAvailable = updaterAPI.onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
      setShowToast(true); // show toast automatically
    });

    // Optional: listen for download progress to hide toast?
    // We'll keep it simple

    return () => {
      unsubAvailable();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDownloadFromToast = () => {
    setShowToast(false);
    updaterAPI.downloadUpdate();
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global update toast */}
      {showToast && updateInfo && (
        <div className="fixed top-4 right-4 z-50 windows-fade-in">
          <div
            className="windows-card p-4 max-w-sm rounded-lg shadow-2xl"
            style={{
              background: "var(--card-bg)",
              border: "2px solid var(--primary-color)",
            }}
          >
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 flex-shrink-0" style={{ color: "var(--primary-color)" }} />
              <div className="flex-1">
                <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Update Available
                </h4>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Version {updateInfo.version} is ready to download.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleDownloadFromToast}
                    className="windows-btn windows-btn-primary text-sm py-1 px-3"
                    style={{
                      background: "var(--primary-color)",
                      border: "1px solid var(--primary-hover)",
                      color: "black",
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setShowToast(false)}
                    className="windows-btn windows-btn-secondary text-sm py-1 px-3"
                    style={{
                      background: "var(--card-secondary-bg)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Later
                  </button>
                </div>
              </div>
              <button onClick={() => setShowToast(false)} className="flex-shrink-0">
                <X className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-[var(--background-color)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;