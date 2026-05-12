import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  getClerkSignInUrl,
  getClerkSignUpPath,
} from "@/lib/auth-routes";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp
        routing="path"
        path={getClerkSignUpPath()}
        signInUrl={getClerkSignInUrl()}
        fallbackRedirectUrl="/editor"
      />
    </AuthPageShell>
  );
}
