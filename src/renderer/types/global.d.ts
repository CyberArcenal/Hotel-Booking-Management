export {};

declare global {
  interface Window {
    backendAPI: {
      // 📦 Core CRUD APIs
      notification: (payload: any) => Promise<any>;
      auditlog: (payload: any) => Promise<any>;
      booking: (payload: any) => Promise<any>;
      room: (payload: any) => Promise<any>;
      guest: (payload: any) => Promise<any>;
      dashboard: (payload: any) => Promise<any>;

      // ⚙️ System Config
      systemConfig: (payload: { method: string; params?: any }) => Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;

      // 🪟 Window controls (invoke)
      windowControl?: (payload: {
        method: string;
        params?: Record<string, any>;
      }) => Promise<{
        status: boolean;
        message: string;
        data?: any;
      }>;

      // 🆕 Updater API (invoke)
      updater: (payload: { method: string; params?: any }) => Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;

      // 🎧 Generic event listener (returns cleanup function)
      on: (channel: string, callback: (event: any, ...args: any[]) => void) => () => void;

      // 🪟 Specific window event listeners (legacy, but kept for compatibility)
      onWindowMaximized?: (callback: () => void) => void;
      onWindowRestored?: (callback: () => void) => void;
      onWindowMinimized?: (callback: () => void) => void;
      onWindowClosed?: (callback: () => void) => void;
      onWindowResized?: (callback: (bounds: any) => void) => void;
      onWindowMoved?: (callback: (position: any) => void) => void;

      // Other utilities
      showAbout: () => Promise<any>;
      skipSetup: () => Promise<any>;
      onSetupComplete: (payload: any) => Promise<any>;
      getSetupStatus: () => Promise<any>;

      // 🛠️ Logging
      log: {
        info: (message: string, data?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, warning?: any) => void;
      };
    };
  }
}