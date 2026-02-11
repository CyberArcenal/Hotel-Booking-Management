src/renderer/pages/Settings/
├── index.tsx                 # imports all and renders layout
├── components/
│   ├── SettingsHeader.tsx   # title + action buttons (export, import, reset, save)
│   ├── SystemInfoCard.tsx   # system information display
│   ├── SettingsTabs.tsx     # tab navigation
│   ├── GeneralTab.tsx       # general settings form
│   ├── BookingTab.tsx       # booking settings form
│   ├── RoomTab.tsx          # room settings form + JSON editors
│   ├── NotificationTab.tsx  # notification settings form
│   └── SystemTab.tsx        # system settings form
└── hooks/
    └── useSettings.ts       # all data fetching & state management