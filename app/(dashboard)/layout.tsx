import { Sidebar } from "@/components/sidebar";
import { getConfig } from "@/lib/config";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getConfig();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar config={config} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
