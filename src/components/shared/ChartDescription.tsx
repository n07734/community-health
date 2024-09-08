import { useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
} from '@/components/ui/collapsible'

type ExpandLinkProps = {
    setIsOpen: (isOpen: boolean) => void
    isOpen: boolean
    expandText: string
    qaId?: string
    className?: string
}
const ExpandLink = ({
    setIsOpen,
    isOpen,
    expandText,
    qaId,
    className,
}: ExpandLinkProps) =>  <a
    className={`text-base text-primary ${className}`}
    href="#desc"
    {...(qaId && { 'data-qa-id': qaId })}
    onClick={(e) => {
        e.preventDefault()
        setIsOpen(!isOpen)
    }}>
    {
        isOpen
            ? 'hide'
            : expandText
    }
</a>

type ChartDescriptionProps = {
    title?: string | React.ReactNode
    intro?: string
    children?: React.ReactNode
    expandText?: string
    className?: string
    expandQaId?: string
}
const ChartDescription = ({
    title,
    intro,
    children,
    expandText = 'info',
    className = '',
    expandQaId,
}: ChartDescriptionProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`w-full flex flex-grow flex-wrap ${className} ${!intro ? '' : '[&>*]:basis-full'}`}>
            {
                title && typeof title === 'string'
                    ? <h3>
                        {title}
                        {
                            children
                                && <ExpandLink
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    expandText={expandText}
                                    qaId={expandQaId}
                                    className="ml-2"
                                />
                        }
                    </h3>
                    : title
            }
            <p>
                {intro} {
                    intro
                        && children
                        && <ExpandLink
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            expandText={expandText}
                            qaId={expandQaId}
                        />
                }
            </p>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="wrapper basis-full"
            >
                <CollapsibleContent>
                    {children}
                </CollapsibleContent>
            </Collapsible>

        </div>
    )
}

export default ChartDescription
