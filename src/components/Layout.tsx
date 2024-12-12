import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { HelpButton } from "./HelpButton";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-[100dvh] flex w-full bg-card">
        <AppSidebar />
        <main className="flex-1 relative overflow-y-auto">
          <div className="p-2 sm:p-6 pb-16 animate-fade-in">
            {children}
          </div>
          <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 text-xs sm:text-sm text-card-foreground/70">
            Developed by K.Luther
          </div>
          <HelpButton />
        </main>
      </div>
    </SidebarProvider>
  );
}