import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Article {
  id: string;
  code: string;
  name: string;
  description?: string;
  balance?: number | null;
  quantity: number;
}

interface Props {
  articles: Article[];
  onRemove?: (id: string) => void;
}

function RequestItemsDetail({ articles, onRemove }: Props) {
  // Columnas de la tabla
  const columns = React.useMemo<ColumnDef<Article>[]>(
    () => [
      {
        id: "select",
        header: () => <Checkbox disabled />,
        cell: () => <Checkbox disabled />,
      },
      {
        accessorKey: "code",
        header: "Código",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "balance",
        header: "Saldo",
        cell: ({ getValue }) => getValue() ?? "-",
      },
      {
        accessorKey: "quantity",
        header: "Cantidad",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <Button
            size="icon"
            className="bg-linear-to-b from-[#DC2626] to-[#C11F1F] text-white"
            onClick={() => onRemove?.(row.original.id)}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>
        ),
      },
    ],
    [onRemove]
  );

  const table = useReactTable({
    data: articles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="p-4 border-b font-bold">Detalle de Transacción</div>
      <div className="bg-[#f8fafc] rounded-xl p-2">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-sm font-semibold text-gray-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-gray-400 text-sm">
                  No se han añadido artículos a tu lista.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="bg-white">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2 border-b border-gray-100 text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestItemsDetail;
