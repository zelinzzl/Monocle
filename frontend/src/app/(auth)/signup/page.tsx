import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import Link from "next/link";
import { Icon } from "@/components/UI/icons/Icon";
import { SignupForm } from "@/components/Signup-Form/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="ArrowLeft" size="sm" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Get started with your free account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
