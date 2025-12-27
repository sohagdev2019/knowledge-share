import { checkCourseLimit } from "@/lib/teacher-plan-limits";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export async function CreateCourseButton() {
  const courseLimit = await checkCourseLimit();

  // If at limit, show disabled button with tooltip
  if (courseLimit.isAtLimit && courseLimit.limit !== null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Course limit reached. Upgrade your plan to create more courses.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Normal button
  return (
    <Link className={buttonVariants()} href="/admin/courses/create">
      Create Course
    </Link>
  );
}

