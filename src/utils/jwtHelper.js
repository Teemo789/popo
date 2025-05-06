export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getUserInfo = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
    email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
    name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
    role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
  };
};
