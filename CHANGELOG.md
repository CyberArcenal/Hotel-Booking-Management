# Changelog
All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [v1.0.0-beta] - 2026-02-14
### Added
- Initial **Lite Release** build (.exe for Windows).
- Room Management (CRUD: add, edit, delete).
- Booking Flow (guest info, date range, availability check).
- Exportable booking slips (CSV/PDF).
- Audit Logging for room and booking changes.
- Email & SMS alerts (configurable via Settings → Preferences).
- Retry mechanism with resend count tracking.

### Changed
- Refined UI dashboard for rooms and bookings.
- Improved error handling with centralized middleware.

### Known Issues
- Packaging available only for Windows (.exe).
- Some reporting features are basic; advanced exports planned for next release.

---

## [Unreleased]
### Planned
- v1.1.0: Enhanced reporting (daily/weekly summaries).
- v1.2.0: Packaging for Linux/macOS.
- v1.3.0: Cloud sync option (hybrid offline/online).
