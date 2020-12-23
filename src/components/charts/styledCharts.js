import { withStyles } from '@material-ui/core/styles'

const styles = () => ({
    centerHeading: {
        textAlign: 'center',
    },
    headingWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    chartComponentWrap: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 1rem 1rem 1rem',
    },
    chartWrap: {
        width: '100%',
        height: '500px',
        '& svg path': {
            opacity: '0.7'
        },
        '@media (max-width: 768px)': {
            height: '350px',
            '& svg g line': {
                opacity: '0.2'
            },
            '& svg g line:first-child': {
                opacity: '1'
            },
        },
        '@media (max-width: 668px)': {
            height: '300px',
            '& svg g circle': {
                display: 'none'
            },
            '& svg path': {
                opacity: '1'
            },
        },  
    },
})

const styledCharts = (Chart) => withStyles(styles)(Chart)

export default styledCharts