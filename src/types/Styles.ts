import { PaletteMode } from '@mui/material'
import { AllowedColors } from './Components'

type Rem = `${number}rem`
type FontFamily = '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif'

type ThemeColorToDo = string
type DefaultCopy = { // How to use Rem here?
    color: ThemeColorToDo
    marginTop: number
    marginBottom: string
    fontSize: string
    fontWeight: string
    fontFamily: string
}

type MarkerPrimaryToDo = string
type MarkersFontSize = 12
type MarkerSettings = {
    legendOrientation: string
    legendPosition: string
    height: number
    legendOffsetX: number
    legendOffsetY: number
}

declare module "@mui/material/styles" {
    interface Theme {
        palette: {
            link: string
            colorList: AllowedColors[]
            paperGradient: string
            text: {
                primary: string
            }
            error: {
                main: string
            }
            warn: {
                main: string
            }
            background: {
                default: string
                paper: string
            }
            destructive: {
                main: string
            }
            primary: {
                main: AllowedColors
                contrastText: string
                dark: string
            }
            secondary: {
                main: AllowedColors
            }
            mainCopy: {
                color: string
            }
            secondaryLine: string
            tableGraphGradient1: string
            tableGraphGradient2: string
            tableGraphGradient3: string
            customGraphGradient: string
            iconHover: string
        }
        mySpacing: {
            x: {
                tiny: Rem
                small: Rem
                medium: Rem
                large: Rem
            }
            y: {
                tiny: Rem
                small: Rem
                medium: Rem
                large: Rem
            }
        }
        copy: {
            body: DefaultCopy & {
                lineHeight: string
            }
            list: DefaultCopy
            listItem: {
                color: ThemeColorToDo
                marginBottom: Rem
            }
            h4: DefaultCopy
            h3: DefaultCopy & {
                [key: `@media (max-width: ${number}px)`]: {
                    fontSize: string
                }
            }
            h2: DefaultCopy & {
                [key: `@media (max-width: ${number}px)`]: {
                    fontSize: string
                }
            }
            h1: DefaultCopy & {
                [key: `@media (max-width: ${number}px)`]: {
                    fontSize: string
                }
            }
        }
        charts: {
            fontFamily: FontFamily
            fontSize: number
            textColor: ThemeColorToDo
            crosshair: {
                line: {
                    stroke: ThemeColorToDo
                }
            }
            axis: {
                legend: {
                    text: {
                        fill: ThemeColorToDo
                    }
                }
                ticks: {
                    text: {
                        fill: ThemeColorToDo
                    }
                }
            }
            legends: {
                hidden: {
                    symbol: {
                        fill: '#eee'
                        opacity: number
                    }
                    text: {
                        fill: '#eee'
                        fontWeight: string
                        opacity: number
                    }
                }
                text: {
                    fontWeight: string
                }
            }
            legendsTextFill: ThemeColorToDo
            dotColor: ThemeColorToDo
            tooltip: {
                container: {
                    fontFamily: FontFamily
                    fontSize: number
                    background: string
                    color: ThemeColorToDo
                    boxShadow: string
                }
            }
            grid: {
                line: {
                    stroke: '#999'
                }
            }
            markers: {
                primary: MarkerSettings & {
                    lineStyle: {
                        stroke: MarkerPrimaryToDo
                        strokeWidth: number
                    }
                    textStyle: {
                        fontFamily: FontFamily
                        fontSize: MarkersFontSize
                        fill: MarkerPrimaryToDo
                    }
                }
                secondary: MarkerSettings & {
                    lineStyle: {
                        stroke: string
                        strokeWidth: number
                    }
                    textStyle: {
                        fontFamily: FontFamily
                        fontSize: MarkersFontSize
                        fill: string
                    }
                }
                tertiary: MarkerSettings & {
                    lineStyle: {
                        stroke: string
                        strokeWidth: number
                        strokeDasharray: string
                    }
                    textStyle: {
                        fontFamily: FontFamily
                        fontSize: MarkersFontSize
                        fill: string
                    }
                }
            }
        }
    }
    interface ThemeOptions {
        type: PaletteMode
        mySpacing: {
            x: {
                tiny: Rem
                small: Rem
                medium: Rem
                large: Rem
            }
            y: {
                tiny: Rem
                small: Rem
                medium: Rem
                large: Rem
            }
        }
        copy: {
            body: DefaultCopy & {
                lineHeight: string
            }
            list: DefaultCopy
            listItem: {
                color: ThemeColorToDo
                marginBottom: Rem
            }
            h4: DefaultCopy
            h3: DefaultCopy & {
                [key: `@media (max-width: ${number}px)`]: {
                    fontSize: string
                }
            }
            h2: DefaultCopy & {
                [key: `@media (max-width: ${number}px)`]: {
                    fontSize: string
                }
            }
            h1: DefaultCopy & {
                [key: `@media (max-width: ${number}px)`]: {
                    fontSize: string
                }
            }
        }
        charts: {
            fontFamily: FontFamily
            fontSize: number
            textColor: ThemeColorToDo
            crosshair: {
                line: {
                    stroke: ThemeColorToDo
                }
            }
            axis: {
                legend: {
                    text: {
                        fill: ThemeColorToDo
                    }
                }
                ticks: {
                    text: {
                        fill: ThemeColorToDo
                    }
                }
            }
            legends: {
                hidden: {
                    symbol: {
                        fill: '#eee'
                        opacity: number
                    }
                    text: {
                        fill: '#eee'
                        fontWeight: string
                        opacity: number
                    }
                }
                text: {
                    fontWeight: string
                }
            }
            legendsTextFill: ThemeColorToDo
            dotColor: ThemeColorToDo
            tooltip: {
                container: {
                    fontFamily: FontFamily
                    fontSize: number
                    background: string
                    color: ThemeColorToDo
                    boxShadow: string
                }
            }
            grid: {
                line: {
                    stroke: '#999'
                }
            }
            markers: {
                primary: MarkerSettings & {
                    lineStyle: {
                        stroke: MarkerPrimaryToDo
                        strokeWidth: number
                    }
                    textStyle: {
                        fontFamily: FontFamily
                        fontSize: MarkersFontSize
                        fill: MarkerPrimaryToDo
                    }
                }
                secondary: MarkerSettings & {
                    lineStyle: {
                        stroke: string
                        strokeWidth: number
                    }
                    textStyle: {
                        fontFamily: FontFamily
                        fontSize: MarkersFontSize
                        fill: string
                    }
                }
                tertiary: MarkerSettings & {
                    lineStyle: {
                        stroke: string
                        strokeWidth: number
                        strokeDasharray: string
                    }
                    textStyle: {
                        fontFamily: FontFamily
                        fontSize: MarkersFontSize
                        fill: string
                    }
                }
            }
        }
    }
    interface PaletteOptions {
        colorList: string[]
        destructive: {
            main: string
        }
        warn: {
            main: string
        }
        secondaryLine: string
        mainCopy: {
            color: string
            fontSize: string
            fontWeight: string
            fontFamily: string
        }
        iconHover: string
        link: string
        paperGradient: string
        customGraphGradient: string
        tableGraphGradient1: string
        tableGraphGradient2: string
        tableGraphGradient3: string
        shadow: string
        switch: string
    }
}