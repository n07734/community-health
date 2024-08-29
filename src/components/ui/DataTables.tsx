import { useState } from 'react'
import { TableData } from '@/types/Graphs'
import {
    CirclePlus,
    CircleMinus,
} from 'lucide-react'

import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/button'

const ChunkIcon = ({
    showTable = false,
}: { showTable: boolean }) =>  showTable
    ? <CirclePlus />
    : <CircleMinus />

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

    return <div className="">
        {
            updatedData.length > 0 && <div className="px-50 flex flex-row justify-stretch gap-x-1">
                {
                    updatedData
                        .map((_item, i) => <Button className={`relative w-full px-0 py-1 h-full ${dataIndex === i && showTable ? 'slice rounded-t-lg rounded-b-none border-b-4 border-primary hover:bg-primary': 'mb-1 bg-secondary hover:bg-secondary'}`}
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
                                    : <CircleMinus />
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