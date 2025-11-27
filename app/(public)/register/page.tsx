import Link from "next/link";
import RegistrationForm from "./_components/RegistrationForm";

export default function StudentRegistrationPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto w-full max-w-md px-4 py-4 lg:px-0">
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-xl font-semibold">Create your account</h2>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}

