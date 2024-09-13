
const variant = {
    'warn': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>,
    'error': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>,
}

export type ErrorInputs = {
    level?: 'warn' | 'error'
    message: string
}

type MessageProps = {
    error: ErrorInputs
    className?: string
}

const Message = ({
    error: {
        level = 'error',
        message,
    },
    className,
}: MessageProps) => {
    const bgClass = level === 'error'
        ? 'bg-error'
        : 'bg-warn'
    return (
        <div className={`${bgClass} p-3 flex items-center rounded-sm ${className}`} >
            {variant[level]}
            <p className="m-0 ml-2 p-0">{message}</p>
        </div>
    )}

export default Message
