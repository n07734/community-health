import { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { withStyles } from '@mui/styles'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Theme } from '@mui/material/styles'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { format } from 'date-fns'

import { A } from '../shared/StyledTags'
import { ColumnKeys } from '../../types/Graphs';

type Params = { value?: string }
const zeroOut = {
    renderCell: (params: Params) => params.value || '0',
    sortComparator: (v1 = 0, v2 = 0) => v1 - v2,
}

const columnMap = {
    comments: {
        field: 'comments',
        headerName: 'All comments',
        flex: 1,
        ...zeroOut,
    },
    codeComments: {
        field: 'codeComments',
        headerName: 'Code comments',
        flex: 1,
        ...zeroOut,
    },
    generalComments: {
        field: 'generalComments',
        headerName: 'Review comments',
        flex: 1,
        ...zeroOut,
    },
    approvals: {
        field: 'approvals',
        headerName: 'Approvals',
        flex: 1,
        ...zeroOut,
    },
    prSize: {
        field: 'prSize',
        headerName: 'PR Size',
        flex: 1,
        ...zeroOut,
    },
    additions: {
        field: 'additions',
        headerName: 'PR additions',
        flex: 1,
        ...zeroOut,
    },
    deletions: {
        field: 'deletions',
        headerName: 'PR deletions',
        flex: 1,
        ...zeroOut,
    },
    age: {
        field: 'age',
        headerName: 'PR Age (days)',
        flex: 1,
    },
    mergedAt: {
        field: 'mergedAt',
        headerName: 'Date',
        flex: 1,
        renderCell: (params:Params) => format(new Date(params.value as string), 'do MMM yy'),
    },
    commentSentimentScore: {
        field: 'commentSentimentScore',
        headerName: 'To team',
        flex: 1,
        ...zeroOut,
    },
    commentAuthorSentimentScore: {
        field: 'commentAuthorSentimentScore',
        headerName: 'From team',
        flex: 1,
        ...zeroOut,
    },
    commentSentimentTotalScore: {
        field: 'commentSentimentTotalScore',
        headerName: 'Sentiment',
        flex: 1,
        ...zeroOut,
    },
    commentsGiven: {
        field: 'commentsGiven',
        headerName: 'Comments given',
        flex: 1,
        ...zeroOut,
    },
    url: {
        field: 'url',
        headerName: 'Link',
        flex: 1,
        renderCell: (params: Params) => {
            const url = params.value || ''
            const number = url.split('/').at(-1)
            return <A href={url}>
                {number}
            </A>
        },
    },
    author: {
        field: 'author',
        headerName: 'author',
        flex: 1,
    },
    growth: {
        field: 'prSize',
        headerName: 'PR Size',
        flex: 1,
        ...zeroOut,
    },
    repo: {
        field: 'repo',
        headerName: 'repo',
        flex: 1,
    },
    isBug: {
        field: 'isBug',
        headerName: 'Bug',
        flex: 1,
        renderCell: (params: Params) => params.value
            ? 'true'
            : 'false',
    },
}

export const makeColumns = (dataKeys: ColumnKeys[]) => {
    const allKeys: ColumnKeys[] = [
        ...dataKeys,
        'mergedAt',
        'url',
    ]

    const columns = allKeys
        .map((key) => columnMap[key])

    return columns
}

const selectedClass = (classes: Record<string, string>, selectedIndex: number, showTable = false) => (itemsIndex: number) => showTable && itemsIndex === selectedIndex
    ? `${classes.selected} ${showTable ? classes.hasTable : ''}`
    : classes.chunk

const ChunkIcon = ({
    classes = {},
    showTable = false,
}: { classes: Record<string, string>, showTable: boolean }) =>  showTable
    ? <RemoveCircleIcon className={classes.arrow} />
    : <AddCircleIcon className={classes.arrow} />

const ItemsTable = ({
    data = [],
    dataKeys = [],
    classes = {},
    tableOpenedByDefault = false,
}: {
    data: any[],
    dataKeys: ColumnKeys[],
    classes: Record<string, string>,
    tableOpenedByDefault?: boolean,
}) => {
    const [dataIndex, setIndex] = useState(data.length - 1);
    const [showTable, setShowTable] = useState(tableOpenedByDefault);

    const selectedClassFor = selectedClass(classes, dataIndex, showTable)

    const flatData = data.flat()
    const total = flatData.length

    const updatedData = total > 30
        ? data
        : [flatData]

    return <div className={classes.wrapper}>
        {
             updatedData.length > 0 && <div className={classes.bar}>
             {
                updatedData
                     .map((_item, i) => <div
                         key={i}
                         className={selectedClassFor(i)}
                         onClick={() => {
                             dataIndex === i
                                 && setShowTable(!showTable)

                             dataIndex !== i
                                 && !showTable
                                 && setShowTable(true)

                             setIndex(i)
                         }}
                     >
                         {
                             dataIndex === i
                                 ? <ChunkIcon showTable={showTable} classes={classes} />
                                 : <AddCircleIcon className={classes.arrow} />
                         }
                     </div>)
             }
         </div>
        }
        {
            (updatedData[dataIndex] || []).length > 0 && showTable &&
            <DataGrid
                sortingOrder={['desc', 'asc']}
                rows={updatedData[dataIndex]}
                columns={makeColumns(dataKeys)}
                initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                }}
                pageSizeOptions={[5]}
                autoPageSize={false}
                disableColumnFilter
                disableColumnMenu
                isRowSelectable={() => false}
                autoHeight={true}
            />
        }
    </div>
}

const chunksRules = {
    flexGrow: 1,
    marginRight: '4px',
    borderRadius: '8px',
}

const styles = (theme: Theme) => ({
    bar: {
        width: '100%',
        height: '30px',
        display: 'flex',
        paddingBottom: '4px',
        marginBottom: '0px',
        '& > div:last-child': {
            marginRight: '0px',
        },
    },
    'chunk': {
        ...chunksRules,
        position: 'relative',
        backgroundColor: theme.palette.secondary.main,
        cursor: 'pointer',
    },
    hasTable: {
        '&:before': {
            content: '""',
            display: 'block',
            width: '100%',
            height:'11px',
            position: 'absolute',
            bottom: '-5px',
            backgroundColor: theme.palette.primary.main,
        },
    },
    'selected': {
        ...chunksRules,
        cursor: 'pointer',
        backgroundColor: theme.palette.primary.main,
        position: 'relative',
        '&:after': {
            content: '""',
            display: 'block',
            width: '100%',
            height:'500px',
            position: 'absolute',
            bottom: '0px',
            zIndex: '-1',
            background: theme.palette.tableGraphGradient1,
            '@media (max-width: 768px)': {
                height: '400px',
                background: theme.palette.tableGraphGradient2,
            },
            '@media (max-width: 668px)': {
                height: '320px',
                background: theme.palette.tableGraphGradient3,
            },
        },
    },
    arrow: {
        fontSize: '25px',
        color: theme.palette.background.default,
        position: 'absolute',
        top: '3px',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    wrapper: {
        padding: '0 50px',
        marginBottom: theme.mySpacing.y.medium,
        maxWidth: '1100px',
        '& .MuiDataGrid-root': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
        },
        '& .MuiDataGrid-root .MuiDataGrid-columnHeaderWrapper > div.MuiDataGrid-cell:last-child:empty': {
            width: '0 !important',
            minWidth: '0 !important',
            maxWidth: '0 !important',
        },
        '& .MuiDataGrid-root .MuiDataGrid-columnHeader': {
            maxWidth: '100% !important',
            width: '100% !important',
        },
        '& .MuiDataGrid-root .MuiDataGrid-row > div.MuiDataGrid-cell:last-child:empty': {
            width: '0 !important',
            minWidth: '0 !important',
            maxWidth: '0 !important',
        },
        '& .MuiDataGrid-root .MuiDataGrid-cell--textLeft': {
            maxWidth: '100% !important',
            width: '100% !important',
        },
        "& .MuiDataGrid-renderingZone": {
            maxWidth: '100% !important',
            width: '100% !important',
        },
        '& .MuiDataGrid-root .MuiDataGrid-row': {
            maxWidth: '100% !important',
            width: '100% !important',
        },
    },
})

export default withStyles<any, any>(styles)(ItemsTable)
