function auth(req, _res, next) {
  // In a real application, userId would come from an authentication system
  // (e.g., JWT, session, API key).
  // For now, we'll hardcode a userId to simulate an authenticated user,
  // or create a session-based guest ID for unauthenticated users.

  // Placeholder: Always assume userId 1 for simplicity in this demo.
  // A real guest cart would use a unique, persistent ID stored client-side.
  req.userId = 1;
  next();
}

module.exports = auth;
