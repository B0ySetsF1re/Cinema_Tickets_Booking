module.exports = function(first_name, last_name, email, username, password, role = 'basic') {
  this.first_name = first_name;
  this.last_name = last_name;
  this.email = email;
  this.username = username;
  this.password = password;
  this.role = role;
}
