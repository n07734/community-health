type PaperWrapperProps = {
    className?: string
    children: React.ReactNode
}
const Paper = ({ className = '', children }: PaperWrapperProps) => (
    <div
        className={`paper ${className}`}
    >
        {children}
    </div>
)

export default Paper