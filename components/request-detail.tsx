"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import ErrorAlert from "./error-alert"
import data from "@/lib/mock_user_sim.json"

interface RequestDetailProps {
  requestCode?: string
  requestType?: string
  company?: string
  onRequestCodeChange?: (value: string) => void
  onRequestTypeChange?: (value: string) => void
  onCompanyChange?: (value: string) => void
  readOnly?: boolean
}


export function RequestDetail({
  requestCode = "2351",
  requestType = "Solicitud de materiales",
  company = "CPL",
  onRequestCodeChange,
  onRequestTypeChange,
  onCompanyChange,
  readOnly = false,
}: RequestDetailProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (data.companies.length <= 0) {
      setShowError(true);
    }
  }, [data.companies]);
  return (
    <div className="space-y-6">
      {showError && (
        <ErrorAlert
          message="Tu usuario no tiene ninguna compañía asignada."
          onOpenChange={setShowError}
        />
      )}
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
    </div>
  )
}
