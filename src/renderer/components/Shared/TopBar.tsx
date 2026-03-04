// src/renderer/components/Shared/TopBar.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Calendar,
  Bell,
  Hotel,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import type { DownloadProgress, UpdateInfo } from "../../api/updater";
import updaterAPI from "../../api/updater";
import { version, name } from "../../../../package.json"; // adjust path as needed
import { toTitleCase } from "./SideBar";
interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
    const title = toTitleCase(name);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // ----- Update state -----
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // ----- Check for updates on mount -----
  useEffect(() => {
    // Listen for update events
    const unsubAvailable = updaterAPI.onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
      setShowUpdateModal(true); // auto-show modal (optional)
    });

    const unsubProgress = updaterAPI.onDownloadProgress((progress) => {
      setDownloading(true);
      setDownloadProgress(progress);
    });

    const unsubDownloaded = updaterAPI.onUpdateDownloaded((info) => {
      setDownloading(false);
      // Ask user to install now
      if (window.confirm(`Update ${info.version} downloaded. Restart now?`)) {
        updaterAPI.quitAndInstall();
      }
    });

    const unsubError = updaterAPI.onError((err) => {
      console.error("Update error:", err);
      setDownloading(false);
    });

    // Initial check
    updaterAPI.checkForUpdates().catch(console.error);

    return () => {
      unsubAvailable();
      unsubProgress();
      unsubDownloaded();
      unsubError();
    };
  }, []);

  // ----- Download handler -----
  const handleDownload = () => {
    setShowUpdateModal(false);
    updaterAPI.downloadUpdate();
  };

  // ----- Search logic (unchanged) -----
  const allRoutes = useMemo(
    () => [
      { path: "/", name: "Dashboard", category: "Main" },
      { path: "/rooms", name: "Room List", category: "Rooms" },
      { path: "/bookings", name: "All Bookings", category: "Bookings" },
      { path: "/guests", name: "Guests", category: "Guests" },
      { path: "/reports/occupancy", name: "Occupancy Report", category: "Reports" },
      { path: "/reports/financial", name: "Financial Report", category: "Reports" },
      { path: "/reports/export", name: "Export", category: "Reports" },
      { path: "/settings/users", name: "User Management", category: "Settings" },
      { path: "/settings/audit", name: "Audit Trail", category: "Settings" },
      { path: "/settings/preferences", name: "Preferences", category: "Settings" },
    ],
    []
  );

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allRoutes.filter(
      (route) =>
        route.name.toLowerCase().includes(query) ||
        route.path.toLowerCase().includes(query.replace(/\s+/g, "-")) ||
        route.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allRoutes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredRoutes.length > 0) {
      navigate(filteredRoutes[0].path);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleRouteSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* ---------- LEFT SECTION (unchanged) ---------- */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            className="p-2 rounded-lg md:hidden transition-colors"
            style={{
              background: "rgba(212, 175, 55, 0.1)",
              border: "1px solid var(--border-color)",
              color: "var(--primary-color)",
            }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(212, 175, 55, 0.05)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Hotel className="w-5 h-5" style={{ color: "var(--primary-color)" }} />
            <div className="flex flex-col">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                HotelBooking Management
              </span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {formattedDate}
              </span>
            </div>
          </div>

          <div
            className="flex md:hidden items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(212, 175, 55, 0.05)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Calendar className="w-4 h-4" style={{ color: "var(--primary-color)" }} />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              {formattedDate}
            </span>
          </div>
        </div>

        {/* ---------- SEARCH (unchanged) ---------- */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                </div>
                <input
                  type="text"
                  placeholder="Search rooms, bookings, guests..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-colors"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background: "var(--border-color)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      ×
                    </div>
                  </button>
                )}
              </div>
            </form>

            {showSearchResults && filteredRoutes.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  className="p-3 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quick Navigation
                  </span>
                </div>
                <div className="max-h-80 overflow-auto">
                  {filteredRoutes.map((route, index) => (
                    <button
                      key={index}
                      onClick={() => handleRouteSelect(route.path)}
                      className="w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 text-sm flex justify-between items-center hover:bg-[var(--card-hover-bg)]"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span style={{ color: "var(--text-primary)" }}>{route.name}</span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: "var(--card-secondary-bg)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {route.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------- RIGHT SECTION (with update icons) ---------- */}
        <div className="flex items-center gap-3">
          {/* Update available indicator */}
          {updateAvailable && !downloading && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="relative p-2 rounded-lg transition-colors animate-pulse"
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid var(--primary-color)",
                color: "var(--primary-color)",
              }}
              title="Update available"
            >
              <Download className="w-5 h-5" />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--primary-color)] animate-ping"
              />
            </button>
          )}

          {/* Downloading progress indicator */}
          {downloading && (
            <button
              className="relative p-2 rounded-lg"
              style={{
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid var(--border-color)",
                color: "var(--primary-color)",
              }}
              disabled
            >
              <RefreshCw className="w-5 h-5 animate-spin" />
              {downloadProgress && (
                <span className="absolute -bottom-1 -right-1 text-xs bg-[var(--primary-color)] text-black rounded-full w-5 h-5 flex items-center justify-center">
                  {Math.round(downloadProgress.percent)}%
                </span>
              )}
            </button>
          )}

          {/* Notification bell (existing) */}
          {/* <button
            className="relative p-2 rounded-lg transition-colors"
            style={{
              background: "rgba(212, 175, 55, 0.1)",
              border: "1px solid var(--border-color)",
              color: "var(--primary-color)",
            }}
          >
            <Bell className="w-5 h-5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "var(--status-cancelled)" }}
            />
          </button> */}
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && updateInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowUpdateModal(false)}
          />
          {/* Modal content */}
          <div
            className="relative windows-modal p-6 max-w-md w-full mx-4 rounded-lg shadow-2xl"
            style={{ background: "var(--card-bg)", border: "2px solid var(--primary-color)" }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold" style={{ color: "var(--primary-color)" }}>
                🚀 Update Available
              </h3>
              <button onClick={() => setShowUpdateModal(false)}>
                <X className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
              </button>
            </div>

            <p className="mb-4" style={{ color: "var(--text-primary)" }}>
              Version <span className="font-bold">{updateInfo.version}</span> is ready to download.
            </p>

            {updateInfo.releaseNotes && (
              <div
                className="mb-4 p-3 rounded max-h-40 overflow-y-auto"
                style={{ background: "var(--card-secondary-bg)" }}
              >
                <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Release Notes:
                </h4>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                  {updateInfo.releaseNotes}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="windows-btn windows-btn-secondary"
                style={{
                  background: "var(--card-secondary-bg)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Later
              </button>
              <button
                onClick={handleDownload}
                className="windows-btn windows-btn-primary"
                style={{
                  background: "var(--primary-color)",
                  border: "1px solid var(--primary-hover)",
                  color: "black",
                }}
              >
                Download Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;