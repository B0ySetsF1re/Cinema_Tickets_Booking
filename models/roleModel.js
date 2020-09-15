module.exports = {
  admin: {
    can: ['create_roles', 'manage_users'],
    inherits: ['manager']
  },
  manager: {
    can: ['manage_orders', 'manage_archive'],
    inherits: ['basic']
  },
  basic: {
    can: ['comment']
  }
}
