import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  getClerkSignInPath,
  getClerkSignUpUrl,
} from "@/lib/auth-routes";

export default function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn
        routing="path"
        path={getClerkSignInPath()}
        signUpUrl={getClerkSignUpUrl()}
        fallbackRedirectUrl="/editor"
      />
    </AuthPageShell>
  );
}
