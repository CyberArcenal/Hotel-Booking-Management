# Changelog
All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [v1.0.2-beta] - 2026-02-14
### Fixed
- Adjusted availability filter logic to properly exclude rooms with active bookings on the current date.
- Implemented `NOT EXISTS` / `IS NULL` handling to ensure rooms without bookings are correctly flagged as available.
- Resolved issue where unavailable rooms were incorrectly returned when `availableOnly` filter was applied.
- Improved current date handling (`new Date().toISOString().split("T")[0]`) for consistent SQLite date comparisons.

### Changed
- Consolidated availability, booking date, and status checks into a single cohesive condition block for audit clarity.
- Enhanced query readability and maintainability by aligning aliases and conditions with entity schema definitions.

### Added (UI)
- Error display in booking form when a room is unavailable.
- Disabled **Save** button in booking form if the selected room cannot be booked, preventing invalid submissions.
- Red border highlight on the Room Page for rooms that are not available today, giving users a clear visual indicator.

---

---

<<<<<<< Updated upstream
=======
## [v1.0.2-beta] - 2026-02-14
### Fixed
- Adjusted availability filter logic to properly exclude rooms with active bookings on the current date.
- Implemented `NOT EXISTS` / `IS NULL` handling to ensure rooms without bookings are correctly flagged as available.
- Resolved issue where unavailable rooms were incorrectly returned when `availableOnly` filter was applied.
- Improved current date handling (`new Date().toISOString().split("T")[0]`) for consistent SQLite date comparisons.

### Changed
- Consolidated availability, booking date, and status checks into a single cohesive condition block for audit clarity.
- Enhanced query readability and maintainability by aligning aliases and conditions with entity schema definitions.

### Added (UI)
- Error display in booking form when a room is unavailable.
- Disabled **Save** button in booking form if the selected room cannot be booked, preventing invalid submissions.
- Red border highlight on the Room Page for rooms that are not available today, giving users a clear visual indicator.

---

>>>>>>> Stashed changes
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
