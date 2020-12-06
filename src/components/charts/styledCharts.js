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
    },
})

const styledCharts = (Chart) => withStyles(styles, { withTheme: true })(Chart)

export default styledCharts