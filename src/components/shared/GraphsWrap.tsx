type GraphsWrapProps = {
    children: React.ReactNode
}
const GraphsWrap = ({ children }: GraphsWrapProps) => (
    <div
        className="w-full relative flex flex-col flex-wrap gap-0 items-center 3xl:flex-row 3xl:gap-0 3xl:gap-x-5 3xl:justify-center"
    >
        {children}
    </div>
)

export default GraphsWrap