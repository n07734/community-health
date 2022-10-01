const styles = theme => ({
    inputGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        marginBottom: '1rem',
        columnGap: '8px',
        rowGap: '8px', // BUG: theme.spacing.unit does not have px for row but does for column, odd
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(1, 1fr)',
        },
        '& button': {
            minHeight: '3rem',
        },
        '& .tokenText' : {
            gridColumn:'1 / -1'
        }
    },
    typeOptions: {
        display: 'flex',
        '& button': {
            flexGrow: 1,
            fontSize: '1.3rem',
            textTransform: 'none',
        },
    },
    link: {
        color: theme.palette.link,
    },
    fullRow: {
        gridColumn:'1 / -1',
    },
    formDescription: {
        marginBottom: '0',
    },
    dataPaper: {
        display: 'block',
    },
    child: {
        margin: 0,
        width: '100%'
    },
    copy: {
        display: 'inline',
    },
    preFetched: {
        marginBottom: '1rem',
    },
})

export default styles
