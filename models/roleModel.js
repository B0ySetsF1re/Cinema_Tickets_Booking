/*let roles = {
  admin: {
    can: ['create_roles', 'manage_users'],
    inherits: ['manager']
  },
  manager: {
    can: ['manage_orders', 'manage_archive', 'comment']
  },
  basic: {
    can: ['comment', {
      name: 'edit',
      when: function (params) {
        return params.user.id === params.comment.owner;
      }
    }]
  }
}*/

let roles = {
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

module.exports = roles;
