"use client";
import { RequestDetail } from "@/components/request-detail";
import { RequestData } from "@/components/request-data";
import { useEffect, useState } from "react";
import { CreateTransferTable } from "@/components/create-transfer-table";
import ErrorAlert from "@/components/error-alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ListChecksIcon, PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@radix-ui/react-separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import RequestItemsDetail from "@/components/request-items-detail";

interface Article {
  id: string;
  code: string;
  name: string;
  quantity: number;
}

function CreateRequestPage() {
  // Estados para RequestDetail
  const [requestCode, setRequestCode] = useState("2351");
  const [requestType, setRequestType] = useState("Solicitud de materiales");
  const [company, setCompany] = useState("CPL");

  // Estados para RequestData
  const [almacenOrigen, setAlmacenOrigen] = useState("");
  const [almacenDestino, setAlmacenDestino] = useState("");
  const [proyecto, setProyecto] = useState("");

  const [sideListOpen, setSideListOpen] = useState(true);

  // Estado global de artículos seleccionados
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);




  const handleSave = () => {
    console.log("Guardando solicitud...");
    // Aquí iría la lógica para guardar
  };

  const handleRequestApproval = () => {
    console.log("Solicitando aprobación...");
    // Aquí iría la lógica para solicitar aprobación
  };

  const handleSend = () => {
    console.log("Enviando solicitud...");
    // Aquí iría la lógica para enviar
  };

  const handleDelete = () => {
    console.log("Eliminando solicitud...");
    // Aquí iría la lógica para eliminar
  };

  // Agregar artículo (desde la tabla)
  const handleAddArticle = (article: Article) => {
    setSelectedArticles((prev) => {
      const found = prev.find((a) => a.id === article.id);
      if (found) {
        // Si ya existe, suma la cantidad
        return prev.map((a) =>
          a.id === article.id
            ? { ...a, quantity: a.quantity + article.quantity }
            : a
        );
      }
      return [...prev, article];
    });
  };

  // Quitar artículo (desde el sidebar)
  const handleRemoveArticle = (id: string) => {
    setSelectedArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <div className="flex justify-between items-center">
        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/request">
                Solicitud de Materiales
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/request/create">
                Crear Solicitud
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Accordion
        type="single"
        collapsible
        className="bg-white rounded-lg p-2 mt-5"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-bold">
            Detalle de la Solicitud
          </AccordionTrigger>
          <AccordionContent>
            <RequestDetail
              requestCode={requestCode}
              requestType={requestType}
              company={company}
              onRequestCodeChange={setRequestCode}
              onRequestTypeChange={setRequestType}
              onCompanyChange={setCompany}
            />
            <Separator className="border-t mx-5 bg-red-400" />
            <RequestData
              almacenOrigen={almacenOrigen}
              almacenDestino={almacenDestino}
              proyecto={proyecto}
              onAlmacenOrigenChange={setAlmacenOrigen}
              onAlmacenDestinoChange={setAlmacenDestino}
              onProyectoChange={setProyecto}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* Sheet Trigger para Agregar Artículo */}
      <Sheet>
       
          <div className="flex justify-between shadow-sm bg-white p-5 rounded-lg">
            <div>
              <p className="text-lg font-bold">Artículos en el Almacén</p>
              <p>{almacenOrigen ? almacenOrigen : "Selecciona un almacén"}</p>
            </div>
            <SheetTrigger asChild>
            <Button className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white">
              <PlusIcon /> Agregar Artículo
            </Button>
            </SheetTrigger>
          </div>
       
        <SheetContent side="bottom">
          <div className="rounded-lg bg-white shadow-sm p-10 bg-linear-to-b from-[#EBEEF4] to-[#F8FAFC]">
            <CreateTransferTable onAddArticle={handleAddArticle} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Request Items Detail */}

      <RequestItemsDetail articles={selectedArticles} onRemove={handleRemoveArticle} />

      <div className="flex justify-end space-x-2">
        <Button className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white">Eliminar</Button>
        <Button className="bg-white text-black border">Guardar</Button>
        <Button disabled={selectedArticles.length === 0} className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white">Solicitar Aprobación</Button>
        <Button disabled={selectedArticles.length === 0} className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white">Enviar</Button>
      </div>
    </div>
  );
}

export default CreateRequestPage;
