import { AllowedColors } from "../types/Components"

const colors: AllowedColors[] = ['#E82573', '#8b4ff0', '#1F77B4', '#4ECC7A', '#DBD523', '#EB9830', '#D14B41']

type AllowedRGB = {
    [key in AllowedColors]: string;
}
const colorsRGBValues: AllowedRGB = {
    '#E82573': '232, 37, 115',
    '#8b4ff0': '139, 79, 240',
    '#1F77B4': '31, 119, 180',
    '#4ECC7A': '78, 204, 122',
    '#DBD523': '219, 213, 35',
    '#EB9830': '235, 152, 48',
    '#D14B41': '209, 75, 65',
}

export {
    colors,
    colorsRGBValues,
}