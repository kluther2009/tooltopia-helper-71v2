import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-card relative overflow-x-hidden">
        <AppSidebar />
        <main className="flex-1 p-2 sm:p-6 animate-fade-in max-w-full overflow-x-hidden">
          {children}
          <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 text-xs sm:text-sm text-card-foreground/70">
            Developed by K.Luther
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}