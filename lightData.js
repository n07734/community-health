/*
    takes the large raw api data and stripes out any 0 or empty values
*/
const { writeFile } = require('fs')

const slimValue = (value) => {
    const newValue = (typeof value === 'string' && value.length && value) // picks defined string 
        || (/^[\d.]+$/.test(`${value}`) && /^[^0]/.test(`${value}`) && value) // picks non 0 number
        || (Array.isArray(value) && value.length && slimArray(value)) // picks defined array
        || (value && Object.keys(value).length && slimObject(value)) // picks defiend object
        || (typeof value === 'boolean' && value) // allows boolean, false will be ignored

    return newValue
}

const slimArray = arr => {
    const newArray = arr
        .reduce((acc, item) => [
            ...acc,
            ...([slimValue(item)])
        ], [])

    return newArray.length && newArray
}

const slimObject = obj => {
    const newObject = Object.entries(obj)
        .reduce((acc, [key, value]) => {
            const newValue = slimValue(value)

            return {
                ...acc,
                ...( newValue
                    ? { [key]: newValue }
                    : {}
                )
            }
        }, {});

    return Object.keys(newObject).length && newObject
}

const light = (file) => new Promise((resolve, reject) => {
    const repoData = require(`./src/prefetchedData/${file}`)
    const repoLight = slimObject(repoData)
    const data = JSON.stringify(repoLight, null, 2)

    writeFile(`./src/prefetchedData/${file}.json`, data, (err) => err
        ? reject(err)
        : resolve()
    )
})

[
    'react',
    'vue',
    'TypeScript',
    'material-ui',
    'node',
    'deno',
    'vscode',
    'electron',
    'kotlin',
    'swift',
]
    .forEach(light)
