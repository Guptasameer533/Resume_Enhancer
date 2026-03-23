interface ErrorBannerProps {
    message: string;
    onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
            <span className="mt-0.5 text-red-400">⚠</span>
            <span className="flex-1">{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss error"
                    className="text-red-400 hover:text-red-200 transition-colors"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
