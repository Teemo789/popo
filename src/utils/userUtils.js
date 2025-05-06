export const getUserIdFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.nameid || null;
  } catch {
    return null;
  }
};
