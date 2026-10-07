import { auth } from "@clerk/nextjs/server";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundColor: "#ffffff",
        color: "rgb(26, 11, 84)",
        fontFamily: "'Mazzard H', sans-serif",
      }}
    >
      <DashboardNavbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}