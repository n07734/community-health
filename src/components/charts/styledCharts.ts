import { withStyles, CSSProperties } from '@mui/styles'
import { AnyForNow } from '../../types/State'

type TagStyles = {
    [key: string]: CSSProperties | { [key: string]: CSSProperties }
}
const styles = (): TagStyles => ({
    centerHeading: {
        textAlign: 'center',
    },
    headingWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    barChartComponentWrap: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 0 1rem 0',
    },
    lineChartComponentWrap: {
        zIndex: 10,
        width: '100%',
        maxWidth: '1200px',
    },
    chordWrap: {
        width: '450px',
        height: '450px',
        '@media (max-width: 668px)': {
            width: '370px',
            height: '370px',
            '& svg text': {
                fontSize: '10px !important',
            },
        },
    },
    pieWrap: {
        width: '100%',
        height: '350px',
        marginBottom: '20px',
        '@media (max-width: 750px)': {
            height: '300px',
        },
        '@media (max-width: 650px)': {
            height: '250px',
        },
    },
    chartWrap: {
        width: '100%',
        height: '500px',
        '& svg g line': {
            opacity: '0.6',
        },
        '@media (max-width: 768px)': {
            height: '350px',
            '& svg g line': {
                opacity: '0.2',
            },
            '& svg g line:first-child': {
                opacity: '1',
            },
        },
        '@media (max-width: 668px)': {
            height: '300px',
            '& svg g circle': {
                display: 'none',
            },
            '& svg path': {
                opacity: '1',
            },
            '& svg text': {
                fontSize: '10px !important',
            },
        },
    },
})

const styledCharts = (Chart: AnyForNow) => withStyles(styles)(Chart)

export default styledCharts