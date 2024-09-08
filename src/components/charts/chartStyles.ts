import { ThemeMode } from '../ThemeProvider'

const fontFamily = '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif'
const fontSize = 12
const markerSettings = {
    legendOrientation: 'horizontal',
    legendPosition: 'top-right',
    height: 10,
    legendOffsetX: 0,
    legendOffsetY: -4,
}

export const chartStyles = (type:ThemeMode = 'dark') => {
    const themeColor: string = ({
        light: '#232023',
        dark: '#eee',
    } as Record<ThemeMode, string>)[type]

    const themeColorBg: string = ({
        light: '#fff',
        dark: '#232023',
    } as Record<ThemeMode, string>)[type]

    const markerPrimary: string = ({
        light: '#077314',
        dark: '#077314',
    } as Record<ThemeMode, string>)[type]

    const markerSecondary: string = ({
        light: '#8b4ff0',
        dark: '#6b3dba',
    } as Record<ThemeMode, string>)[type]

    const markerTertiary: string = ({
        light: '#87cac6',
        dark: '#6b3dba',
    } as Record<ThemeMode, string>)[type]

    return{
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
    }
}