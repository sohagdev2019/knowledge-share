import { getUserRole, getRoleBasedRedirect } from "@/lib/role-access";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccessDeniedPage() {
  const role = await getUserRole();
  
  // If not logged in, redirect to login
  if (!role) {
    redirect("/login");
  }
  
  const redirectUrl = await getRoleBasedRedirect();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {role === "admin" && (
            <>
              Admin accounts require a different subscription plan. 
              User pricing plans are not available for admin accounts.
            </>
          )}
          {role === "superadmin" && (
            <>
              Super Admin accounts do not require subscriptions. 
              This page is not accessible for Super Admin users.
            </>
          )}
          {role === "user" && (
            <>
              You don&apos;t have permission to access this page.
            </>
          )}
        </p>
        
        <div className="space-y-3">
          <Link
            href={redirectUrl}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

