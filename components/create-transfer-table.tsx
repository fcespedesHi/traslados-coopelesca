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
  description: string;
  balance: number | null;
  subRows?: ItemDetail[]; // Sub-filas para detalles
}

interface ItemDetail {
  location: string;
  batch: string;
  available: number;
  quantity: number; // Cantidad requerida para cada sub-item
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
    subRows?: ItemDetail[];
  }) => void;
}

// Datos de ejemplo
const makeData = (): Item[] => [
  {
    id: "1",
    code: "2-1065",
    name: "2-1065",
    description: "GANCHO S PARA HERRAJE DE...",
    balance: 96,
  },
  {
    id: "2",
    code: "2-2100",
    name: "2-2100",
    description: "VM2_11_2",
    balance: null,
    subRows: [
      {
        location: "2-2100",
        batch: "GRAPA DE HORQUILLA, CERCA DE 1 1/4 X 9",
        available: 50,
        quantity: 0, // Se inicializará con defaultQuantity
        defaultQuantity: 14,
      },
      { 
        location: "2-2100", 
        batch: "GRAPA CONEXION A VARILLA", 
        available: 50,
        quantity: 0, // Se inicializará con defaultQuantity
        defaultQuantity: 6,
      },
    ],
  },
  {
    id: "3",
    code: "2-2140",
    name: "2-2140",
    description: "POSTES DE MADERA 25 PIES,...",
    balance: 125,
  },
  {
    id: "4",
    code: "2-2150",
    name: "2-2150",
    description: "POSTES DE MADERA 30 PIES,...",
    balance: 14,
    subRows: [{ 
      location: "Patio Exterior", 
      batch: "LOTE-P01", 
      available: 14,
      quantity: 0, // Se inicializará con defaultQuantity
      defaultQuantity: 2,
    }],
  },
  {
    id: "5",
    code: "2-2340",
    name: "2-2340",
    description: "REGULADOR DE VOLTAGE 100...",
    balance: 3,
  },
  {
    id: "6",
    code: "2-2500",
    name: "2-2500",
    description: "VARILLA CONEXION A TIERRA...",
    balance: 2,
  },
  {
    id: "7",
    code: "2-2647",
    name: "2-2647",
    description: "TUBO HG DE 2 PULGADAS (1.5...",
    balance: 7,
  },
];

export function CreateTransferTable({
  onAddArticle,
}: CreateTransferTableProps) {
  const [data] = React.useState(() => makeData());
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [sortDescription, setSortDescription] =
    React.useState("Filtrar catálogo");
  // Estado para cantidades por fila
  const [quantities, setQuantities] = React.useState<{ [id: string]: number }>(
    {}
  );
  // Estado para selección de sub-filas
  const [subRowSelection, setSubRowSelection] = React.useState<{ [key: string]: boolean }>({});

  const handleSelectAll = (rowId: string, subRows: ItemDetail[], checked: boolean) => {
    const newSelection: { [key: string]: boolean } = {};
    subRows.forEach((_, index) => {
      newSelection[`${rowId}-${index}`] = checked;
    });
    setSubRowSelection(prev => ({
      ...prev,
      ...newSelection
    }));
  };

  const handleSelectSubRow = (rowId: string, subRowIndex: number, checked: boolean) => {
    const key = `${rowId}-${subRowIndex}`;
    setSubRowSelection(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const renderSubComponent = ({ row }: { row: Row<Item> }) => {
    const allSubRowsSelected = row.original.subRows?.every((_, index) => 
      subRowSelection[`${row.original.id}-${index}`]
    ) || false;

    const someSubRowsSelected = row.original.subRows?.some((_, index) => 
      subRowSelection[`${row.original.id}-${index}`]
    ) || false;

    return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-5">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700 w-[50px] sm:w-[60px] text-xs sm:text-sm">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={allSubRowsSelected}
                      ref={(el) => {
                        if (el) {
                          const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                          if (input) input.indeterminate = someSubRowsSelected && !allSubRowsSelected;
                        }
                      }}
                      onCheckedChange={(checked) => row.original.subRows && handleSelectAll(row.original.id, row.original.subRows, !!checked)}
                      aria-label="Select all sub-items"
                      className="h-3 w-3 sm:h-4 sm:w-4"
                    />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[80px] sm:w-[100px] md:w-[120px] text-xs sm:text-sm">ID</TableHead>
                <TableHead className="font-semibold text-gray-700 w-[200px] sm:w-[250px] md:w-[300px] lg:w-[320px] text-xs sm:text-sm">Descripción</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-[100px] sm:w-[120px] md:w-[150px] text-xs sm:text-sm">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {row.original.subRows?.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center w-[50px] sm:w-[60px] min-w-[50px] sm:min-w-[60px] max-w-[50px] sm:max-w-[60px] p-2 sm:p-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={subRowSelection[`${row.original.id}-${index}`] || false}
                        onCheckedChange={(checked) => handleSelectSubRow(row.original.id, index, !!checked)}
                        aria-label={`Select sub-item ${index + 1}`}
                        className="h-3 w-3 sm:h-4 sm:w-4"
                      />
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
                  <TableCell className="text-center w-[100px] sm:w-[120px] md:w-[150px] min-w-[100px] sm:min-w-[120px] md:min-w-[150px] max-w-[100px] sm:max-w-[120px] md:max-w-[150px] p-2 sm:p-3">
                    <span className="inline-flex items-center justify-center min-w-[30px] sm:min-w-[35px] md:min-w-[40px] px-1 sm:px-2 py-1 rounded-md text-xs sm:text-sm font-medium">
                      {detail.defaultQuantity || 1}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const columns: ColumnDef<Item>[] = [
    {
      id: "select-expand",
      header: ({ table }) => (
        <div className="flex items-center justify-center mr-1 sm:mr-2 md:mr-3">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="text-center h-3 w-3 sm:h-4 sm:w-4"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
            className="h-3 w-3 sm:h-4 sm:w-4"
          />
        </div>
      ),
      size: 50,
    },
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ getValue }) => (
        <div className="min-w-[60px] sm:min-w-[80px] md:min-w-[100px] lg:min-w-[120px] max-w-[60px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[120px] truncate text-xs sm:text-sm">
          {getValue<string>()}
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
              className="p-0.5 sm:p-1 flex-shrink-0"
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200",
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
              row.getCanExpand() ? "font-bold text-[#004F9F] underline" : ""
            )}
          >
            {getValue<string>()}
          </p>
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: "balance",
      header: "Saldo",
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return (
          <div className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center text-xs sm:text-sm">
            {value === null ? "-" : value}
          </div>
        );
      },
      size: 80,
    },
    {
      id: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="min-w-[80px] sm:min-w-[90px] md:min-w-[100px]">
          <Input
            type="number"
            placeholder="1"
            className="w-full min-w-[60px] sm:min-w-[70px] md:min-w-[80px] max-w-[80px] sm:max-w-[100px] md:max-w-[120px] h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
            min={1}
            value={quantities[row.original.id] || ""}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setQuantities((q) => ({
                ...q,
                [row.original.id]: Math.max(1, isNaN(value) ? 1 : value),
              }));
            }}
          />
        </div>
      ),
      size: 120,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="min-w-[50px] sm:min-w-[60px] md:min-w-[80px] flex justify-center">
          <Button
            className="bg-gradient-to-b from-[#1A8754] to-[#17784B] hover:bg-green-700 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-1 sm:p-1.5 md:p-2"
            disabled={quantities[row.original.id] < 1 || quantities[row.original.id] === undefined}
            onClick={() => {
              if (onAddArticle) {
                const selectedQuantity = Math.max(1, quantities[row.original.id] || 1);
                
                // Si es un producto compuesto, inicializar las cantidades de los hijos
                let processedSubRows = row.original.subRows;
                if (row.original.subRows && row.original.subRows.length > 0) {
                  processedSubRows = row.original.subRows.map(subRow => ({
                    ...subRow,
                    quantity: subRow.defaultQuantity || 1, // Forzar que quantity = defaultQuantity
                    defaultQuantity: subRow.defaultQuantity || 1,
                  }));
                }

                const articleToAdd = {
                  id: row.original.id,
                  code: row.original.code,
                  name: row.original.name,
                  description: row.original.description,
                  balance: row.original.balance,
                  quantity: selectedQuantity,
                  subRows: processedSubRows,
                };
                console.log('Adding article with subRows:', articleToAdd);
                onAddArticle(articleToAdd);
                toast.success("Artículo agregado correctamente", {
                  description: (
                    <p className="text-xs sm:text-sm text-[#1A8754]">
                      El artículo ha sido agregado correctamente al detalle de la
                      solicitud.
                    </p>
                  ),
                  position: "top-right",
                  duration: 3000,
                  icon: <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#1A8754]" />,
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

  return (
    <div className="w-full space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-2 md:px-4 lg:px-6 xl:px-10">
      <h2 className="text-base sm:text-lg md:text-xl font-bold">Artículos en el Almacén</h2>
      
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
      </div>

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

      {/* Tabla con scroll */}
      <div className="rounded-md border bg-[#FFFFFF] overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs sm:text-sm whitespace-nowrap">
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
                      <TableCell key={cell.id} className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
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
      </div>
    </div>
  );
}
