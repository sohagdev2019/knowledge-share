import Link from "next/link";
import RegistrationForm from "./_components/RegistrationForm";

export default function StudentRegistrationPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-4xl">
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between w-full mb-2">
            <h2 className="text-xl font-semibold">Create your account</h2>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline"
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

