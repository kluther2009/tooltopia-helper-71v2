import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-in">
          {children}
          <div className="fixed bottom-4 right-4 text-sm text-muted-foreground">
            Developed by K.Luther
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}