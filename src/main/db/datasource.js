// src/main/db/datasource.js
// @ts-check
const { DataSource } = require("typeorm");
const { getDatabaseConfig } = require("./database");

// Entities
const { AuditLog } = require("../../entities/AuditLog");
const { Booking } = require("../../entities/Booking");
const { Guest } = require("../../entities/Guest");
const { Room } = require("../../entities/Room");
const { SystemSetting } = require("../../entities/systemSettings");
const NotificationLog = require("../../entities/NotificationLog");

const config = getDatabaseConfig();

const entities = [
  AuditLog,
  Booking,
  Guest,
  Room,
  SystemSetting,
  NotificationLog,
];

const dataSourceOptions = {
  ...config,
  entities,
  migrations: Array.isArray(config.migrations)
    ? config.migrations
    : [config.migrations],
};

// @ts-ignore
const AppDataSource = new DataSource(dataSourceOptions);

module.exports = { AppDataSource };
