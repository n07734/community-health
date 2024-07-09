/* eslint-disable no-unused-vars */
import { createTheme } from '@mui/material/styles'
import { PaletteMode } from '@mui/material'
import { colors } from './components/colors'

const fontFamily = '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif'
const fontSize = 12

const markerSettings = {
    legendOrientation: 'horizontal',
    legendPosition: 'top-right',
    height: 10,
    legendOffsetX: 0,
    legendOffsetY: -4,
}

const theme =  (type: PaletteMode = 'light') => {
    const shadow = ({
        light: '#CCC',
        dark: '#666',
    })[type]

    const markerPrimary = ({
        light: '#077314',
        dark: '#077314',
    })[type]

    const markerSecondary = ({
        light: '#8b4ff0',
        dark: '#6b3dba',
    })[type]

    const markerTertiary = ({
        light: '#87cac6',
        dark: '#6b3dba',
    })[type]

    const themeColor = ({
        light: '#232023',
        dark: '#eee',
    })[type]

    const themeColorBg = ({
        light: '#fff',
        dark: '#232023',
    })[type]

    const defaultCopy = {
        color: themeColor,
        marginTop: 0,
        marginBottom: '0.8rem',
        fontSize: '1rem',
        fontWeight: '400',
        fontFamily,
    }

    return createTheme({
        type,
        components: {
            MuiSelect: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'transparent',
                        '&:hover':{
                            backgroundColor: 'transparent',
                        },
                        '&:focus':{
                            backgroundColor: 'transparent',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'transparent',
                        },
                        '& .MuiInputBase-input': {
                            '&:focus':{
                                backgroundColor: 'transparent',
                            },
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        '&.MuiMenu-paper':{
                            backgroundColor: themeColorBg,
                            backgroundImage: 'none',
                        },
                    },
                },
            },
        },
        palette: {
            mode: type,
            colorList: colors,
            error: {
                main:'#E02E2E',
            },
            destructive: {
                main:'#BD2D22',
            },
            warn: {
                main: '#DC7E09',
            },
            secondary: {
                contrastText: '#CCC',
                dark: '#1E6392',
                light: '#7986Cb',
                main: '#1F77B4',
            },
            primary: {
                contrastText: '#CCC',
                dark: '#B10E4F',
                light: '#D65287',
                main: '#E82573',
            },
            secondaryLine: ({
                light: '#777',
                dark: '#E2E2E2',
            })[type],
            mainCopy: {
                color: themeColor,
                fontSize: '1rem',
                fontWeight: '400',
                fontFamily,
            },
            iconHover: ({
                light: '#D65287',
                dark: '#E82573',
            })[type],
            text: {
                primary: themeColor,
            },
            link: ({
                light: '#1F77B4',
                dark: '#E82573',
            })[type],
            background: {
                default: themeColorBg,
                paper: themeColorBg,
            },
            paperGradient: `linear-gradient(${shadow}, rgba(0,0,0,0))`,
            customGraphGradient: `linear-gradient(0deg, rgba(0,0,0,0) 80%, ${shadow} 100%)`,
            tableGraphGradient1: 'linear-gradient(0deg, rgba(232,37,115,.12) 16%,rgba(232,37,115,.40) 16%, rgba(232,37,115,0) 90%)',
            tableGraphGradient2: 'linear-gradient(0deg, rgba(232,37,115,.12) 20%,rgba(232,37,115,.40) 16%, rgba(232,37,115,0) 90%)',
            tableGraphGradient3: 'linear-gradient(0deg, rgba(232,37,115,.12) 25%,rgba(232,37,115,.40) 16%, rgba(232,37,115,0) 90%)',
            shadow,
            switch: themeColor,
        },
        mySpacing: {
            x: {
                tiny: '0.2rem',
                small: '0.5rem',
                medium: '0.8rem',
                large: '1.2rem',
            },
            y: {
                tiny: '0.5rem',
                small: '0.8rem',
                medium: '1rem',
                large: '1.4rem',
            },
        },
        copy: {
            body: {
                ...defaultCopy,
                lineHeight: '1.3rem',
            },
            list: {
                ...defaultCopy,
                color: themeColor,
            },
            listItem: {
                color: themeColor,
                marginBottom: '0.2rem',
            },
            h4: {
                ...defaultCopy,
                marginBottom: '0.5rem',
                fontSize: '1.3rem',
                fontWeight: '500',
            },
            h3: {
                ...defaultCopy,
                fontSize: '2rem',
                fontWeight: '500',
                '@media (max-width: 768px)': {
                    fontSize: '1.5rem',
                },
                '@media (max-width: 668px)': {
                    fontSize: '1.3rem',
                },
            },
            h2: {
                ...defaultCopy,
                fontSize: '3rem',
                fontWeight: '200',
                '@media (max-width: 768px)': {
                    fontSize: '2.5rem',
                },
                '@media (max-width: 668px)': {
                    fontSize: '2rem',
                },
            },
            h1: {
                ...defaultCopy,
                fontSize: '4rem',
                fontWeight: '300',
                '@media (max-width: 768px)': {
                    fontSize: '3rem',
                },
                '@media (max-width: 668px)': {
                    fontSize: '2.5rem',
                },
            },
        },
        charts: {
            fontFamily,
            fontSize,
            textColor: themeColor,
            crosshair: {
                line: {
                    stroke: themeColor,
                },
            },
            axis: {
                legend: {
                    text: { fill: themeColor },
                },
                ticks: {
                    text: { fill: themeColor },
                },
            },
            legends: {
                hidden: {
                    symbol: {
                        fill: '#eee',
                        opacity: 1,
                    },
                    text: {
                        fill: '#eee',
                        fontWeight: '400',
                        opacity: 1,
                    },
                },
                text: {
                    fontWeight: '800',
                },
            },
            legendsTextFill: themeColor,
            dotColor: themeColor,
            tooltip: {
                container: {
                    fontFamily,
                    fontSize,
                    background: themeColorBg,
                    color: themeColor,
                    boxShadow: `0 1px 2px ${themeColor}`,
                },
            },
            grid: {
                line: {
                    stroke: '#999',
                },
            },
            markers: {
                primary: {
                    lineStyle: {
                        stroke: markerPrimary,
                        strokeWidth: 1,
                    },
                    textStyle: {
                        fontFamily,
                        fontSize,
                        fill: markerPrimary,
                    },
                    ...markerSettings,
                },
                secondary: {
                    lineStyle: {
                        stroke: markerSecondary,
                        strokeWidth: 1,
                    },
                    textStyle: {
                        fontFamily,
                        fontSize,
                        fill: markerSecondary,
                    },
                    ...markerSettings,
                },
                tertiary: {
                    lineStyle: {
                        stroke: markerTertiary,
                        strokeWidth: 1,
                        strokeDasharray:'2 6',
                    },
                    textStyle: {
                        fontFamily,
                        fontSize,
                        fill: markerTertiary,
                    },
                    ...markerSettings,
                },

            },
        },

    })
}

export default theme
