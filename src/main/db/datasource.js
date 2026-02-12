// datasource.js placeholder
// src/main/db/datasource.js
//@ts-check
const fs = require("fs");
const path = require("path");
const { DataSource } = require("typeorm");
const { getDatabaseConfig } = require("./database");
const { AuditLog } = require("../../entities/AuditLog");
const { Booking } = require("../../entities/Booking");
const { Guest } = require("../../entities/Guest");
const { Room } = require("../../entities/Room");
const { SystemSetting } = require("../../entities/systemSettings");
const NotificationLog = require("../../entities/NotificationLog");

// Import EntitySchema constants

const config = getDatabaseConfig();

const entities = [
    AuditLog,
    Booking,
    Guest,
    Room,
    SystemSetting,
    NotificationLog
];

/**
 * Normalize subscribers:
 * - If database.js returned glob strings, keep them (TypeORM can accept globs).
 * - If database.js returned file paths (absolute), require them and pass classes/constructors.
 * @param {string[]} subscribersConfig
 */
function resolveSubscribers(subscribersConfig) {
  if (!subscribersConfig) return [];

  const resolved = [];

  for (const item of subscribersConfig) {
    if (typeof item === "string") {
      // Glob pattern (e.g. *.js)
      if (item.includes("*") || item.includes("?")) {
        resolved.push(item);
        continue;
      }

      // String path → require it
      try {
        const mod = require(item);
        if (mod.default) {
          resolved.push(mod.default);
        } else if (typeof mod === "function") {
          resolved.push(mod);
        } else {
          // { ClassName: class } pattern
          const cls = Object.values(mod).find(v => typeof v === "function");
          if (cls) resolved.push(cls);
        }
      } catch (err) {
        // @ts-ignore
        console.error("[PayTrack][DataSource] Failed to load subscriber:", item, err.message);
      }
    } 
    // Already a class or object
    else if (typeof item === "function" || (typeof item === "object" && item !== null)) {
      resolved.push(item);
    }
  }

  return resolved;
}

// @ts-ignore
const subscribers = resolveSubscribers(config.subscribers);
console.log("=== REGISTERED SUBSCRIBERS ===");
subscribers.forEach((sub) => {
  const name =
    sub.name || (sub.constructor && sub.constructor.name) || "Unknown";
  console.log(`→ ${name} LOADED`);
});
const dataSourceOptions = {
  ...config,
  entities,
  subscribers: subscribers,
  migrations: Array.isArray(config.migrations) ? config.migrations : [config.migrations]
};

// @ts-ignore
const AppDataSource = new DataSource(dataSourceOptions);

module.exports = { AppDataSource };
