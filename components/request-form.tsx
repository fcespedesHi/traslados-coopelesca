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
import { useEffect, useState } from "react";
import ErrorAlert from "./error-alert";
import data from "@/lib/mock_user_sim.json";

// Función para formatear fecha en dd/mm/yyyy hh:mm
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

interface RequestFormProps {
  // Props del RequestDetail
  requestCode?: string;
  requestType?: string;
  company?: string;
  onRequestCodeChange?: (value: string) => void;
  onRequestTypeChange?: (value: string) => void;
  onCompanyChange?: (value: string) => void;
  
  // Props del RequestData
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
  onObservacionesChange?: (value: string) => void;
  onOrdenTrabajoChange?: (value: string) => void;
  
  readOnly?: boolean;
}

export function RequestForm({
  // RequestDetail props
  requestCode = "2351",
  requestType = "Solicitud de materiales",
  company = "CPL",
  onRequestCodeChange,
  onRequestTypeChange,
  onCompanyChange,
  
  // RequestData props
  almacenOrigen = "",
  almacenDestino = "",
  proyecto = "",
  fechaCreacion = formatDate(new Date()),
  creadoPor = data.user,
  estado = "Creada",
  ordenTrabajo = "",
  onAlmacenOrigenChange,
  onAlmacenDestinoChange,
  onProyectoChange,
  onObservacionesChange,
  onOrdenTrabajoChange,
  observaciones = "",
  
  readOnly = false,
}: RequestFormProps) {
  const [showError, setShowError] = useState(false);
  const [almacenesOrigen, setAlmacenesOrigen] = useState<Array<{value: string, label: string}>>([]);
  const [almacenesDestino, setAlmacenesDestino] = useState<Array<{value: string, label: string}>>([]);
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  // Función para obtener los almacenes según la compañía seleccionada
  const getAlmacenesByCompany = (companyCode: string) => {
    const selectedCompany = data.companies.find(comp => comp.value === companyCode);
    if (selectedCompany) {
      return {
        origen: selectedCompany.alms_org || [],
        destino: selectedCompany.alm_destino || []
      };
    }
    return { origen: [], destino: [] };
  };

  // Efecto para validar compañías
  useEffect(() => {
    if (data.companies.length <= 0) {
      setShowError(true);
    }
  }, []);

  // Efecto para actualizar los almacenes cuando cambia la compañía
  useEffect(() => {
    const { origen, destino } = getAlmacenesByCompany(company);
    setAlmacenesOrigen(origen);
    setAlmacenesDestino(destino);
    
    // Incrementar la key para forzar re-render de los Autocomplete
    setAutocompleteKey(prev => prev + 1);
    
    // Limpiar los valores seleccionados cuando cambia la compañía
    if (onAlmacenOrigenChange) {
      // Si solo hay un almacén de origen, seleccionarlo automáticamente
      if (origen.length === 1) {
        onAlmacenOrigenChange(origen[0].value);
      } else {
        onAlmacenOrigenChange("");
      }
    }
    
    if (onAlmacenDestinoChange) {
      // Si solo hay un almacén de destino, seleccionarlo automáticamente
      if (destino.length === 1) {
        onAlmacenDestinoChange(destino[0].value);
      } else {
        onAlmacenDestinoChange("");
      }
    }
  }, [company]); // Eliminar las funciones callback de las dependencias

  // Efecto para filtrar almacenes de destino cuando cambia el almacén de origen
  useEffect(() => {
    const { origen, destino } = getAlmacenesByCompany(company);
    setAlmacenesOrigen(origen);
    
    // Filtrar almacenes de destino excluyendo el almacén de origen seleccionado
    if (almacenOrigen) {
      const almacenesDestinoFiltrados = destino.filter(alm => alm.value !== almacenOrigen);
      setAlmacenesDestino(almacenesDestinoFiltrados);
      
      // Si el almacén de destino actual es igual al de origen, limpiarlo
      if (almacenDestino === almacenOrigen && onAlmacenDestinoChange) {
        onAlmacenDestinoChange("");
      }
      
      // Si después del filtrado solo queda un almacén de destino, seleccionarlo automáticamente
      if (almacenesDestinoFiltrados.length === 1 && onAlmacenDestinoChange && almacenDestino !== almacenesDestinoFiltrados[0].value) {
        onAlmacenDestinoChange(almacenesDestinoFiltrados[0].value);
      }
    } else {
      // Si no hay almacén de origen seleccionado, mostrar todos los de destino
      setAlmacenesDestino(destino);
    }
  }, [almacenOrigen, company, almacenDestino]); // Eliminar onAlmacenDestinoChange de las dependencias

  return (
    <div className="space-y-6">
      {showError && (
        <ErrorAlert
          message="Tu usuario no tiene ninguna compañía asignada."
          onOpenChange={setShowError}
        />
      )}
      
      {/* Sección de detalles de la solicitud */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F9F9F9] border-[#ECECEC] p-6">
        {/* Código de solicitud */}
        <div className="space-y-2">
          <Label htmlFor="request-code" className="text-sm font-medium text-gray-700">
            Código de solicitud
          </Label>
          <Input
            id="request-code"
            value={requestCode}
            onChange={(e) => onRequestCodeChange?.(e.target.value)}
            className={readOnly ? "bg-gray-50" : ""}
            readOnly
            disabled
          />
        </div>

        {/* Tipo de solicitud */}
        <div className="space-y-2">
          <Label htmlFor="request-type" className="text-sm font-medium text-gray-700">
            Tipo de solicitud
          </Label>
          <Input
            id="request-type"
            value={requestType}
            onChange={(e) => onRequestTypeChange?.(e.target.value)}
            placeholder="Solicitud de Materiales"
            className={readOnly ? "bg-gray-50 text-gray-500" : ""}
            readOnly
            disabled
          />
        </div>

        {/* Compañía */}
        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
            Compañía
          </Label>
          <Select value={company} onValueChange={onCompanyChange} disabled={readOnly}>
            <SelectTrigger className={readOnly ? "bg-gray-50 w-full" : "w-full"}>
              <SelectValue placeholder="Selecciona una compañía" />
            </SelectTrigger>
            <SelectContent>
              {data.companies.map((comp) => (
                <SelectItem key={comp.value} value={comp.value}>
                  {comp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sección de datos de la solicitud */}
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
            defaultValue={creadoPor}
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
            defaultValue={estado}
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
            defaultValue={fechaCreacion}
            className="bg-gray-50"
            readOnly
            disabled
          />
        </div>
        
        {/* Row 2 - 4 columns */}
        <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
          <div className="space-y-2">
            <Label
              htmlFor="almacen-origen"
              className="text-sm font-medium text-gray-700"
            >
              Almacén origen
            </Label>
            <Autocomplete
              key={`origen-${autocompleteKey}`}
              options={almacenesOrigen}
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
              key={`destino-${autocompleteKey}`}
              options={almacenesDestino}
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
              onChange={(e) => onOrdenTrabajoChange?.(e.target.value)}
              className="bg-gray-50 text-gray-500"
            />
          </div>
        </div>
        
        {/* Row 3 - Observaciones */}
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
            onChange={(e) => onObservacionesChange?.(e.target.value)}
            className="bg-gray-50 text-gray-500 w-full"
            placeholder="Escriba su comentario aquí"
          />
        </div>
      </div>
    </div>
  );
} 