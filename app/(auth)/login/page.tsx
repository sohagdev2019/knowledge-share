import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/LoginForm";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    return redirect("/");
  }
  return <LoginForm />;
}
