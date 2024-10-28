const x = require("hyperaxe");

const main = (opts) => {
  const { p } = x;
  const a = (href, txt) => x("a.btn.btn-danger.btn-block")({ href }, txt);
  const { user, isAuthenticated } = opts;
  const logout = a("/logout", "Log out");
  const login = a("/login", "Log in");
  return [p(`Welcome ${user}`), p(isAuthenticated ? logout : login)];
};

module.exports = main;
