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
// Función para generar un número aleatorio de 4 dígitos
const generateRandomCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

import data from "@/lib/mock_user_sim.json"


interface ItemDetail {
  location: string;
  batch: string;
  available: number;
  quantity: number; // Cantidad requerida para cada sub-item
}

interface Article {
  id: string;
  code: string;
  name: string;
  description?: string;
  balance?: number | null;
  quantity?: number; // Cantidad para artículos simples
  subRows?: ItemDetail[]; // Solo para artículos compuestos
}

function CreateRequestPage() {
  // Estados para RequestDetail 

  const code = generateRandomCode();

  const [requestCode, setRequestCode] = useState<string>(code);
  const [requestType, setRequestType] = useState("Solicitud de materiales");
  const [company, setCompany] = useState("CPL");

  // Estados para RequestData
  const [almacenOrigen, setAlmacenOrigen] = useState("");
  const [almacenDestino, setAlmacenDestino] = useState("");
  const [proyecto, setProyecto] = useState("");

  const [sideListOpen, setSideListOpen] = useState(true);

  // Estado global de artículos seleccionados
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);

  //funciones para guardar, solicitar aprobación, enviar y eliminar solicitud
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
    console.log(selectedArticles);
    // Aquí iría la lógica para enviar
  };

  const handleDelete = () => {
    console.log("Eliminando solicitud...");
    // Aquí iría la lógica para eliminar
  };

  //funcion que actualiza los productos cuando cambia el almacen de origen
  useEffect(() => {
    handleLoadProducts();
  }, [almacenOrigen]);

  const handleLoadProducts = () => {
    console.log("Cargando productos...");
  }

  // Agregar artículo (desde la tabla)
  const handleAddArticle = (article: {
    id: string;
    code: string;
    name: string;
    description: string;
    balance: number | null;
    quantity: number;
    subRows?: ItemDetail[];
  }) => {
    setSelectedArticles((prev) => {
      const found = prev.find((a) => a.id === article.id);
      if (found) {
        // Si ya existe, no agregar duplicado
        return prev;
      }
      
      // Preparar el artículo para agregar
      const articleToAdd: Article = {
        id: article.id,
        code: article.code,
        name: article.name,
        description: article.description,
        balance: article.balance,
      };

      // Si tiene sub-items, agregar cantidades por defecto
      if (article.subRows && article.subRows.length > 0) {
        articleToAdd.subRows = article.subRows.map(subRow => ({
          ...subRow,
          quantity: Math.min(article.quantity, subRow.available) // Usar la cantidad disponible o la solicitada, lo que sea menor
        }));
      } else {
        // Para artículos simples, usar la cantidad solicitada
        articleToAdd.quantity = article.quantity;
      }

      return [...prev, articleToAdd];
    });
    //autoguardar cada que se agrega un artículo
    handleSave();
  };

  // Quitar artículo (desde el sidebar)
  const handleRemoveArticle = (id: string) => {
    setSelectedArticles((prev) => prev.filter((a) => a.id !== id));
    //autoguardar cada que se quita un artículo
    handleSave();
  };

  // Actualizar cantidad de artículos
  const handleUpdateQuantity = (articleId: string, quantity: number, subItemIndex?: number) => {
    setSelectedArticles((prev) => {
      return prev.map((article) => {
        if (article.id === articleId) {
          if (subItemIndex !== undefined && article.subRows) {
            // Actualizar cantidad de un sub-item específico
            const updatedSubRows = [...article.subRows];
            updatedSubRows[subItemIndex] = {
              ...updatedSubRows[subItemIndex],
              quantity: quantity,
            };
            return {
              ...article,
              subRows: updatedSubRows,
            };
          } else {
            // Actualizar cantidad del artículo simple
            return {
              ...article,
              quantity: quantity,
            };
          }
        }
        return article;
      });
    });
    //autoguardar cada que se actualiza una cantidad
    handleSave();
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
          <AccordionTrigger className="text-lg font-bold " aria-expanded={true}>
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
              company={company}
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

      <RequestItemsDetail 
        articles={selectedArticles} 
        onRemove={handleRemoveArticle} 
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Espacio para evitar que el contenido se oculte detrás de los botones fijos */}
      <div className="h-20"></div>
      
      {/* Botones fijos en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-end space-x-2">
          <Button className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white cursor-pointer">Eliminar</Button>
          <Button color="white" className="cursor-pointer">Guardar</Button>
          <Button disabled={selectedArticles.length === 0} className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white cursor-pointer">Solicitar Aprobación</Button>
          <Button disabled={selectedArticles.length === 0} className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white cursor-pointer" onClick={handleSend}>Enviar</Button>
        </div>
      </div>
    </div>
  );
}

export default CreateRequestPage;
