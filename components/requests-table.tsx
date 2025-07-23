"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import RequestsHeader from "./requests-header";

interface AprobarData {
  id: number;
  idTransaction: string;
  type: string;
  alm_origen: string;
  alm_destino: string;
  project: string;
  created_by: string;
  created_at: string;
  status: string;
}

interface TableProps {
  type: "aprobar" | "alistar" | "entregar" | "recibir";
  data: AprobarData[];
  title: string;
}

function TableAprobar() {

  const columns = useMemo<ColumnDef<AprobarData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => {
          return (
            <Link
              href={`/solicitudes/aprobar/${row.original.id}`}
              className="text-blue-500 cursor-pointer underline"
            >
              {row.original.id}
            </Link>
          );
        },
      },
      {
        accessorKey: "idTransaction",
        header: "Transacción",
        cell: ({ row }) => {
          return <span>{row.original.idTransaction}</span>;
        },
      },
      {
        accessorKey: "type",
        header: "Tipo",
      },
      {
        accessorKey: "alm_origen",
        header: "Alm. Origen",
      },
      {
        accessorKey: "alm_destino",
        header: "Alm. Destino",
      },
      {
        accessorKey: "project",
        header: "Proyecto",
      },
      {
        accessorKey: "created_by",
        header: "Creado por",
        cell: ({ row }) => {
          return (
            <div className="flex flex-col s">
              <h1>{row.original.created_by}</h1>
              <p className="text-xs text-gray-500">{row.original.created_at}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          return (
            <Badge className="bg-[#D7B26F] p-2 rounded-xl text-white">
              {row.original.status}
            </Badge>
          );
        },
      },
    ],
    []
  );

  const data = [
    {
      id: 1245,
      idTransaction: "1234567890",
      type: "Solicitud de Material",
      alm_origen: "Centra",
      alm_destino: "Fortuna",
      project: "54354",
      created_by: "CABRENES",
      created_at: "2025-01-01",
      status: "Por Aprobar",
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 5, 12),
    to: new Date(2025, 6, 15),
  });

  // Función para formatear el rango de fechas
  const formatDateRange = (range: DateRange | undefined): string => {
    if (!range?.from) return "Seleccionar rango de fechas";
    if (!range.to) return format(range.from, "dd/MM/yyyy");
    if (range.from.getTime() === range.to.getTime()) return format(range.from, "dd/MM/yyyy");
    return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
  };

  return (
    <div className="bg-[#fdfdfd] border border-[#e6edf5] p-4 rounded-md shadow-md space-y-4">
      <div className="space-y-2 mb-4">
        <h1 className="text-lg font-bold">Aprobar Solicitud</h1>
        <p className="text-sm text-gray-500">
          Aquí puedes aprobar las solicitudes de materiales.
        </p>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Input className="max-w-sm" />
          <Button className="bg-gradient-to-b from-[#004F9F] to-[#003871] text-white cursor-pointer">
            Buscar
          </Button>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-64 justify-between font-normal"
              >
                {formatDateRange(dateRange)}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <RequestsHeader />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs sm:text-sm whitespace-nowrap bg-[#f6f6f6] "
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
        <TableBody className="bg-white rounded-b-md">
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TableAprobar;
