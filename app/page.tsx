import { Autocomplete } from "@/components/autocomplete";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home as HomeIcon, Users, Package, Settings } from "lucide-react";

import data from "@/lib/data.json"
import { CreateTransferTable } from "@/components/create-transfer-table";

export default function Home() {
  const almacenesOptions = data.almacenes.map(almacen => ({
    value: almacen.id.toString(),
    label: almacen.nombre
  }));

  return (
    <>
      <div className="p-4 space-y-4">
        <Autocomplete options={almacenesOptions} placeholder="Buscar material" not_found_message="No se encontraron resultados" />
        <CreateTransferTable />
      </div>
    </>
  );
}
