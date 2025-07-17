import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getExpandedRowModel,
  type ExpandedState,
  type Row,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ItemDetail {
  location: string;
  batch: string;
  available: number;
  quantity: number; // Cantidad seleccionada para este sub-item (requerida)
  defaultQuantity?: number; // Cantidad por defecto para este sub-item
}

interface Article {
  id: string;
  code: string;
  name: string;
  description?: string;
  balance?: number | null;
  quantity?: number; // Cantidad para artículos simples
  subRows?: ItemDetail[]; // Sub-filas para detalles
}

interface Props {
  articles: Article[];
  onRemove?: (id: string) => void;
  onUpdateQuantity?: (
    articleId: string,
    quantity: number,
    subItemIndex?: number
  ) => void;
}

function RequestItemsDetail({ articles, onRemove, onUpdateQuantity }: Props) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // Limpiar estado de expansión para artículos que ya no existen
  React.useEffect(() => {
    const currentArticleIds = new Set(articles.map(article => article.id));
    setExpanded(prevExpanded => {
      const cleanedExpanded: ExpandedState = {};
      Object.entries(prevExpanded).forEach(([key, value]) => {
        if (currentArticleIds.has(key) && value) {
          (cleanedExpanded as any)[key] = value;
        }
      });
      return cleanedExpanded;
    });
  }, [articles]);

 

  // Función para calcular el saldo total de un artículo
  const calculateTotalBalance = (article: Article): number => {
    if (article.subRows && article.subRows.length > 0) {
      return article.subRows.reduce(
        (total, subRow) => total + subRow.available,
        0
      );
    }
    return article.balance || 0;
  };

  // Función para calcular la cantidad total de un artículo
  const calculateTotalQuantity = (article: Article): number => {
    if (article.subRows && article.subRows.length > 0) {
      return article.subRows.reduce(
        (total, subRow) => total + subRow.quantity,
        0
      );
    }
    return article.quantity || 0; // Para artículos simples
  };

  // Función para manejar el cambio de cantidad del producto padre
  const handleParentQuantityChange = React.useCallback((article: Article, newQuantity: number) => {
    const validQuantity = Math.max(1, newQuantity);
    // El componente padre se encarga de la multiplicación automática de sub-items
    onUpdateQuantity?.(article.id, validQuantity);
  }, [onUpdateQuantity]);



  const renderSubComponent = ({ row }: { row: Row<Article> }) => {
    return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-5">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700 w-[50px] sm:w-[60px] text-xs sm:text-sm"></TableHead>
                <TableHead className="font-semibold text-gray-700 w-[80px] sm:w-[100px] md:w-[120px] text-xs sm:text-sm">ID</TableHead>
                <TableHead className="font-semibold text-gray-700 w-[200px] sm:w-[250px] md:w-[300px] lg:w-[320px] text-xs sm:text-sm">Descripción</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-[80px] sm:w-[90px] md:w-[100px] text-xs sm:text-sm">Disponible</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-[100px] sm:w-[120px] md:w-[150px] text-xs sm:text-sm">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {row.original.subRows?.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center w-[50px] sm:w-[60px] min-w-[50px] sm:min-w-[60px] max-w-[50px] sm:max-w-[60px] p-2 sm:p-3">
                    <div className="flex items-center justify-center">
                      <Checkbox disabled className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium w-[80px] sm:w-[100px] md:w-[120px] min-w-[80px] sm:min-w-[100px] md:min-w-[120px] max-w-[80px] sm:max-w-[100px] md:max-w-[120px] p-2 sm:p-3">
                    <div className="truncate text-xs sm:text-sm">
                      {detail.location}
                    </div>
                  </TableCell>
                  <TableCell className="w-[200px] sm:w-[250px] md:w-[300px] lg:w-[320px] min-w-[200px] sm:min-w-[250px] md:min-w-[300px] lg:min-w-[320px] max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[320px] p-2 sm:p-3">
                    <div className="truncate text-xs sm:text-sm" title={detail.batch}>
                      {detail.batch}
                    </div>
                  </TableCell>
                  <TableCell className="text-center w-[80px] sm:w-[90px] md:w-[100px] min-w-[80px] sm:min-w-[90px] md:min-w-[100px] max-w-[80px] sm:max-w-[90px] md:max-w-[100px] p-2 sm:p-3">
                    <span className="inline-flex items-center justify-center min-w-[30px] sm:min-w-[35px] md:min-w-[40px] px-1 sm:px-2 py-1  rounded-md text-xs sm:text-sm font-medium">
                      {detail.available}
                    </span>
                  </TableCell>
                  <TableCell className="flex mx-auto w-full text-center w-[100px] sm:w-[120px] md:w-[150px] min-w-[100px] sm:min-w-[120px] md:min-w-[150px] max-w-[100px] sm:max-w-[120px] md:max-w-[150px] p-2 sm:p-3">
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-full mx-auto max-w-[60px] sm:max-w-[70px] md:max-w-[80px] h-8 sm:h-9 md:h-10 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      min={1}
                      max={detail.available}
                      value={detail.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        const newQuantity = Math.max(1, isNaN(value) ? 1 : value);
                        
                        // Actualizar la cantidad del sub-item específico
                        onUpdateQuantity?.(
                          row.original.id,
                          newQuantity,
                          index
                        );
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  // Columnas de la tabla
  const columns = React.useMemo<ColumnDef<Article>[]>(
    () => [
      {
        id: "select",
        header: () => <Checkbox disabled />,
        cell: () => <Checkbox disabled />,
        size: 50,
      },
      {
        accessorKey: "code",
        header: "Código",
        cell: ({ getValue }) => (
          <div className="min-w-[80px] max-w-[120px] truncate">
            {String(getValue() || "-")}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-1 sm:gap-2 min-w-[150px] sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]">
            {row.getCanExpand() ? (
              <button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: "pointer" },
                }}
                className="p-0.5 sm:p-1 hover:bg-gray-100 rounded flex-shrink-0"
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 text-gray-600",
                    row.getIsExpanded() ? "rotate-90" : ""
                  )}
                />
              </button>
            ) : (
              <div className="w-4 sm:w-6 flex-shrink-0"></div>
            )}
            <p
              className={cn(
                "truncate text-xs sm:text-sm",
                row.getCanExpand()
                  ? "font-bold text-[#004F9F] underline cursor-pointer"
                  : ""
              )}
            >
              {getValue<string>() || "-"}
            </p>
          </div>
        ),
        size: 300,
      },
      {
        accessorKey: "balance",
        header: "Saldo",
        cell: ({ row }) => {
          const totalBalance = calculateTotalBalance(row.original);
          return (
            <div className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center">
              <span className="font-medium text-xs sm:text-sm">{totalBalance || "-"}</span>
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "quantity",
        header: "Cantidad",
        cell: ({ row }) => {
          const totalQuantity = calculateTotalQuantity(row.original);
          const isCompound = row.getCanExpand();
          const hasSubRows = !!row.original.subRows && row.original.subRows.length > 0;

          // Usar hasSubRows directamente en lugar de isCompound para debug
          if (hasSubRows) {
            // Para artículos compuestos, mostrar input editable para el padre
            return (
              <div className="min-w-[80px] sm:min-w-[90px] md:min-w-[100px] flex items-center gap-1 sm:gap-2">
                <Input
                  type="number"
                  placeholder="1"
                  className="w-full min-w-[60px] sm:min-w-[70px] md:min-w-[80px] max-w-[80px] sm:max-w-[100px] md:max-w-[120px] h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min={1}
                  value={row.original.quantity || 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    handleParentQuantityChange(row.original, isNaN(value) ? 1 : value);
                  }}
                />
              </div>
            );
          } else {
            // Para artículos simples, mostrar input editable
            return (
              <div className="min-w-[80px] sm:min-w-[90px] md:min-w-[100px]">
                <Input
                  type="number"
                  placeholder="1"
                  className="w-full min-w-[60px] sm:min-w-[70px] md:min-w-[80px] max-w-[80px] sm:max-w-[100px] md:max-w-[120px] h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min={1}
                  max={row.original.balance || 1}
                  value={row.original.quantity || 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    onUpdateQuantity?.(row.original.id, Math.max(1, isNaN(value) ? 1 : value));
                  }}
                />
              </div>
            );
          }
        },
        size: 150,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] flex justify-center">
            <Button
              size="icon"
              className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white hover:from-[#B91C1C] hover:to-[#991B1B] h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
              onClick={() => onRemove?.(row.original.id)}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </Button>
          </div>
        ),
        size: 80,
      },
    ],
    [onRemove, onUpdateQuantity, handleParentQuantityChange]
  );

  const table = useReactTable({
    data: articles,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getRowCanExpand: (row) => {
      const canExpand = !!row.original.subRows && row.original.subRows.length > 0;
      return canExpand;
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="p-2 sm:p-3 md:p-4 border-b font-bold text-sm sm:text-base">Detalle de Transacción</div>
      <div className="bg-[#f8fafc] rounded-xl p-1 sm:p-2 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs sm:text-sm whitespace-nowrap">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-6 sm:py-8 text-center text-gray-400 text-xs sm:text-sm"
                  >
                    No se han añadido artículos a tu lista.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0 bg-gray-50">
                          {renderSubComponent({ row })}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default RequestItemsDetail;
