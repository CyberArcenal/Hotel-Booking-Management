<p align="center">
  <img src="build/icon.png" alt="HotelBookingManagement Logo" width="200"/>
</p>

# HotelBookingManagement

**Lite Hotel Booking Management System**  
Built with **Electron + React/TypeScript** and **TypeORM ORM**. Focused on simplicity, offline-first reservations, and basic room management for SMEs and local inns.

---

## ✨ Features
- **Room Management**
  - Add/edit/delete rooms
  - Price per night, capacity, amenities
  - Offline-first storage

- **Booking Flow**
  - Guest info + date range
  - Availability check (date overlap prevention)
  - Exportable booking slips (CSV/PDF)

- **UI/UX**
  - Clean dashboard
  - Room list, booking form, booking summary
  - Admin-only controls

---

## 🏗️ Architecture
- **Electron Backend**
  - IPC handler for room + booking modules
  - Local DB access (SQLite via TypeORM)

- **Frontend**
  - React + TypeScript
  - Lightweight, responsive UI

- **Database**
  - TypeORM entities for Room, Booking, Guest
  - Basic audit logging

---

## 🚀 Roadmap
1. Room module (CRUD)  
2. Booking engine (availability + reservations)  
3. Export reports (CSV/PDF)  
4. Lite release packaging  

---

## 📦 Installation
```bash
git clone https://github.com/CyberArcenal/Hotel-Booking-Management
cd Hotel-Booking-Management
npm install
npm run dev
```

## 📸 Screenshots
Here are sample displays of the system

![Screenshot 3](https://github.com/CyberArcenal/Hotel-Booking-Management/blob/main/screenshots/1.png?raw=true)
![Screenshot 2](https://github.com/CyberArcenal/Hotel-Booking-Management/blob/main/screenshots/2.png?raw=true)
![Screenshot 1](https://github.com/CyberArcenal/Hotel-Booking-Management/blob/main/screenshots/3.png?raw=true)

---

## 📂 System Structure
```
src/
  main/
    index.ts
    preload.ts
    ipc/
      room/
        index.ipc.ts
        create.ipc.ts
        update.ipc.ts
        delete.ipc.ts
        list.ipc.ts
      booking/
        index.ipc.ts
        create.ipc.ts
        update.ipc.ts
        cancel.ipc.ts
        list.ipc.ts
    db/
      database.ts
      datasource.ts
    config/
      env.ts

  renderer/
    App.tsx
    main.tsx
    api/
      room.ts
      booking.ts
    components/
      RoomList.tsx
      BookingForm.tsx
      BookingSummary.tsx
    pages/
      Room/
        Table/RoomTable.tsx
        Form/RoomForm.tsx
      Booking/
        Table/BookingTable.tsx
        View/BookingView.tsx
        Form/BookingForm.tsx
    hooks/
      useIPC.ts
      useRoom.ts
      useBooking.ts
    services/
      roomService.ts
      bookingService.ts
    styles/
      index.css

  entities/
    Room.ts
    Booking.ts
    Guest.ts
    AuditLog.ts

  migrations/
    2026XXXX-init-hotel-schema.ts

  utils/
    dateUtils.ts
    validation.ts

  middlewares/
    errorHandler.ts
```

---

## 🏷️ Tagline
> *“HotelBookingManagement: Simple offline reservations made easy.”*
```