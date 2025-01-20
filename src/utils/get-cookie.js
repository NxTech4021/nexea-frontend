export function getCookie() {
  let cartSession;
  if (document?.cookie?.match(/cartSession=([^;]+)/)) {
    cartSession = document?.cookie?.match(/cartSession=([^;]+)/)[1];
  }

  return cartSession;
}

// Example usage:
