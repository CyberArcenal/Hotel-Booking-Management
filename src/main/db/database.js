// src/main/db/database.js
//@ts-check
const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const BookingSubscriber = require("../../subscribers/Booking");
const GuestSubscriber = require("../../subscribers/Guest");
const RoomSubscriber = require("../../subscribers/Room");
const AuditLogSubscriber = require("../../subscribers/AuditLog");

const isElectronAvailable = typeof app !== "undefined" && app !== null;
const isDev =
  process.env.NODE_ENV === "development" ||
  !isElectronAvailable ||
  !app?.isPackaged;

function getDatabaseConfig() {
  let databasePath;
  let entitiesPath;
  let migrationsPath;

  if (isDev) {
    // Development mode (local project files)
    databasePath = path.resolve(process.cwd(), "app.db");
    entitiesPath = path.resolve(process.cwd(), "src/entities/*.js");
    migrationsPath = path.resolve(process.cwd(), "src/migrations/*.js");
    console.log(`[PayTrack][DB] Development DB path: ${databasePath}`);
  } else {
    // Production mode (packaged app)
    const userDataPath = app.getPath("userData");
    const dbDir = path.join(userDataPath, "data");

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    databasePath = path.join(dbDir, "app.db");

    const appPath = app.getAppPath();
    const isAsar = appPath.includes(".asar");

    if (isAsar) {
      // Use unpacked resources when packaged with asar
      const unpackedRoot = appPath.replace(".asar", ".asar.unpacked");
      const unpackedDir = path.dirname(unpackedRoot);
      entitiesPath = path.join(unpackedDir, "src/entities/*.js");
      migrationsPath = path.join(unpackedDir, "src/migrations/*.js");
    } else {
      // Not packaged
      entitiesPath = path.join(appPath, "src/entities/*.js");
      migrationsPath = path.join(appPath, "src/migrations/*.js");
    }

    console.log(`[PayTrack][DB] Production DB path: ${databasePath}`);
  }

  return {
    type: "sqlite",
    database: databasePath,
    synchronize: isDev, // enable in dev, disable in production
    logging: false,
    entities: [entitiesPath],
    migrations: [migrationsPath],
    subscribers: [
      BookingSubscriber, // ← class lang, wag new
      GuestSubscriber,
      RoomSubscriber,
      AuditLogSubscriber,
    ],
    cli: {
      entitiesDir: "src/entities",
      migrationsDir: "src/migrations",
    },
    // SQLite specific options
    enableWAL: true,
    busyErrorRetry: 100,
  };
}

module.exports = { getDatabaseConfig };
