import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import {
  getClerkSignInUrl,
  getClerkSignUpUrl,
  getPublicAuthRoutePatterns,
} from "./lib/auth-routes";

const signInUrl = getClerkSignInUrl();
const signUpUrl = getClerkSignUpUrl();

const isPublicRoute = createRouteMatcher(getPublicAuthRoutePatterns());

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    signInUrl,
    signUpUrl,
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
