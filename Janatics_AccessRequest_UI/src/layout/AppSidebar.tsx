"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { ArrowUpRight } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      {/* 1. BRANDING: BOLD & TYPE-DRIVEN */}
      <SidebarHeader className="flex h-12 flex-row items-center justify-between border-b px-6">
        <span className="text-sm font-black tracking-[0.2em] uppercase">
          Janatics
        </span>
      </SidebarHeader>

      <SidebarContent className="gap-8 px-4 py-2">
        {/* 3. NAVIGATION: HIGH CONTRAST */}
        <SidebarGroup>
          <SidebarMenu className="gap-0.5">
            {[
              { label: "Requests", active: true },
              { label: "Approvals", active: false },
              { label: "Directory", active: false },
              { label: "Analytics", active: false },
            ].map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  className={`h-11 rounded-none px-4 transition-all duration-200 ${
                    item.active
                      ? "bg-black font-medium text-white"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-black"
                  }`}
                >
                  <span className="text-xs tracking-widest uppercase">
                    {item.label}
                  </span>
                  {item.active && <ArrowUpRight className="ml-auto size-3" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* 4. ACTIONS: OUTLINED */}
      </SidebarContent>

      {/* 5. FOOTER: SYSTEM SPECS */}
      <SidebarFooter className="p-6"></SidebarFooter>
    </Sidebar>
  )
}
