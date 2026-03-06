// src/components/Shared/UpdateNotifier.tsx
import React, { useState } from "react";
import { Download, RefreshCw, X, AlertCircle } from "lucide-react";
import { useUpdater } from "../../hooks/useUpdater";
import { showApiError } from "../../utils/notification";

const UpdateNotifier: React.FC = () => {
  const { state, updateInfo, progress, error, downloadUpdate, installUpdate } =
    useUpdater();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // Only show button if an update is available, downloading, or downloaded
  if (
    state !== "available" &&
    state !== "downloading" &&
    state !== "downloaded"
  ) {
    return null;
  }
  const handleDownload = async () => {
    setLoading(true);
    try {
      downloadUpdate();
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };
  const getIcon = () => {
    switch (state) {
      case "downloading":
        return <RefreshCw className="w-5 h-5 animate-spin" />;
      default:
        return <Download className="w-5 h-5" />;
    }
  };

  const getBadge = () => {
    if (state === "available") {
      return (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
          !
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative p-2 rounded-lg transition-colors"
        style={{
          background: "rgba(212, 175, 55, 0.1)",
          border: "1px solid var(--border-color)",
          color: "var(--primary-color)",
        }}
        aria-label="Update available"
      >
        {getIcon()}
        {getBadge()}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Modal content */}
          <div
            className="relative windows-modal p-6 max-w-md w-full mx-4 rounded-lg shadow-2xl"
            style={{
              background: "var(--card-bg)",
              border: "2px solid var(--primary-color)",
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3
                className="text-xl font-bold"
                style={{ color: "var(--primary-color)" }}
              >
                🚀 Update Available
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X
                  className="w-5 h-5"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {updateInfo && (
              <div className="mb-4">
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Version {updateInfo.version}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Released:{" "}
                  {new Date(updateInfo.releaseDate).toLocaleDateString()}
                </p>
                {updateInfo.releaseNotes && (
                  <div
                    className="mt-2 p-3 rounded max-h-40 overflow-y-auto"
                    style={{ background: "var(--card-secondary-bg)" }}
                  >
                    <h4
                      className="font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      What's new:
                    </h4>
                    <pre
                      className="text-xs whitespace-pre-wrap"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {updateInfo.releaseNotes}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {progress && state === "downloading" && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--text-primary)" }}>
                    Downloading...
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {Math.round(progress.percent)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${progress.percent}%`,
                      background: "var(--primary-color)",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              {state === "available" && (
                <button
                  onClick={() => {
                    handleDownload();
                    // Keep modal open to show progress
                  }}
                  disabled={loading}
                  className={`windows-btn windows-btn-primary text-sm py-1 px-3 ${loading ? "opacity-75" : ""}`}
                >
                  {loading ? `Downloading...` : `Download Update`}
                </button>
              )}
              {state === "downloaded" && (
                <button
                  onClick={installUpdate}
                  className="windows-btn windows-btn-primary text-sm py-1 px-3"
                  style={{
                    background: "var(--primary-color)",
                    border: "1px solid var(--primary-hover)",
                    color: "black",
                  }}
                >
                  Install & Restart
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
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
        </div>
      )}
    </>
  );
};

export default UpdateNotifier;
