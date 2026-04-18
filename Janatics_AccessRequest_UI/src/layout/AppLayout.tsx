import { SidebarProvider } from "@/shared/components/ui/sidebar"
import { MainHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <MainHeader />
        <main className="flex-1 h-screen p-8">{children}</main>
      </div>
    </SidebarProvider>
  )
}
