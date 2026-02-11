src/main/ipc/
├── room/
│   ├── index.ipc.js               (main handler)
│   ├── create.ipc.js
│   ├── update.ipc.js
│   ├── delete.ipc.js
│   ├── set_availability.ipc.js
│   ├── search.ipc.js
│   ├── get/
│   │   ├── all.ipc.js
│   │   ├── by_id.ipc.js
│   │   ├── by_number.ipc.js
│   │   ├── available.ipc.js
│   │   ├── summary.ipc.js
│   │   ├── active.ipc.js
│   │   └── stats.ipc.js
│   ├── get_occupancy.ipc.js
│   ├── get_type_distribution.ipc.js
│   ├── bulk_create.ipc.js
│   ├── bulk_update.ipc.js
│   ├── import_csv.ipc.js
│   └── export_csv.ipc.js
├── booking/
│   ├── index.ipc.js               (main handler)
│   ├── create.ipc.js
│   ├── update.ipc.js
│   ├── delete.ipc.js
│   ├── cancel.ipc.js
│   ├── check_in.ipc.js
│   ├── check_out.ipc.js
│   ├── search.ipc.js
│   ├── get/
│   │   ├── all.ipc.js
│   │   ├── by_id.ipc.js
│   │   ├── by_guest.ipc.js
│   │   ├── by_room.ipc.js
│   │   ├── by_date.ipc.js
│   │   ├── summary.ipc.js
│   │   ├── active.ipc.js
│   │   └── stats.ipc.js
│   ├── get_revenue.ipc.js
│   ├── get_occupancy_rates.ipc.js
│   ├── bulk_create.ipc.js
│   ├── bulk_update.ipc.js
│   ├── import_csv.ipc.js
│   ├── export_csv.ipc.js
│   ├── generate_invoice.ipc.js
│   └── generate_report.ipc.js
└── guest/
    ├── index.ipc.js               (main handler)
    ├── create.ipc.js
    ├── update.ipc.js
    ├── delete.ipc.js
    ├── merge_profiles.ipc.js
    ├── search.ipc.js
    ├── get/
    │   ├── all.ipc.js
    │   ├── by_id.ipc.js
    │   ├── by_email.ipc.js
    │   ├── by_phone.ipc.js
    │   ├── summary.ipc.js
    │   ├── active.ipc.js
    │   ├── stats.ipc.js
    │   └── bookings.ipc.js
    ├── get_loyalty.ipc.js
    ├── get_frequency.ipc.js
    ├── bulk_create.ipc.js
    ├── bulk_update.ipc.js
    ├── import_csv.ipc.js
    └── export_csv.ipc.js