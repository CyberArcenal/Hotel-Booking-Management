
const auditLogger = require('./auditLogger');

/**
 * Middleware/decorator pattern for automatic audit logging
 */
function withAudit(action, entity, getEntityId = (result) => result?.id) {
  return function(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const user = this.user || args[0]?.user || 'system';
      let oldData = null;
      let result = null;
      
      try {
        // For UPDATE actions, get old data first
        if (action === 'UPDATE' && args[0]?.id) {
          const repository = this.repository || this.getRepository?.();
          if (repository) {
            const existing = await repository.findOne({ where: { id: args[0].id } });
            oldData = existing;
          }
        }
        
        // Execute original method
        result = await originalMethod.apply(this, args);
        
        // Log the action
        const entityId = getEntityId(result) || args[0]?.id;
        
        if (entityId) {
          const newData = action === 'DELETE' ? null : result;
          
          auditLogger.log({
            action,
            entity,
            entityId,
            oldData: action === 'UPDATE' ? oldData : null,
            newData: action !== 'DELETE' ? newData : null,
            user
          });
        }
        
        return result;
      } catch (error) {
        console.error(`Audit logging failed for ${action} on ${entity}:`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Simple audit logging helper for services
 */
const AuditHelper = {
  /**
   * Wrap service methods with audit logging
   */
  wrapService(service, entityName) {
    const wrapped = { ...service };
    
    if (service.create) {
      const originalCreate = service.create.bind(service);
      wrapped.create = async function(data, user = 'system') {
        const result = await originalCreate(data);
        await auditLogger.logCreate(entityName, result.id, result, user);
        return result;
      };
    }
    
    if (service.update) {
      const originalUpdate = service.update.bind(service);
      wrapped.update = async function(id, data, user = 'system') {
        const oldData = await service.findById?.(id);
        const result = await originalUpdate(id, data);
        await auditLogger.logUpdate(entityName, id, oldData, result, user);
        return result;
      };
    }
    
    if (service.delete) {
      const originalDelete = service.delete.bind(service);
      wrapped.delete = async function(id, user = 'system') {
        const oldData = await service.findById?.(id);
        const result = await originalDelete(id);
        await auditLogger.logDelete(entityName, id, oldData, user);
        return result;
      };
    }
    
    return wrapped;
  }
};

module.exports = { withAudit, AuditHelper, auditLogger };