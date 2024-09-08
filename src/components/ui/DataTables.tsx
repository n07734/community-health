import { useState } from 'react'
import { TableData } from '@/types/Graphs'

const Minus = () => <svg
    className="w-[22px] h-[22px] fill-background inline-block"
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 32 32"
    data-qa-id="RemoveCircleIcon"
>
    <path d="M15.5 3.5c-7.18 0-13 5.82-13 13s5.82 13 13 13c7.18 0 13-5.82 13-13s-5.82-13-13-13zM22 16.875c0 0.553-0.448 1-1 1h-11c-0.553 0-1-0.447-1-1v-1c0-0.552 0.447-1 1-1h11c0.552 0 1 0.448 1 1v1z"></path>
</svg>

const Plus = () => <svg
    className="w-[22px] h-[22px] fill-current inline-block"
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 32 32"
    data-qa-id="RemoveCircleIcon"
>
    <path d="M15.5 29.5c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13zM21.938 15.938c0-0.552-0.448-1-1-1h-4v-4c0-0.552-0.447-1-1-1h-1c-0.553 0-1 0.448-1 1v4h-4c-0.553 0-1 0.448-1 1v1c0 0.553 0.447 1 1 1h4v4c0 0.553 0.447 1 1 1h1c0.553 0 1-0.447 1-1v-4h4c0.552 0 1-0.447 1-1v-1z"></path>
</svg>

import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/button'

const ChunkIcon = ({
    showTable = false,
}: { showTable: boolean }) =>  showTable
    ? <Plus />
    : <Minus />

type DataTablesProps = {
    dataKeys: string[]
    data: TableData[][]
    tableOpenedByDefault?: boolean
}

export const DataTables = ({
    dataKeys,
    data,
    tableOpenedByDefault = false,
}: DataTablesProps) => {
    const [dataIndex, setIndex] = useState(data.length - 1);
    const [showTable, setShowTable] = useState(tableOpenedByDefault);

    const flatData = data.flat()
    const total = flatData.length

    const updatedData = (total > 30
        ? data
        : [flatData]) as readonly TableData[][]

    const topLeftClass = dataIndex === 0 ? 'rounded-tl-none' : ''
    const topRightClass = dataIndex === data.length - 1 ? 'rounded-tr-none' : ''
    const addClass = topLeftClass || topRightClass || ''

    return <div className="mb-4">
        {
            updatedData.length > 0 && <div className="px-50 flex flex-row justify-stretch gap-x-1">
                {
                    updatedData
                        .map((_item, i) => <Button className={`rounded-lg relative w-full px-0 py-1 h-full ${dataIndex === i && showTable ? 'slice rounded-t-lg rounded-b-none border-b-4 border-primary hover:bg-primary': 'mb-1 bg-secondary hover:bg-secondary'}`}
                            key={i}
                            onClick={() => {
                                dataIndex === i
                                 && setShowTable(!showTable)

                                dataIndex !== i
                                 && !showTable
                                 && setShowTable(true)

                                setIndex(i)
                            }}
                        >
                            {
                                dataIndex === i
                                    ? <ChunkIcon showTable={showTable} />
                                    : <Minus />
                            }
                        </Button>)
                }
            </div>
        }
        {
            updatedData[dataIndex]?.length > 0 && showTable &&
                <DataTable
                    data={updatedData[dataIndex]}
                    dataKeys={dataKeys}
                    addClass={addClass}
                />
        }
    </div>
}