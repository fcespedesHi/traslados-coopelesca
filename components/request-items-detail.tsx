import React, { useMemo } from "react";
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

  // Memoizar los IDs de artículos para detectar cambios reales
  const articleIds = React.useMemo(
    () =>
      articles
        .map((article) => article.id)
        .sort()
        .join(","),
    [articles]
  );

  // Limpiar estado de expansión solo cuando se eliminan artículos (no al actualizar cantidades)
  React.useEffect(() => {
    const currentArticleIds = new Set(articles.map((article) => article.id));
    setExpanded((prevExpanded) => {
      const cleanedExpanded: ExpandedState = {};
      Object.entries(prevExpanded).forEach(([key, value]) => {
        if (currentArticleIds.has(key) && value) {
          (cleanedExpanded as any)[key] = value;
        }
      });
      return cleanedExpanded;
    });
  }, [articleIds]); // Solo depende de los IDs, no del array completo

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
  const handleParentQuantityChange = React.useCallback(
    (article: Article, newQuantity: number) => {
      const validQuantity = Math.max(1, newQuantity);
      // El componente padre se encarga de la multiplicación automática de sub-items
      onUpdateQuantity?.(article.id, validQuantity);
    },
    [onUpdateQuantity]
  );

  const renderSubComponent = ({ row }: { row: Row<Article> }) => {
    return (
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableBody>
            {row.original.subRows?.map((detail, index) => (
              <TableRow key={index}>
                {/* location - min-w: 80px, max-w: 120px */}
                <TableCell className="p-2 sm:p-3 text-xs sm:text-sm bg-white whitespace-nowrap min-w-[80px] max-w-[120px]">
                  {detail.location}
                </TableCell>

                {/* batch - min-w: 150px, max-w: 300px */}
                <TableCell className="p-2 sm:p-3 text-xs sm:text-sm bg-white whitespace-nowrap min-w-[150px] sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]">
                  <div className="truncate" title={detail.batch}>
                    {detail.batch}
                  </div>
                </TableCell>

                {/* available (balance) - min-w: 80px */}
                <TableCell className="p-2 sm:p-3 text-center text-xs sm:text-sm bg-white whitespace-nowrap min-w-[50px] sm:min-w-[60px] md:min-w-[80px]">
                  <span className="inline-flex items-center justify-center font-medium">
                    {detail.available}
                  </span>
                </TableCell>

                {/* quantity input - min-w: 80px */}
                <TableCell className="p-2 sm:p-3 bg-white whitespace-nowrap min-w-[80px]">
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-full mx-auto max-w-[80px] h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    min={1}
                    max={detail.available}
                    value={detail.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      const newQuantity = Math.max(1, isNaN(value) ? 1 : value);
                      onUpdateQuantity?.(row.original.id, newQuantity, index);
                    }}
                  />
                </TableCell>

                {/* action button - min-w: 80px */}
                <TableCell className="p-2 sm:p-3 bg-white whitespace-nowrap min-w-[50px] sm:min-w-[60px] md:min-w-[80px] flex justify-center">
                  <Button
                    size="icon"
                    className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white hover:from-[#B91C1C] hover:to-[#991B1B] h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderSubComponentRows = (row: Row<Article>) => {
    return row.original.subRows?.map((detail, index) => (
      <TableRow key={`${row.id}-subrow-${index}`} className="bg-gray-50">
        {/* Código (repetido) */}
        <TableCell className="min-w-[80px] max-w-[120px] text-xs sm:text-sm whitespace-nowrap">
          {row.original.code}
        </TableCell>

        {/* Descripción */}
        <TableCell className="min-w-[150px] sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] max-w-[300px] text-xs sm:text-sm whitespace-nowrap">
          {detail.batch}
        </TableCell>

        {/* Saldo */}
        <TableCell className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center text-xs sm:text-sm">
          {detail.available}
        </TableCell>

        {/* Cantidad */}
        <TableCell className="min-w-[80px] text-xs sm:text-sm">
          <Input
            type="number"
            className="w-[80px] mx-auto h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            min={1}
            max={detail.available}
            value={detail.quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              const newQuantity = Math.max(1, isNaN(value) ? 1 : value);
              onUpdateQuantity?.(row.original.id, newQuantity, index);
            }}
          />
        </TableCell>

        {/* Acciones */}
        <TableCell className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] flex justify-center">
          <Button
            size="icon"
            className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white hover:from-[#B91C1C] hover:to-[#991B1B] h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  // Columnas de la tabla
  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorKey: "code",
        header: () => (
          <div className="text-start">
            <span className="font-bold text-xs sm:text-sm text-[#585858]">
              Código
            </span>
          </div>
        ),
        cell: ({ getValue }) => (
          <div className="min-w-[80px] max-w-[120px]">
            {String(getValue() || "-")}
          </div>
        ),
        size: 124,
      },
      {
        accessorKey: "description",
        header: () => (
          <div className="text-start">
            <span className="font-bold text-xs sm:text-sm text-[#585858]">
              Descripción
            </span>
          </div>
        ),
        cell: ({ row, getValue }) => (
          <div className="flex items-center min-w-[150px] sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px]">
            {row.getCanExpand() ? (
              <button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: "pointer" },
                }}
                className="p-0.5 sm:p-1 hover:bg-gray-100 rounded flex-shrink-0 flex items-center gap-1"
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 text-gray-600",
                    row.getIsExpanded() ? "rotate-90" : ""
                  )}
                />

                <p
                  className={cn(
                    "text-xs sm:text-sm text-start",
                    row.getCanExpand()
                      ? "font-bold text-[#004F9F] underline cursor-pointer"
                      : ""
                  )}
                >
                  {getValue<string>() || "-"}
                </p>
              </button>
            ) : (
              <div> {getValue<string>() || "-"}</div>
            )}
          </div>
        ),
        size: 656,
      },
      {
        accessorKey: "balance",
        header: () => (
          <div className="text-center">
            <span className="font-bold text-xs sm:text-sm text-[#585858]">
              Saldo
            </span>
          </div>
        ),
        cell: ({ row }) => {
          const totalBalance = calculateTotalBalance(row.original);
          return (
            <div className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center">
              <span className="font-medium text-xs sm:text-sm">
                {totalBalance || "-"}
              </span>
            </div>
          );
        },
        size: 124,
      },
      {
        accessorKey: "quantity",
        header: () => (
          <div className="text-center">
            <span className="font-bold text-xs sm:text-sm text-[#585858]">
              Cantidad
            </span>
          </div>
        ),
        cell: ({ row }) => {
          const totalQuantity = calculateTotalQuantity(row.original);
          const isCompound = row.getCanExpand();
          const hasSubRows =
            !!row.original.subRows && row.original.subRows.length > 0;

          // Usar hasSubRows directamente en lugar de isCompound para debug
          if (hasSubRows) {
            // Para artículos compuestos, mostrar input editable para el padre
            return (
              <div className="flex items-center gap-1 sm:gap-2">
                <Input
                  type="number"
                  placeholder="1"
                  className="w-[80px] mx-auto h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={row.original.quantity || 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    handleParentQuantityChange(
                      row.original,
                      isNaN(value) ? 1 : value
                    );
                  }}
                />
              </div>
            );
          } else {
            // Para artículos simples, mostrar input editable
            return (
              <div className="w-full flex">
                <Input
                  type="number"
                  placeholder="Cantidad"
                  className="w-[80px] mx-auto h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={row.original.quantity || undefined}
                  onChange={(e) => {
                    if (e.target.value !== undefined) {
                      const value = parseInt(e.target.value, 10);
                      onUpdateQuantity?.(
                        row.original.id,
                        Math.max(1, isNaN(value) ? 1 : value)
                      );
                    }
                  }}
                />
              </div>
            );
          }
        },
        size: 124,
      },
      {
        id: "actions",
        header: () => (
          <div className="text-center">
            <span className="font-bold text-xs sm:text-sm text-[#585858]">
              Acciones
            </span>
          </div>
        ),
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
        size: 124,
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
      const canExpand =
        !!row.original.subRows && row.original.subRows.length > 0;
      return canExpand;
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });


  return (
    <div className="w-full">
      <div className="bg-[#f8fafc] rounded-xl p-1 sm:p-2 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
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
                    className="py-6 sm:py-8 text-center text-gray-400 bg-white text-xs sm:text-sm"
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
                          className="p-2 sm:p-3 text-xs sm:text-sm bg-white whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Subfilas insertadas directamente */}
                    {row.getIsExpanded() && renderSubComponentRows(row)}
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
