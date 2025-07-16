import React, { useEffect } from "react";
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


  useEffect(() => {
    articles.forEach(article => {
      if (article.subRows) {
        article.subRows.forEach((subRow, index) => {
          if (!subRow.quantity || subRow.quantity === 1) {
            onUpdateQuantity?.(article.id, subRow.defaultQuantity || 1, index);
          }
        });
      }
    });
  }, [articles, onUpdateQuantity]);

 

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
    if (!article.subRows || article.subRows.length === 0) {
      // Para artículos simples, solo actualizar la cantidad
      onUpdateQuantity?.(article.id, Math.max(1, newQuantity));
      return;
    }

    // Para artículos compuestos
    const parentQuantity = Math.max(1, newQuantity);
    
    // Actualizar la cantidad del padre
    onUpdateQuantity?.(article.id, parentQuantity);

    // Actualizar las cantidades de los hijos basándose en sus cantidades por defecto
    article.subRows.forEach((subRow, index) => {
      const defaultQuantity = subRow.defaultQuantity || 1;
      const newChildQuantity = Math.max(1, defaultQuantity * parentQuantity);
      onUpdateQuantity?.(article.id, newChildQuantity, index);
    });
  }, [onUpdateQuantity]);



  const renderSubComponent = ({ row }: { row: Row<Article> }) => {
    return (
      <div className="bg-gray-50">
        {row.original.subRows?.map((detail, index) => (
          
          <div
            key={index}
            className="flex items-center border-b border-gray-100 hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            {/* Checkbox - alineado con la primera columna */}
            <div className="w-[50px] px-3 py-3 flex items-center justify-center">
              <div className="w-4 h-4" />
            </div>
  
            {/* Código - alineado con la segunda columna */}
            <div className="w-[120px] px-3 py-[10px] leading-snug">
              <span className="ml-6 font-medium">{detail.available}</span>
            </div>
  
            {/* Descripción - alineado con la tercera columna */}
            <div className="w-[400px] px-3 py-[10px] leading-snug">
              <div className="flex items-center gap-2">
                <div className="w-6" />
                <p className="truncate max-w-[360px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {detail.batch}
                </p>
              </div>
            </div>
  
            {/* Saldo - alineado con la cuarta columna */}
            <div className="w-[100px] px-3 py-[10px] leading-snug">
              <span className="font-medium">{detail.available}</span>
            </div>
  
            {/* Cantidad - alineado con la quinta columna */}
            <div className="w-[150px] px-3 py-[10px] leading-snug">
              <Input
                type="number"
                placeholder="0"
                className="w-20 h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            </div>
  
            {/* Acciones - alineado con la sexta columna */}
            <div className="w-[80px] px-3 py-[10px] leading-snug">
              <div className="w-8 h-8" />
            </div>
          </div>
        ))}
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
          <div className="flex items-center gap-2 min-w-[200px] max-w-[300px]">
            {row.getCanExpand() ? (
              <button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: "pointer" },
                }}
                className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 text-gray-600",
                    row.getIsExpanded() ? "rotate-90" : ""
                  )}
                />
              </button>
            ) : (
              <div className="w-6 flex-shrink-0"></div>
            )}
            <p
              className={cn(
                "truncate",
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
            <div className="min-w-[60px] text-center">
              <span className="font-medium">{totalBalance || "-"}</span>
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
          
          console.log('Row data:', row.original);
          console.log('Is compound:', isCompound);
          console.log('Has subRows:', hasSubRows);
          console.log('SubRows length:', row.original.subRows?.length);

          // Usar hasSubRows directamente en lugar de isCompound para debug
          if (hasSubRows) {
            // Para artículos compuestos, mostrar input editable para el padre
            return (
              <div className="min-w-[100px] flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="1"
                  className="w-full min-w-[80px] max-w-[120px] h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
              <div className="min-w-[100px]">
                <Input
                  type="number"
                  placeholder="1"
                  className="w-full min-w-[80px] max-w-[120px] h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
          <div className="min-w-[60px] flex justify-center">
            <Button
              size="icon"
              className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white hover:from-[#B91C1C] hover:to-[#991B1B]"
              onClick={() => onRemove?.(row.original.id)}
            >
              <Trash2 className="w-4 h-4 text-white" />
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
      console.log('getRowCanExpand for row:', row.original.id, 'canExpand:', canExpand);
      return canExpand;
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="p-4 border-b font-bold">Detalle de Transacción</div>
      <div className="bg-[#f8fafc] rounded-xl p-2 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
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
                  className="py-8 text-center text-gray-400 text-sm"
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
                        style={{ width: cell.column.getSize() }}
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
  );
}

export default RequestItemsDetail;
