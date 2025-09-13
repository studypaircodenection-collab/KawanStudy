import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatPopup from "@/components/chat/chat-popup";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="[--header-height:calc(--spacing(14))] w-full">
      <SidebarProvider className="flex flex-col w-full">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="p-4">{children}</SidebarInset>
          <ChatPopup />
        </div>
      </SidebarProvider>
    </div>
  );
};

export default layout;
