class RBAC {
  constructor(roles) {
    // Check if object was instentiated with the constructor's object variable type
    if(typeof roles !== 'object') {
      throw new TypeError('Exprected an object as input');
    }
    this.roles = roles; // Initialising roles property
  }

  can(role, operation) {
    // Check if role exists
    if(!this.roles[role]) {
      return false;
    }

    let $role = this.roles[role];
    // Check if this role has access
    if($role.can.indexOf(operation) !== -1) {
      return true;
    }

    //Check if there are any parents
    if(!$role.inherits || $role.inherits.length < 1) {
       return false;
    }

    // Check child rols until one returns true or all return false
    return $role.inherits.some(childRole => this.can(childRole, operation));
  }
}

module.exports = RBAC;
