import { splitEvery } from 'ramda'

// Runs each batch synchronously and the items in a batch asynchronously
const runBatchQueue = <T>(batches: T[][], job: (arg: T) => Promise<T[]>, resolved: T[][] = []): Promise<T[][]> => new Promise((resolve, reject) => {
    const [currentBatch, ...remainingBatches] = batches

    Promise.all(currentBatch.map((j) => job(j)))
        .then((results) => (
            remainingBatches && remainingBatches.length
                ? runBatchQueue(remainingBatches, job, results)
                    .then((more) => resolve(resolved.concat(more)))
                    .catch(reject)
                : resolve(resolved.concat(results))
        ))
        .catch(reject)
})

// Takes an array of arguments for the job and runs them in batches
const batch = <T>(argsList: T[] = [], job: (arg: T) => Promise<any>, batchSize = 2) => {
    const batches = splitEvery(batchSize, argsList)

    return argsList.length
        ? runBatchQueue(batches, job)
        : []
}

export default batch
