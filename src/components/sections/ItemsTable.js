import React, { useState } from 'react'
import { DataGrid } from '@material-ui/data-grid'
import { withStyles } from '@material-ui/core/styles'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import { format } from 'date-fns'

import { A } from '../shared/StyledTags'

const zeroOut = {
    renderCell: (params) => params.value || '0',
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
        headerName: 'Age (days)',
        flex: 1,
    },
    mergedAt: {
        field: 'mergedAt',
        headerName: 'Date',
        flex: 1,
        renderCell: (params) => format(new Date(params.value), 'do MMM yy')
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
            : 'false'
    },
}

const makeColumns = dataKeys => {
    const allkeys = [
        ...dataKeys,
        ...['mergedAt', 'url'],
    ]

    const columns = allkeys
        .map(key => columnMap[key])

    return columns
}

const selectedClass = (classes, selectedIndex, tableVisible) => (itemsIndex) => itemsIndex === selectedIndex
    ? `${classes.selected} ${tableVisible ? classes.hasTable : ''}`
    : classes.chunk

const ChunkIcon = ({
    classes,
    tableShowing
}) =>  tableShowing
    ? <RemoveCircleIcon className={classes.arrow} />
    : <AddCircleIcon className={classes.arrow} />

const ItemsTable = ({
    data = [],
    dataKeys = [],
    classes = {},
} = {}) => {
    const [dataIndex, setIndex] = useState(data.length - 1);
    const [showTable, setShowTable] = useState(false);

    const selectedClassFor = selectedClass(classes, dataIndex, showTable)

    return <div className={classes.wrapper}>
        <div className={classes.bar}>
            {
                data
                    .map((item = [],i) => <div
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
                                && <ChunkIcon tableShowing={showTable} classes={classes} />
                        }
                    </div>)
            }
        </div>
        {
            showTable && <DataGrid
                rows={data[dataIndex]}
                columns={makeColumns(dataKeys)}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableColumnFilter
                disableColumnMenu
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
            background: 'linear-gradient(0deg, rgba(232,37,115,.12) 16%,rgba(232,37,115,.55) 16%, rgba(232,37,115,0) 90%)',
            '@media (max-width: 768px)': {
                height: '400px',
                background: 'linear-gradient(0deg, rgba(232,37,115,.12) 20%,rgba(232,37,115,.55) 16%, rgba(232,37,115,0) 90%)',
            },
            '@media (max-width: 668px)': {
                height: '320px',
                background: 'linear-gradient(0deg, rgba(232,37,115,.12) 25%,rgba(232,37,115,.55) 16%, rgba(232,37,115,0) 90%)',
            },
        }
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
        width: '100%',
        display: 'flex',
        flexGrow: 1,
        flexWrap: 'wrap',
        maxWidth: '1100px',
        '& .MuiDataGrid-root': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
        },
    },
})

export default withStyles(styles)(ItemsTable)
