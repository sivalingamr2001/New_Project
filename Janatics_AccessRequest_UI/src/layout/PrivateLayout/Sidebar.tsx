"use client"

import { cn } from "@/shared/lib/utils"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { portalConfig } from "@/config/portal-config"
import { NAVIGATION_SECTIONS } from "@/config/navigation"
import { useAuth } from "@/providers/auth-provider"

type SidebarProps = {
    variant?: "desktop" | "mobile"
    isCollapsed?: boolean
}

export function Sidebar({ variant = "desktop", isCollapsed = false }: SidebarProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const location = useLocation();
    const { user } = useAuth();
    const role = user?.role ?? ""
    const sections = NAVIGATION_SECTIONS
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => item.roles.includes(role)),
        }))
        .filter((section) => section.items.length > 0)

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "bg-card p-4 overflow-y-auto transition-all duration-300",

                    // Desktop-only border
                    !isCollapsed && "lg:border-r lg:border-border",

                    // Variant handling
                    variant === "desktop"
                        ? "fixed top-0 left-0 h-screen hidden lg:block"
                        : "h-full",

                    // Width handling
                    isCollapsed ? "w-20 px-2" : "w-64"
                )}
            >
                <div className={cn("flex items-center gap-2 mb-6 group cursor-pointer", isCollapsed ? "justify-center" : "") }>
                    <Link to={portalConfig.brand.homePath} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 relative">
                            <div
                                className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute"
                                style={{ top: "30%", left: "30%" }}
                            />
                            <div
                                className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute"
                                style={{ top: "30%", right: "30%" }}
                            />
                            <div className="w-3 h-1.5 border-b-2 border-primary-foreground rounded-full absolute bottom-2.5" />
                        </div>
                        {!isCollapsed && <span className="text-lg font-semibold text-foreground">{portalConfig.brand.name}</span>}
                    </Link>
                </div>

                <div className="space-y-4">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <p className={cn("text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider", isCollapsed ? "flex justify-center" : "block")}>{section.title}</p>
                            <nav className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.to
                                    const linkContent = (
                                        <Link
                                            key={`${section.title}-${item.to}`}
                                            to={item.to}
                                            onMouseEnter={() => setHoveredItem(item.to)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            className={cn(
                                                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative",
                                                isCollapsed && "justify-center px-0 h-10",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                                hoveredItem === item.to && !isActive && !isCollapsed && "translate-x-1"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4 shrink-0" />
                                            {!isCollapsed && <span className="text-sm">{item.label}</span>}
                                        </Link>
                                    )

                                    if (isCollapsed) {
                                        return (
                                            <Tooltip key={`${section.title}-${item.to}`}>
                                                <TooltipTrigger asChild>
                                                    {linkContent}
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="flex items-center gap-2 ml-4">
                                                    {item.label}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }
                                    return linkContent
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </aside>
        </TooltipProvider>
    )
}

