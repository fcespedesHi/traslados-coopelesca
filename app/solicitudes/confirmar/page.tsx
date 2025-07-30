import React from "react";
import TableAprobar from "@/components/requests-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
function Confirmar() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <div className="flex justify-between items-center">
        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/solicitudes">
                Solicitud de Materiales
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/solicitudes/crear">
                Confirmar Solicitud
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <TableAprobar />
    </div>
  );
}

export default Confirmar;
