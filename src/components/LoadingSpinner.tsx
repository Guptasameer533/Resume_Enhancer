export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-4 py-12">
            {/* Animated ring */}
            <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" />
            </div>
            {/* Skeleton cards */}
            <div className="w-full max-w-2xl space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl bg-white/5 h-24" />
                ))}
            </div>
            <p className="text-sm text-slate-400 animate-pulse">
                Analysing your resume…
            </p>
        </div>
    );
}
