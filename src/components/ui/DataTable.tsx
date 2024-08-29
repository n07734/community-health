import { useState } from 'react'
import { format } from 'date-fns'
import {
    ColumnDef,
    SortingColumn,
    SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    HeaderGroup,
} from '@tanstack/react-table'

import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react'

import { TableData } from '@/types/Graphs'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'

type Sort = 'asc' | 'desc' | 'none'
const Arrow = ({ sort }: { sort: Sort}) => {
    const ArrowComponent = {
        'asc': ArrowUp,
        'desc': ArrowDown,
        'none': ArrowUpDown,
    }[sort]

    return <ArrowComponent className="ml-2 h-4 w-4" />
}

// eslint-disable-next-line react/display-name
const header = (title: string) => ({ column }: { column: SortingColumn<TableData> }) => {
    const sort = column.getIsSorted() || 'none'

    return (
        <Button
            variant="link"
            className="p-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {title}
            <Arrow sort={sort} />
        </Button>
    )
}

const allColumns: ColumnDef<TableData>[] = [
    {
        accessorKey: 'age',
        header: header('PR Age (days)'),
    },
    {
        accessorKey: 'prSize',
        header: header('PR Size'),
    },
    {
        accessorKey: 'author',
        header: header('Author'),
    },
    {
        accessorKey: 'mergedAt',
        header: header('Date'),
        cell: ({ row }) => {
            const value:string = row.getValue('mergedAt')

            return format(new Date(value), 'do MMM yy')
        },
    },
    {
        accessorKey: 'url',
        header: header('Link'),
        cell: ({ row }) => {
            const url:string = row.getValue('url')
            const number = url.split('/').at(-1)

            return <a className="text-primary" href={url}>
                {number}
            </a>
        },
    },
]

type DataTableProps = {
    dataKeys: string[]
    data: TableData[]
    addClass?: string
}

export const DataTable = ({
    dataKeys,
    data,
    addClass = '',
}: DataTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 4,
    });

    const allDataKeys = [
        ...dataKeys,
        'mergedAt',
        'url',
    ]

    const columns:ColumnDef<TableData>[] = allColumns
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((column) => allDataKeys.includes((column as any).accessorKey))

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination,
        },
    })

    return (
        <div className={`rounded-md border-2 border-primary mx-50 ${addClass}`}>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup:HeaderGroup<TableData>) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex items-center justify-end space-x-2 p-4">
                <p>{pagination.pageIndex + 1} of {table.getPageCount()}</p>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

    )
}
