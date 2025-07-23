"use client";
import { RequestForm } from "@/components/request-form";
import { useEffect, useState, useCallback } from "react";
import { CreateTransferTable } from "@/components/create-transfer-table";
import ErrorAlert from "@/components/error-alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Filter, ListChecksIcon, PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@radix-ui/react-separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import RequestItemsDetail from "@/components/request-items-detail";
// Función para generar un número aleatorio de 4 dígitos
const generateRandomCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

import data from "@/lib/mock_user_sim.json";
import { Input } from "@/components/ui/input";

interface ItemDetail {
  location: string;
  batch: string;
  available: number;
  quantity: number; // Cantidad requerida para cada sub-item
  defaultQuantity?: number; // Cantidad por defecto para este sub-item
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
  const [observaciones, setObservaciones] = useState("");
  const [ordenTrabajo, setOrdenTrabajo] = useState("");

  const [sideListOpen, setSideListOpen] = useState(true);

  // Estado global de artículos seleccionados
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);

  //funciones para guardar, solicitar aprobación, enviar y eliminar solicitud
  const handleSave = useCallback(() => {
    console.log("Guardando solicitud...");
    // Aquí iría la lógica para guardar
  }, []);

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
  };

  // Agregar artículo (desde la tabla)
  const handleAddArticle = useCallback(
    (article: {
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
          // Si ya existe, no agregar duplicado pero sumar la cantidad que se agrega de más
          return prev.map((existingArticle) => {
            if (existingArticle.id === article.id) {
              // Artículo simple con quantity
              if (existingArticle.quantity !== undefined && article.quantity) {
                return {
                  ...existingArticle,
                  quantity: existingArticle.quantity + article.quantity,
                };
              }
              // Artículo con subRows
              else if (existingArticle.subRows && article.subRows) {
                const updatedSubRows = [...existingArticle.subRows];

                // Para cada subRow del artículo que se está agregando
                article.subRows.forEach((newSubRow) => {
                  const existingSubRowIndex = updatedSubRows.findIndex(
                    (existing) =>
                      existing.location === newSubRow.location &&
                      existing.batch === newSubRow.batch
                  );

                  if (existingSubRowIndex !== -1) {
                    // Si ya existe esta combinación location/batch, sumar cantidades
                    updatedSubRows[existingSubRowIndex] = {
                      ...updatedSubRows[existingSubRowIndex],
                      quantity:
                        updatedSubRows[existingSubRowIndex].quantity +
                        newSubRow.quantity,
                    };
                  } else {
                    // Si no existe, agregar nuevo subRow
                    updatedSubRows.push(newSubRow);
                  }
                });

                // Actualizar también la cantidad del artículo padre
                const newParentQuantity =
                  (existingArticle.quantity || 1) + (article.quantity || 1);

                return {
                  ...existingArticle,
                  quantity: newParentQuantity,
                  subRows: updatedSubRows,
                };
              }
            }
            return existingArticle;
          });
        }

        // Preparar el artículo para agregar
        const articleToAdd: Article = {
          id: article.id,
          code: article.code,
          name: article.name,
          description: article.description,
          balance: article.balance,
        };

        // Si tiene sub-items, usar las cantidades que ya vienen procesadas
        if (article.subRows && article.subRows.length > 0) {
          articleToAdd.subRows = article.subRows; // Usar las cantidades exactas que eligió el usuario
        } else {
          // Para artículos simples, usar la cantidad solicitada
          articleToAdd.quantity = article.quantity;
        }

        return [...prev, articleToAdd];
      });
      //autoguardar cada que se agrega un artículo
      handleSave();
    },
    [handleSave]
  );

  // Quitar artículo (desde el sidebar)
  const handleRemoveArticle = useCallback(
    (id: string) => {
      setSelectedArticles((prev) => prev.filter((a) => a.id !== id));
      //autoguardar cada que se quita un artículo
      handleSave();
    },
    [handleSave]
  );

  // Actualizar cantidad de artículos
  const handleUpdateQuantity = useCallback(
    (articleId: string, quantity: number, subItemIndex?: number) => {
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
              // Actualizar cantidad del artículo padre (y multiplicar sub-items si los tiene)
              if (article.subRows && article.subRows.length > 0) {
                // Para artículos compuestos, actualizar cantidad padre y multiplicar sub-items
                const updatedSubRows = article.subRows.map((subRow) => ({
                  ...subRow,
                  quantity: (subRow.defaultQuantity || 1) * quantity,
                }));

                return {
                  ...article,
                  quantity: quantity,
                  subRows: updatedSubRows,
                };
              } else {
                // Para artículos simples, solo actualizar la cantidad
                return {
                  ...article,
                  quantity: quantity,
                };
              }
            }
          }
          return article;
        });
      });
      //autoguardar cada que se actualiza una cantidad
      handleSave();
    },
    [handleSave]
  );

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
        defaultValue="item-1"
        className="bg-white rounded-lg p-2 mt-5"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-bold " aria-expanded={true}>
            Detalle de la Solicitud
          </AccordionTrigger>
          <AccordionContent>
            <RequestForm
              requestCode={requestCode}
              requestType={requestType}
              company={company}
              onRequestCodeChange={setRequestCode}
              onRequestTypeChange={setRequestType}
              onCompanyChange={setCompany}
              almacenOrigen={almacenOrigen}
              almacenDestino={almacenDestino}
              proyecto={proyecto}
              observaciones={observaciones}
              ordenTrabajo={ordenTrabajo}
              onAlmacenOrigenChange={setAlmacenOrigen}
              onAlmacenDestinoChange={setAlmacenDestino}
              onProyectoChange={setProyecto}
              onObservacionesChange={setObservaciones}
              onOrdenTrabajoChange={setOrdenTrabajo}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* Sheet Trigger para Agregar Artículo */}
      <div className="bg-white rounded-lg">
        <Sheet>
          <div className="p-5 space-y-5">
            <div>
              <p className="text-lg font-bold">Detalle de la Transacción</p>
              <p className="text-sm">
                Consultá el catálogo del almacén seleccionado y agregalos para
                continuar con la solicitud.
              </p>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Input className="min-w-xs" placeholder="Código, descripción, ubicación" />
                <Button className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white">
                  Buscar
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button className="bg-white text-black border border-gray-300/40 hover:bg-gray-100 cursor-pointer"><Filter/> Filtrar Lista</Button>
                <SheetTrigger asChild>
                  <Button className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white">
                    <PlusIcon /> Agregar Artículos
                  </Button>
                </SheetTrigger>
              </div>
            </div>
          </div>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Seleccionar Artículos del Almacén</SheetTitle>
            </SheetHeader>
            <div className="rounded-lg bg-white shadow-sm p-10 bg-linear-to-b from-[#EBEEF4] to-[#F8FAFC]">
              <CreateTransferTable onAddArticle={handleAddArticle} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Request Items Detail */}
        <div className="p-5">
          <RequestItemsDetail
            articles={selectedArticles}
            onRemove={handleRemoveArticle}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>
      </div>

      {/* Espacio para evitar que el contenido se oculte detrás de los botones fijos */}
      <div className="h-20"></div>

      {/* Botones fijos en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-end space-x-2">
          <Button className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white cursor-pointer">
            Eliminar
          </Button>
          <Button className="cursor-pointer bg-white text-black border border-gray-300/40 shadow-sm hover:bg-gray-100">
            Guardar
          </Button>
          <Button
            disabled={selectedArticles.length === 0}
            className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white cursor-pointer"
          >
            Solicitar Aprobación
          </Button>
          <Button
            disabled={selectedArticles.length === 0}
            className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white cursor-pointer"
            onClick={handleSend}
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateRequestPage;
