// src/utils/migrationManager.js
//@ts-check
class MigrationManager {
  /**
   * @param {import("typeorm").DataSource} dataSource
   */
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Simple migration status
   */
  async getMigrationStatus() {
    try {
      // Check if migrations table exists
      const tableExists = await this.dataSource.query("SELECT 1 FROM migrations LIMIT 1")
        .then(() => true)
        .catch(() => false);

      if (!tableExists) {
        return { needsMigration: true, pending: 0, executed: 0 };
      }

      const pending = await this.dataSource.showMigrations();
      const executedCount = await this.dataSource.query("SELECT COUNT(*) as count FROM migrations")
        .then(rows => rows[0].count)
        .catch(() => 0);

      return {
        // @ts-ignore
        needsMigration: pending.length > 0,
        // @ts-ignore
        pending: pending.length,
        executed: executedCount,
      };
    } catch (err) {
      console.warn("Migration status check failed:", err);
      return { needsMigration: true, pending: 0, executed: 0 };
    }
  }

  /**
   * **SIMPLE MIGRATION ONLY** — no backup, no restore
   */
  async runMigrations() {
    try {
      console.log("🚀 Running migrations...");

      const result = await this.dataSource.runMigrations({
        transaction: "all", // lahat sa isang transaction para safe
      });

      console.log(`✅ Migration complete! Applied ${result.length} migration(s)`);
      return {
        success: true,
        applied: result.length,
        message: "Database updated successfully"
      };
    } catch (error) {
      // @ts-ignore
      console.error("❌ Migration failed:", error.message);

      // === LIGHT REPAIR: "table already exists" case ===
      // @ts-ignore
      if (error.message.includes("already exists")) {
        console.log("🔧 Detected 'already exists' error. Marking migration as done...");

        try {
          // Kunin yung latest pending migration
          const pending = await this.dataSource.showMigrations();
          // @ts-ignore
          if (pending.length > 0) {
            // @ts-ignore
            const lastPending = pending[pending.length - 1];

            // Manually insert sa migrations table para hindi na ulit
            await this.dataSource.query(`
              INSERT INTO migrations (timestamp, name)
              VALUES (${Date.now()}, '${lastPending.name}')
            `);

            console.log(`✅ Marked "${lastPending.name}" as executed.`);
          }

          return {
            success: true,
            repaired: true,
            message: "Schema already exists. Migration marked as complete."
          };
        } catch (repairErr) {
          console.error("Repair failed:", repairErr);
        }
      }

      return {
        success: false,
        // @ts-ignore
        error: error.message,
        message: "Migration failed. Check console/logs."
      };
    }
  }
}

module.exports = MigrationManager;


// // src/utils/migrationManager.js
// //@ts-check
// class MigrationManager {
//   /**
//    * @param {import("typeorm").DataSource} dataSource
//    */
//   constructor(dataSource) {
//     this.dataSource = dataSource;
//   }
  
//   /**
//    * Get migration status
//    * @returns {Promise<Object>} Migration status information
//    */
//   async getMigrationStatus() {
//     try {
//       let executedMigrations = [];
//       let pendingMigrations = false;
//       let lastMigration = null;
      
//       try {
//         // Try to query migrations table
//         executedMigrations = await this.dataSource.query(
//           "SELECT * FROM migrations ORDER BY id DESC"
//         );
        
//         // Check for pending migrations
//         pendingMigrations = await this.dataSource.showMigrations();
        
//         lastMigration = executedMigrations[0] || null;
//       } catch (error) {
//         // If migrations table doesn't exist yet, all migrations are pending
//         // @ts-ignore
//         if (error.message.includes('no such table') || 
//             // @ts-ignore
//             error.message.includes('migrations') ||
//             // @ts-ignore
//             error.message.includes('no such table: migrations')) {
//           pendingMigrations = true;
//           console.log('Migrations table does not exist yet');
//         } else {
//           console.error('Error checking migration status:', error);
//           // Assume migration is needed on other errors
//           pendingMigrations = true;
//         }
//       }
      
//       return {
//         executedMigrations: executedMigrations,
//         pendingMigrations: pendingMigrations,
//         lastMigration: lastMigration,
//         totalExecuted: executedMigrations.length,
//         needsMigration: pendingMigrations || executedMigrations.length === 0
//       };
//     } catch (error) {
//       console.error('Failed to get migration status:', error);
//       return {
//         executedMigrations: [],
//         pendingMigrations: false,
//         lastMigration: null,
//         totalExecuted: 0,
//         needsMigration: false,
//         // @ts-ignore
//         error: error.message
//       };
//     }
//   }
  
//   /**
//    * Run migrations with backup (temporarily simplified)
//    * @returns {Promise<Object>} Migration result
//    */
//   async runMigrationsWithBackup() {
//     try {
//       console.log('Running migrations (backup temporarily disabled)...');
      
//       // Run migrations directly
//       const migrations = await this.dataSource.runMigrations();
      
//       return {
//         success: true,
//         migrationsApplied: migrations.length,
//         migrations: migrations.map((/** @type {{ name: any; }} */ m) => m.name),
//         backupCreated: false,
//         message: 'Migrations applied successfully'
//       };
//     } catch (error) {
//       console.error('Migration failed:', error);
      
//       return {
//         success: false,
//         // @ts-ignore
//         error: error.message,
//         restoredFromBackup: false,
//         message: 'Migration failed'
//       };
//     }
//   }
  
//   // Stub methods for compatibility
//   async backupDatabase() {
//     console.log('Backup functionality temporarily disabled');
//     return null;
//   }
  
//   async restoreFromLatestBackup() {
//     console.log('Restore functionality temporarily disabled');
//     return false;
//   }
  
//   /**
//    * @param {any} backupName
//    */
//   // @ts-ignore
//   async restoreFromBackup(backupName) {
//     console.log('Restore functionality temporarily disabled');
//     return false;
//   }
  
//   async listBackups() {
//     return [];
//   }
  
//   async hasBackups() {
//     return false;
//   }
  
//   // @ts-ignore
//   async cleanupOldBackups(keepCount = 5) {
//     return {
//       success: true,
//       kept: 0,
//       deleted: 0,
//       message: 'Backup cleanup not available'
//     };
//   }
  
//   /**
//    * Get database information
//    * @returns {Promise<Object>} Database info
//    */
//   async getDatabaseInfo() {
//     try {
//       const dbPath = this.dataSource.options.database;
      
//       let tables = [];
      
//       // Get list of tables
//       try {
//         const tableResult = await this.dataSource.query(
//           "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
//         );
//         tables = tableResult.map((/** @type {{ name: any; }} */ row) => row.name);
//       } catch (error) {
//         console.warn('Could not get table list:', error);
//       }
      
//       return {
//         path: dbPath,
//         tables: tables,
//         tableCount: tables.length
//       };
//     } catch (error) {
//       console.error('Failed to get database info:', error);
//       return {
//         path: this.dataSource.options.database,
//         tables: [],
//         // @ts-ignore
//         error: error.message
//       };
//     }
//   }
// }

// module.exports = MigrationManager;