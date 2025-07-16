import { Autocomplete } from "@/components/autocomplete";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home as HomeIcon, Users, Package, Settings, Link2, Link2Icon } from "lucide-react";

import data from "@/lib/data.json"
import { CreateTransferTable } from "@/components/create-transfer-table";
import Link from "next/link";

export default function Home() {
  const almacenesOptions = data.almacenes.map(almacen => ({
    value: almacen.id.toString(),
    label: almacen.nombre
  }));

  return (
    <>
      <div className="p-4 space-y-4">
        <Link href="/solicitudes/crear" className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white p-2 rounded-lg w-xs flex items-center justify-center gap-2">Crear Solicitud <Link2Icon className="w-4 h-4"/></Link>
      </div>
    </>
  );
}
