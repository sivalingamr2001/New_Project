"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Bell, Mail, PanelLeft, PanelLeftClose } from "lucide-react"
import type { ReactNode } from "react"
import { MobileNav } from "./mobile-nav"
import { NotificationSlider } from "@/features/notifications/components/NotificationSlider"

interface HeaderProps {
  actions?: ReactNode
  isSidebarCollapsed?: boolean
  toggleSidebar?: () => void
}

export function Header({ actions, isSidebarCollapsed, toggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 space-y-3 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:space-y-4">
      <div className="rounded-md border border-border/70 bg-card/80 p-2.5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <MobileNav />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8 hidden lg:flex"
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
            >
              <Mail className="w-4 h-4" />
            </Button>
            <NotificationSlider />

            <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border">
              <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                <AvatarImage src="/profile.jpg" alt="Jessin Sam" />
                <AvatarFallback className="text-xs">JS</AvatarFallback>
              </Avatar>
              <div className="text-xs hidden sm:block">
                <p className="font-semibold text-foreground">Jessin Sam</p>
                <p className="text-muted-foreground text-[10px]">jessin@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actions && <div className="flex flex-col sm:flex-row gap-2">{actions}</div>}
    </header>
  )
}
