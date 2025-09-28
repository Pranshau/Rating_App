const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

function validateName(name) {
  if (typeof name !== 'string') return false;
  return name.trim().length >= 4 && name.trim().length <= 60;
}

function validateAddress(address) {
  if (address == null) return true;
  return typeof address === 'string' && address.length <= 400;
}

function validateEmail(email) {
  return typeof email === 'string' && emailRegex.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && passwordRegex.test(password);
}

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword
};
