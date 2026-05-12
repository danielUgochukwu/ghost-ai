const defaultSignInUrl = "/sign-in";
const defaultSignUpUrl = "/sign-up";

function normalizePath(url: string) {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function withNestedSegments(path: string) {
  return path === "/" ? "/" : `${path}(.*)`;
}

export function getClerkSignInUrl() {
  return process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || defaultSignInUrl;
}

export function getClerkSignUpUrl() {
  return process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || defaultSignUpUrl;
}

export function getClerkSignInPath() {
  return normalizePath(getClerkSignInUrl());
}

export function getClerkSignUpPath() {
  return normalizePath(getClerkSignUpUrl());
}

export function getPublicAuthRoutePatterns() {
  return [
    withNestedSegments(getClerkSignInPath()),
    withNestedSegments(getClerkSignUpPath()),
  ];
}
