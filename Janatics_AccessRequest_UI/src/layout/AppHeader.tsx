"use client"

import { Button } from "@/shared/components/ui/button"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import {
    Bell,
    User
} from "lucide-react"

export function MainHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b bg-transparent px-6">
      {/* LEFT: Context & Navigation */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 hover:bg-zinc-100" />
        <div className="h-4 w-px bg-zinc-200" />
        <nav className="hidden items-center gap-2 md:flex">
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Access Portal
          </span>
        </nav>
      </div>

      {/* RIGHT: System Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Button className="relative rounded-full p-2 text-zinc-400 transition-colors bg-foreground  hover:text-black">
            <Bell className="size-4 text-white hover:text-black" />
            <span className="absolute top-1 right-2 size-1.5 rounded-full border-2 border-red-500 bg-red-500" />
          </Button>
          <div className="mx-1 h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-3">
            <Button className="relative rounded-full p-1.5 text-zinc-400 transition-colors bg-foreground  hover:text-black">
              <User className="size-5 text-white" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase">John Doe</span>
              <span className="font-mono text-[10px] text-zinc-400">
                Super_Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
