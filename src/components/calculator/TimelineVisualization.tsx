export function TimelineVisualization({
    percentage = 100,
    labelStart,
    labelEnd
}: {
    percentage?: number;
    labelStart: string;
    labelEnd: string;
}) {
    return (
        <div className="w-full mt-6 py-4 px-2 border-t border-accent-line">
            <div className="relative h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs font-medium text-ink-3">
                <span>{labelStart}</span>
                <span>{labelEnd}</span>
            </div>
        </div>
    );
}
