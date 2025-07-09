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
}

interface CreateTransferTableProps {
  onAddArticle?: (article: {
    id: string;
    code: string;
    name: string;
    quantity: number;
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
      },
      { location: "	2-2100", batch: "GRAPA CONEXION A VARILLA", available: 50 },
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
    subRows: [{ location: "Patio Exterior", batch: "LOTE-P01", available: 14 }],
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

const renderSubComponent = ({ row }: { row: Row<Item> }) => {
  return (
    <Table>
      <TableBody>
        {row.original.subRows?.map((detail, index) => (
          <TableRow key={index}>
            <TableCell /> {/* Checkbox/expand: vacío */}
            <TableCell>{detail.location}</TableCell> {/* Código */}
            <TableCell>{detail.batch}</TableCell> {/* Descripción */}
            <TableCell>-</TableCell> {/* Saldo: guion */}
            <TableCell>
              {/* Cantidad: alineado igual que el input, pero solo texto */}
              <span className="block w-full text-center">{detail.available}</span>
            </TableCell>
            <TableCell /> {/* Acciones: vacío */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

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

  const columns: ColumnDef<Item>[] = [
    {
      id: "select-expand",
      header: ({ table }) => (
        <div className="flex items-center justify-center mr-3">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="text-center"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Código",
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-2">
          {row.getCanExpand() ? (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
              }}
              className="p-1"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  row.getIsExpanded() ? "rotate-90" : ""
                )}
              />
            </button>
          ) : (
            <p></p>
          )}
          <p
            className={`${
              row.getCanExpand() ? "font-bold text-[#004F9F] underline" : ""
            }`}
          >
            {getValue<string>()}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Saldo",
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return value === null ? "-" : value;
      },
    },
    {
      id: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <Input
          type="number"
          placeholder="Cantidad"
          className="w-26"
          min={0}
          value={quantities[row.original.id] || ""}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setQuantities((q) => ({
              ...q,
              [row.original.id]: isNaN(value) ? 1 : value,
            }));
          }}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          className="bg-gradient-to-b from-[#1A8754] to-[#17784B] hover:bg-green-700"
          disabled={quantities[row.original.id] < 0 || quantities[row.original.id] === undefined || quantities[row.original.id] === 0}
          onClick={() => {
            if (onAddArticle) {
              onAddArticle({
                id: row.original.id,
                code: row.original.code,
                name: row.original.name,
                quantity: quantities[row.original.id] || 1,
              });
              toast.success("Artículo agregado correctamente", {
                description: (
                  <p className="text-sm text-[#1A8754]">
                    El artículo ha sido agregado correctamente al detalle de la
                    solicitud.
                  </p>
                ),
                position: "top-right",
                duration: 3000,
                icon: <CheckCircleIcon className="w-4 h-4 text-[#1A8754]" />,
              });
            }
          }}
        >
          <PlusIcon />
        </Button>
      ),
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
    <div className="w-full space-y-4 px-10">
      <h2 className="text-xl font-bold">Artículos en el Almacén</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Código, descripción, ubicación"
            className="pl-10 bg-white max-w-md"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Button
          className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white px-6"
          onClick={() => table.setGlobalFilter(globalFilter)}
        >
          Buscar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent w-full sm:w-auto justify-center bg-white"
            >
              <Filter className="h-4 w-4" />
              <span>{sortDescription}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => applySort([], "Filtrar catálogo")}
            >
              Quitar filtro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                applySort(
                  [{ id: "description", desc: false }],
                  "Descripción (A-Z)"
                )
              }
            >
              Descripción (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                applySort(
                  [{ id: "description", desc: true }],
                  "Descripción (Z-A)"
                )
              }
            >
              Descripción (Z-A)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                applySort(
                  [{ id: "balance", desc: true }],
                  "Saldo (Mayor a menor)"
                )
              }
            >
              Saldo (Mayor a menor)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                applySort(
                  [{ id: "balance", desc: false }],
                  "Saldo (Menor a mayor)"
                )
              }
            >
              Saldo (Menor a mayor)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border bg-[#FFFFFF]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="text-[#64748B]">
          Mostrando {table.getRowModel().rows.length} de {data.length} artículos
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-[#64748B]">
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
