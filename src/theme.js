import { createTheme } from '@material-ui/core/styles'

const themeColor = type => ({
    light: '#232023',
    dark: '#eee',
})[type]

const themeColorBg = type => ({
    light: '#fff',
    dark: '#232023',
})[type]

const fontFamily = '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif'
const fontSize = 12

const defaultCopy = (type) => ({
    color: themeColor(type),
    marginTop: 0,
    marginBottom: '0.8rem',
    fontSize: '1rem',
    fontWeight: '400',
    fontFamily,
})

const markerSettings = {
    legendOrientation: 'horizontal',
    legendPosition: 'top-right',
    height: 10,
    legendOffsetX: 0,
    legendOffsetY: -4,
}

const spacing = {
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
}

const theme =  (type = 'light') => createTheme({
    type,
    palette: {
        type,
        secondary: {
            contrastText: '#ccc',
            dark: '#1e6392',
            light: '#7986cb',
            main: '#1f77b4',
        },
        primary: {
            contrastText: '#ccc',
            dark: '#b10e4f',
            light: '#d65287',
            main: '#e82573',
        },
        mainCopy: {
            color: themeColor(type),
            fontSize: '1rem',
            fontWeight: '400',
            fontFamily,
        },
        iconHover: ({
            light: '#d65287',
            dark: '#e82573',
        })[type],
        text: {
            primary: themeColor(type),
        },
        link: ({
            light: '#1f77b4',
            dark: '#e82573',
        })[type],
        background: {
            default: themeColorBg(type),
            paper: themeColorBg(type),
        },
        shadow:({
            light: '#ccc',
            dark: '#666',
        })[type],
        switch: themeColor(type),
    },
    typography: { useNextVariants: true },
    mySpacing: spacing,
    copy: {
        body: {
            ...defaultCopy(type),
            lineHeight: '1.3rem',
        },
        list: {
            ...defaultCopy(type),
            color: themeColor(type),
        },
        listItem: {
            color: themeColor(type),
            marginBottom: '0.2rem',
        },
        h4: {
            ...defaultCopy(type),
            marginBottom: '0.5rem',
            fontSize: '1.3rem',
            fontWeight: '500',
        },
        h3: {
            ...defaultCopy(type),
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
            ...defaultCopy(type),
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
            ...defaultCopy(type),
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
        textColor: themeColor(type),
        crosshair: {
            line: {
                stroke: themeColor(type),
            },
        },
        axis: {
            legend: {
                text: { fill: themeColor(type) },
            },
            ticks: {
                text: { fill: themeColor(type) },
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
        legendsTextFill: themeColor(type),
        dotColor: themeColor(type),
        tooltip: {
            fontFamily,
            fontSize,
            container: {
                background: themeColorBg(type),
                color: themeColor(type),
                boxShadow: `0 1px 2px ${themeColor(type)}`,
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
                    stroke:({
                        light: '#077314',
                        dark: '#077314',
                    })[type],
                    strokeWidth: 1,
                },
                textStyle: {
                    fontFamily,
                    fontSize,
                    fill: ({
                        light: '#077314',
                        dark: '#077314',
                    })[type],
                },
                ...markerSettings,
            },
            secondary: {
                lineStyle: {
                    stroke:({
                        light: '#8b4ff0',
                        dark: '#6b3dba',
                    })[type],
                    strokeWidth: 1,
                },
                textStyle: {
                    fontFamily,
                    fontSize,
                    fill: ({
                        light: '#8b4ff0',
                        dark: '#6b3dba',
                    })[type],
                },
                ...markerSettings,
            },
            tertiary: {
                lineStyle: {
                    stroke:({
                        light: '#87cac6',
                        dark: '#6b3dba',
                    })[type],
                    strokeWidth: 1,
                    strokeDasharray:'2 6',
                },
                textStyle: {
                    fontFamily,
                    fontSize,
                    fill: ({
                        light: '#87cac6',
                        dark: '#6b3dba',
                    })[type],
                },
                ...markerSettings,
            },

        },
    },
})

export default theme
