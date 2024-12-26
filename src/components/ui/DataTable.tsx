import { useState } from 'react'
import format from 'date-fns/format'
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
        'asc': <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4"
        >
            <path d="m5 12 7-7 7 7"></path>
            <path d="M12 19V5"></path>
        </svg>,
        'desc': <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4"
        >
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
        </svg>,
        'none': <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4"
        >
            <path d="m21 16-4 4-4-4"></path>
            <path d="M17 20V4"></path>
            <path d="m3 8 4-4 4 4"></path>
            <path d="M7 4v16"></path>
        </svg>,
    }[sort]

    return ArrowComponent
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
        accessorKey: 'comments',
        header: header('Comments'),
        cell: ({ row }) => {
            const value:number = row.getValue('comments')

            return value || 0;
        },
    },
    {
        accessorKey: 'approvals',
        header: header('Approvals'),
        cell: ({ row }) => {
            const value:number = row.getValue('approvals')

            return value || 0;
        },
    },
    {
        accessorKey: 'commentSentimentScore',
        header: header('Sentiment received'),
        cell: ({ row }) => {
            const value:number = row.getValue('commentSentimentScore')

            return value || 0;
        },
    },
    {
        accessorKey: 'commentAuthorSentimentScore',
        header: header('Sentiment given'),
        cell: ({ row }) => {
            const value:number = row.getValue('commentAuthorSentimentScore')

            return value || 0;
        },
    },
    {
        accessorKey: 'commentSentimentTotalScore',
        header: header('Sentiment'),
        cell: ({ row }) => {
            const value:number = row.getValue('commentSentimentTotalScore')

            return value || 0;
        },
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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <path d="m15 18-6-6 6-6"></path>
                    </svg>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <path d="m9 18 6-6-6-6"></path>
                    </svg>
                </Button>
            </div>
        </div>

    )
}
