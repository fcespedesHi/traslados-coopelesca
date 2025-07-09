"use client"

import type React from "react"

import {
  Building2,
  Package,
  FileText,
  BarChart3,
  Settings,
  Users,
  Truck,
  ClipboardList,
  Home,
  ChevronRight,
  LogOutIcon,
  HomeIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Datos del menú de navegación
const navigationData = {
  navMain: [
    {
      title: "Solicitud de Materiales",
      url: "#",
      icon: HomeIcon,
      isActive: true,
      items: [
        {
          title: "Crear solicitud",
          url: "#",
          isActive: true,
        },
        {
          title: "Aprobar Solicitudes",
          url: "#",
          isActive: false,
        },
        {
          title: "Alistar Materiales",
          url: "#",
          isActive: false,
        },
        {
          title: "Entregar Materiales",
          url: "#",
          isActive: false,
        },        {
          title: "Confirmar Recepción de Materiales",
          url: "#",
          isActive: false,
        },
      ],
    },
    {
      title: "Traslado entre Almacenes",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Crear Solicitud de Traslado",
          url: "#",
          isActive: false,
        },
        {
          title: "Confirmar Recepción de Traslado",
          url: "#",
          isActive: false,
        },
      ],
    },
    {
      title: "Devolución de Materiales",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Crear Solicitud de Devolución",
          url: "#",
          isActive: false,
        },
        {
          title: "Confirmar Recepción de Devolución",
          url: "#",
          isActive: false,
        }
      ],
    },
    {
      title: "Consulta de Solicitudes",
      url: "#",
      icon: Truck,
    }
  ],
  navSecondary: [

    {
      title: "Cerrar Sesión",
      url: "#",
      icon: LogOutIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" {...props} >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">C</div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Coopelesca</span>
            <span className="truncate text-xs text-muted-foreground">Gestión de Materiales</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.navMain.map((item) => (
                <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.items && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {item.items && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 px-1 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
                  RC
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">RCHAVARRIA</span>
                  <span className="truncate text-xs text-muted-foreground">Administrador</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
