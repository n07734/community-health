import { DataGrid } from '@mui/x-data-grid'
import { withStyles } from '@mui/styles'

import { format } from 'date-fns'

import { A } from '../shared/StyledTags'

const zeroOut = {
    renderCell: (params) => params.value || '0',
    sortComparator: (v1 = 0, v2 = 0) => v1 - v2,
}

const columnMap = {
    comments: {
        field: 'comments',
        headerName: 'Comments',
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
        headerName: 'Size',
        flex: 1,
        ...zeroOut,
    },
    additions: {
        field: 'additions',
        headerName: 'Additions',
        flex: 1,
        ...zeroOut,
    },
    deletions: {
        field: 'deletions',
        headerName: 'Deletions',
        flex: 1,
        ...zeroOut,
    },
    age: {
        field: 'age',
        headerName: 'Age',
        flex: 1,
    },
    mergedAt: {
        field: 'mergedAt',
        headerName: 'Merged',
        flex: 1,
        renderCell: (params) => format(new Date(params.value), 'do MMM yy'),
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
        renderCell: (params) => {
            const url = params.value
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
        renderCell: (params) => params.value
            ? 'true'
            : 'false',
    },
}

export const makeColumns = dataKeys => {
    const allkeys = [
        ...dataKeys,
        ...['mergedAt', 'url'],
    ]

    const columns = allkeys
        .map(key => columnMap[key])

    return columns
}

const SingleTable = ({
    data = [],
    dataKeys = [],
    classes = {},
} = {}) => {
    return <div className={classes.wrapper}>
        <DataGrid
            id={`table-single`}
            sortingOrder={['desc', 'asc']}
            rows={data}
            columns={makeColumns(dataKeys)}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableColumnFilter
            disableColumnMenu
            isRowSelectable={() => false}
            autoHeight={true}
        />
    </div>
}

const chunksRules = {
    flexGrow: 1,
    marginRight: '4px',
    borderRadius: '8px',
}

const styles = theme => ({
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
            background: 'linear-gradient(0deg, rgba(232,37,115,.12) 16%,rgba(232,37,115,.40) 16%, rgba(232,37,115,0) 90%)',
            '@media (max-width: 768px)': {
                height: '400px',
                background: 'linear-gradient(0deg, rgba(232,37,115,.12) 20%,rgba(232,37,115,.40) 16%, rgba(232,37,115,0) 90%)',
            },
            '@media (max-width: 668px)': {
                height: '320px',
                background: 'linear-gradient(0deg, rgba(232,37,115,.12) 25%,rgba(232,37,115,.40) 16%, rgba(232,37,115,0) 90%)',
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

export default withStyles(styles)(SingleTable)
