// src/main/db/database.js
// @ts-check
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

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
    // Development mode
    databasePath = path.resolve(process.cwd(), "app.db");
    entitiesPath = path.resolve(process.cwd(), "src/entities/*.js");
    migrationsPath = path.resolve(process.cwd(), "src/migrations/*.js");
    console.log(`[PayTrack][DB] Development DB path: ${databasePath}`);
  } else {
    // Production mode
    const userDataPath = app.getPath("userData");
    const dbDir = path.join(userDataPath, "data");

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    databasePath = path.join(dbDir, "app.db");

    const appPath = app.getAppPath();
    const isAsar = appPath.includes(".asar");

    if (isAsar) {
      const unpackedRoot = appPath.replace(".asar", ".asar.unpacked");
      const unpackedDir = path.dirname(unpackedRoot);
      entitiesPath = path.join(unpackedDir, "src/entities/*.js");
      migrationsPath = path.join(unpackedDir, "src/migrations/*.js");
    } else {
      entitiesPath = path.join(appPath, "src/entities/*.js");
      migrationsPath = path.join(appPath, "src/migrations/*.js");
    }

    console.log(`[PayTrack][DB] Production DB path: ${databasePath}`);
  }

  return {
    type: "sqlite",
    database: databasePath,
    synchronize: isDev, // dev only
    logging: false,
    entities: [entitiesPath],
    migrations: [migrationsPath],
    cli: {
      entitiesDir: "src/entities",
      migrationsDir: "src/migrations",
    },
    // SQLite options
    enableWAL: true,
    busyErrorRetry: 100,
  };
}

module.exports = { getDatabaseConfig };
