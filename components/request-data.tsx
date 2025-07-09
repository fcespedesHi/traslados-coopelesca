"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Autocomplete } from "./autocomplete";
import { Textarea } from "./ui/textarea";

// Función para formatear fecha en dd/mm/yyyy hh:mm
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

interface RequestDataProps {
  almacenOrigen?: string;
  almacenDestino?: string;
  proyecto?: string;
  fechaCreacion?: string;
  creadoPor?: string;
  estado?: string;
  observaciones?: string;
  ordenTrabajo?: string;
  onAlmacenOrigenChange?: (value: string) => void;
  onAlmacenDestinoChange?: (value: string) => void;
  onProyectoChange?: (value: string) => void;
  readOnly?: boolean;
}

const almacenes = [
  { value: "ALM001", label: "Almacén Central - San José" },
  { value: "ALM002", label: "Almacén Norte - Alajuela" },
  { value: "ALM003", label: "Almacén Sur - Cartago" },
  { value: "ALM004", label: "Almacén Este - Limón" },
  { value: "ALM005", label: "Almacén Oeste - Puntarenas" },
  { value: "ALM006", label: "Almacén Regional Guanacaste" },
  { value: "ALM007", label: "Almacén Heredia Centro" },
  { value: "ALM008", label: "Almacén Pérez Zeledón" },
  { value: "ALM009", label: "Almacén Liberia" },
  { value: "ALM010", label: "Almacén Turrialba" },
];

export function RequestData({
  almacenOrigen = "",
  almacenDestino = "",
  proyecto = "",
  fechaCreacion = formatDate(new Date()),
  creadoPor = "RCHAVARRIA",
  estado = "Creada",
  ordenTrabajo = "",
  onAlmacenOrigenChange,
  onAlmacenDestinoChange,
  onProyectoChange,
  observaciones = "",
  readOnly = false,
}: RequestDataProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F9F9F9] p-6">
        {/* Row 1 */}
        <div className="space-y-2">
          <Label
            htmlFor="creado-por"
            className="text-sm font-medium text-gray-700"
          >
            Creado por
          </Label>
          <Input
            id="creado-por"
            value={creadoPor}
            className="bg-gray-50 text-gray-500"
            readOnly
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
            Estado
          </Label>
          <Input
            id="estado"
            value={estado}
            className="bg-gray-50 text-gray-500"
            readOnly
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="fecha-creacion"
            className="text-sm font-medium text-gray-700"
          >
            Fecha de creación
          </Label>
          <Input
            id="fecha-creacion"
            value={fechaCreacion}
            className="bg-gray-50"
            readOnly
            disabled
          />
        </div>
        {/* Row w 4 columns */}
        <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
          <div className="space-y-2">
            <Label
              htmlFor="almacen-origen"
              className="text-sm font-medium text-gray-700"
            >
              Almacén origen
            </Label>
            <Autocomplete
              options={almacenes}
              placeholder="Selecciona un almacén"
              value={almacenOrigen}
              onValueChange={onAlmacenOrigenChange}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="almacen-destino"
              className="text-sm font-medium text-gray-700"
            >
              Almacén destino
            </Label>
            <Autocomplete
              options={almacenes}
              placeholder="Selecciona un almacén"
              value={almacenDestino}
              onValueChange={onAlmacenDestinoChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label
              htmlFor="proyecto"
              className="text-sm font-medium text-gray-700"
            >
              Proyecto
            </Label>
            <Input
              id="proyecto"
              value={proyecto}
              onChange={(e) => onProyectoChange?.(e.target.value)}
              className="bg-gray-50 text-gray-500"
              type="number"
              min={1}
              max={9999999999}
            />
          </div>

         

          <div className="space-y-2">
            <Label
              htmlFor="orden-trabajo"
              className="text-sm font-medium text-gray-700"
            >
              Orden de Trabajo
            </Label>
            <Input
              id="orden-trabajo"
              value={ordenTrabajo}
              className="bg-gray-50 text-gray-500"
              readOnly
            />
          </div>
        </div>
        <div className="space-y-2 col-span-full">
          <Label
            htmlFor="observaciones"
            className="text-sm font-medium text-gray-700"
          >
            Observaciones
          </Label>
          <Textarea
            id="observaciones"
            value={observaciones}
            className="bg-gray-50 text-gray-500 w-full"
            placeholder="Escriba su comentario aquí"
          />
        </div>
      </div>
    </div>
  );
}
