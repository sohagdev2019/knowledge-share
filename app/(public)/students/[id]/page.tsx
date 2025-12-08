import { StudentDetailsClient } from "./_components/StudentDetailsClient";

type Params = Promise<{ id: string }>;

export default async function StudentDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  return <StudentDetailsClient studentId={id} />;
}
