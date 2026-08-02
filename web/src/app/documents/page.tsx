import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";
import { getDocuments } from "@/app/actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const documents = await getDocuments();

  return <DocumentsClient initialDocuments={documents} session={session} />;
}
