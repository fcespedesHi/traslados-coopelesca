"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ExpandedState,
  type Row,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import {
  CheckCircleIcon,
  ChevronRight,
  Filter,
  PlusIcon,
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Definición del tipo de dato para un artículo
interface Item {
  id: string;
  code: string;
  name: string;
  description?: string; // Opcional para compatibilidad con JSON
  balance: number | null;
  subRows?: ItemDetail[]; // Sub-filas para detalles
}

interface ItemDetail {
  id: string;
  name: string;
  available: number;
  quantity?: number; // Cantidad requerida para cada sub-item (opcional)
  defaultQuantity?: number; // Cantidad por defecto para este sub-item
}

interface CreateTransferTableProps {
  onAddArticle?: (article: {
    id: string;
    code: string;
    name: string;
    description: string;
    balance: number | null;
    quantity: number;
    subRows?: Array<{
      id: string;
      name: string;
      available: number;
      quantity: number;
      defaultQuantity?: number;
    }>;
  }) => void;
}

// Datos de ejemplo
import data from "@/lib/products_example.json";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export function CreateTransferTable({
  onAddArticle,
}: CreateTransferTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [sortDescription, setSortDescription] =
    React.useState("Filtrar catálogo");
  // Estado para cantidades por fila
  const [quantities, setQuantities] = React.useState<{
    [id: string]: number | undefined;
  }>({});
  // Estado para selección de sub-filas
  const [subRowSelection, setSubRowSelection] = React.useState<{
    [key: string]: boolean;
  }>({});
  // Estado para cantidades de sub-items
  const [subItemQuantities, setSubItemQuantities] = React.useState<{
    [key: string]: number;
  }>({});

  // Memoizar la inicialización de cantidades por defecto
  const defaultQuantities = React.useMemo(() => {
    const quantities: { [key: string]: number } = {};
    data.forEach((item) => {
      if (item.subRows) {
        item.subRows.forEach((subRow, index) => {
          const key = `${item.id}-${index}`;
          quantities[key] = subRow.defaultQuantity || 1;
        });
      }
    });
    return quantities;
  }, []); // Sin dependencias para que se calcule solo una vez

  const renderSubComponentRows = (row: Row<Item>) => {
    return row.original.subRows?.map((detail, index) => (
      <TableRow key={`${row.id}-subrow-${index}`} className="bg-gray-50">
        {/* Código */}
        <TableCell className="min-w-[80px] max-w-[120px] text-xs sm:text-sm">
          <div className="flex justify-start items-center w-full px-1">
            {detail.id}
          </div>
        </TableCell>

        {/* Descripción */}
        <TableCell className="min-w-[150px] sm:min-w-[200px] md:min-w-[250px] lg:min-w-[300px] max-w-[300px] text-xs sm:text-sm">
          <div className="flex flex-col">
            <span className="truncate font-medium text-gray-700">
              {detail.name}
            </span>
          </div>
        </TableCell>

        {/* Saldo */}
        <TableCell className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center text-xs sm:text-sm">
          {detail.available}
        </TableCell>

        {/* Cantidad */}
        <TableCell className="min-w-[80px] sm:min-w-[90px] md:min-w-[100px] text-xs sm:text-sm">
          <p className="text-center">{defaultQuantities[`${row.original.id}-${index}`]}</p>
        </TableCell>

        {/* Acciones */}
        <TableCell className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] flex justify-center">
          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-1 sm:p-1.5 md:p-2" />
        </TableCell>
      </TableRow>
    ));
  };

  const columns: ColumnDef<Item>[] = [
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
      accessorKey: "name",
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
            <div> {getValue<string>() || ""}</div>
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
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return (
          <div className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center">
            <span className="font-medium text-xs sm:text-sm">
              {value || "-"}
            </span>
          </div>
        );
      },
      size: 124,
    },
    {
      id: "quantity",
      header: () => (
        <div className="text-center">
          <span className="font-bold text-xs sm:text-sm text-[#585858]">
            Cantidad
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <Input
            type="number"
            className="w-[80px] mx-auto h-7 sm:h-8 md:h-9 text-xs sm:text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            min={1}
            value={quantities[row.original.id]}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (inputValue === "" || inputValue === "0") {
                // Permitir estado vacío temporalmente
                setQuantities((q) => ({
                  ...q,
                  [row.original.id]: undefined,
                }));
              } else {
                const value = parseInt(inputValue, 10);
                if (!isNaN(value) && value >= 1) {
                  setQuantities((q) => ({
                    ...q,
                    [row.original.id]: value,
                  }));
                }
              }
            }}
          />
        </div>
      ),
      size: 120,
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
            className="bg-gradient-to-b from-[#1A8754] to-[#17784B] hover:bg-green-700 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-1 sm:p-1.5 md:p-2"
            disabled={
              !quantities[row.original.id] ||
              (quantities[row.original.id] ?? 0) < 1
            }
            onClick={() => {
              if (onAddArticle) {
                const selectedQuantity = Math.max(
                  1,
                  quantities[row.original.id] ?? 1
                );

                // Si es un producto compuesto, inicializar las cantidades de los hijos
                let processedSubRows:
                  | Array<{
                      id: string;
                      name: string;
                      available: number;
                      quantity: number;
                    }>
                  | undefined = undefined;

                if (row.original.subRows && row.original.subRows.length > 0) {
                  processedSubRows = row.original.subRows.map(
                    (subRow, index) => {
                      const key = `${row.original.id}-${index}`;
                      const currentQuantity = subItemQuantities[key];
                      const defaultQuantity = defaultQuantities[key];
                      const baseQuantity =
                        currentQuantity || defaultQuantity || 1;

                      // Multiplicar la cantidad base por la cantidad del producto padre
                      const finalQuantity = baseQuantity * selectedQuantity;

                      return {
                        id: subRow.id,
                        name: subRow.name,
                        available: subRow.available,
                        quantity: finalQuantity,
                        defaultQuantity: defaultQuantity || 1, // Incluir defaultQuantity
                      };
                    }
                  );
                }

                const articleToAdd = {
                  id: row.original.id,
                  code: row.original.code,
                  name: row.original.name,
                  description: row.original.description || row.original.name,
                  balance: row.original.balance,
                  quantity: selectedQuantity,
                  subRows: processedSubRows,
                };
                onAddArticle(articleToAdd);
                toast.success("Artículo agregado correctamente", {
                  description: (
                    <p className="text-xs sm:text-sm text-[#1A8754]">
                      El artículo ha sido agregado correctamente al detalle de
                      la solicitud.
                    </p>
                  ),
                  position: "top-right",
                  duration: 3000,
                  icon: (
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#1A8754]" />
                  ),
                });
              }
            }}
          >
            <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      ),
      size: 80,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      expanded,
      globalFilter,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getRowCanExpand: (row) =>
      !!row.original.subRows && row.original.subRows.length > 0,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const applySort = (sort: SortingState, description: string) => {
    setSorting(sort);
    setSortDescription(description);
  };

  const tableQuantities = [
    { id: "10", name: "10" },
    { id: "25", name: "25" },
    { id: "50", name: "50" },
    { id: "100", name: "100" },
  ];

  return (
    <div className="w-full space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-2 md:px-4 lg:px-6 xl:px-10">
      <h2 className="text-base sm:text-lg md:text-xl font-bold">
        Artículos en el Almacén
      </h2>

      {/* Filtros responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            placeholder="Código, descripción, ubicación"
            className="pl-8 sm:pl-10 bg-white w-full text-xs sm:text-sm h-8 sm:h-9 md:h-10"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Button
          className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white px-3 sm:px-4 md:px-6 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 md:h-10"
          onClick={() => table.setGlobalFilter(globalFilter)}
        >
          Buscar
        </Button>
        {/* Dropdown de filtros */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-between text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4"
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate ml-1 sm:ml-2">{sortDescription}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full sm:w-auto">
              <DropdownMenuItem
                onClick={() =>
                  applySort(
                    [
                      {
                        id: "code",
                        desc: false,
                      },
                    ],
                    "Código (A-Z)"
                  )
                }
              >
                Código (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  applySort(
                    [
                      {
                        id: "code",
                        desc: true,
                      },
                    ],
                    "Código (Z-A)"
                  )
                }
              >
                Código (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  applySort(
                    [
                      {
                        id: "description",
                        desc: false,
                      },
                    ],
                    "Descripción (A-Z)"
                  )
                }
              >
                Descripción (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  applySort(
                    [
                      {
                        id: "description",
                        desc: true,
                      },
                    ],
                    "Descripción (Z-A)"
                  )
                }
              >
                Descripción (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  applySort(
                    [
                      {
                        id: "balance",
                        desc: false,
                      },
                    ],
                    "Saldo (Menor a Mayor)"
                  )
                }
              >
                Saldo (Menor a Mayor)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  applySort(
                    [
                      {
                        id: "balance",
                        desc: true,
                      },
                    ],
                    "Saldo (Mayor a Menor)"
                  )
                }
              >
                Saldo (Mayor a Menor)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabla con scroll interno */}
      <div className="rounded-md border bg-[#FFFFFF] overflow-auto">
        <div
          className="overflow-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{
            height: "400px",
            maxHeight: "400px",
          }}
        >
          <Table className="min-w-full relative">
            <TableHeader className="sticky top-0 bg-white z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(row.getIsExpanded() && "border-b-0")}
                  >
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
                  {row.getIsExpanded() && renderSubComponentRows(row)}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
        <div className="text-[#64748B] text-center sm:text-left text-xs sm:text-sm">
          Mostrando {table.getRowModel().rows.length} de {data.length} artículos
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">Ant</span>
          </Button>
          <span className="text-[#64748B] px-1 sm:px-2 text-xs sm:text-sm whitespace-nowrap">
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="sm:hidden">Sig</span>
          </Button>
        </div>
        <div className="bg-white p-1 rounded-md">
          <ToggleGroup type="single" defaultValue={tableQuantities[0].id}>
            {tableQuantities.map((qt) => (
              <ToggleGroupItem key={qt.id} className="rounded-md" value={qt.id}>
                {qt.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
