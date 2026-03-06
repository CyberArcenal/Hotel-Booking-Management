// src/hooks/useUpdater.ts
import { useState, useEffect, useCallback } from 'react';
import updaterAPI, { type DownloadProgress, type UpdateInfo } from '../api/updater';

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error';

export function useUpdater() {
  const [state, setState] = useState<UpdateState>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Listen to updater events
  useEffect(() => {
    const unsubChecking = updaterAPI.onChecking(() => {
      setState('checking');
      setError(null);
    });

    const unsubAvailable = updaterAPI.onUpdateAvailable((info) => {
      setState('available');
      setUpdateInfo(info);
      setError(null);
    });

    const unsubNotAvailable = updaterAPI.onUpdateNotAvailable(() => {
      setState('idle');
      setUpdateInfo(null);
    });

    const unsubProgress = updaterAPI.onDownloadProgress((p) => {
      setState('downloading');
      setProgress(p);
    });

    const unsubDownloaded = updaterAPI.onUpdateDownloaded((info) => {
      setState('downloaded');
      setUpdateInfo(info);
      setProgress(null);
    });

    const unsubError = updaterAPI.onError((msg) => {
      setState('error');
      setError(msg);
      setProgress(null);
    });

    // Initial check
    updaterAPI.checkForUpdates().catch(console.error);

    return () => {
      unsubChecking();
      unsubAvailable();
      unsubNotAvailable();
      unsubProgress();
      unsubDownloaded();
      unsubError();
    };
  }, []);

  const downloadUpdate = useCallback(async () => {
    try {
      setError(null);
      await updaterAPI.downloadUpdate();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const installUpdate = useCallback(() => {
    updaterAPI.quitAndInstall();
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      setError(null);
      await updaterAPI.checkForUpdates();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return {
    state,
    updateInfo,
    progress,
    error,
    downloadUpdate,
    installUpdate,
    checkForUpdates,
  };
}