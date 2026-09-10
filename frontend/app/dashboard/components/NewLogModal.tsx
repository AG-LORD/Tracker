"use client";

type ActivityOption = {
    code: string;
    name: string;
    description: string;
    icon: string;
};

const activityOptions: ActivityOption[] = [
    {
        code: "study",
        name: "Study",
        description: "Track learning, subjects and progress",
        icon: "📚",
    },
    {
        code: "exercise",
        name: "Exercise",
        description: "Gym, cardio and other workouts",
        icon: "🏋️",
    },
    {
        code: "sleep",
        name: "Sleep",
        description: "Track sleep duration and quality",
        icon: "😴",
    },
    {
        code: "walking",
        name: "Walking",
        description: "Walks, jogs, distance and steps",
        icon: "🚶",
    },
    {
        code: "reading",
        name: "Reading",
        description: "Books, pages and reading time",
        icon: "📖",
    },
    {
        code: "meditation",
        name: "Meditation",
        description: "Mindfulness and meditation sessions",
        icon: "🧘",
    },
    {
        code: "project",
        name: "Project",
        description: "Track work done on your projects",
        icon: "💻",
    },
];

type NewLogModalProps = {
    onClose: () => void;
    onStudy: () => void;
};

export default function NewLogModal({
                                        onClose,
                                        onStudy,
                                    }: NewLogModalProps) {
    function handleSelect(code: string) {
        if (code === "study") {
            onStudy();
            return;
        }

        // Other forms will be implemented next.
        console.log(`${code} form coming next`);
    }

    return (
        <div className="modal-backdrop">
            <div className="new-log-modal">
                <div className="new-log-header">
                    <div>
                        <div className="modal-eyebrow">
                            QUICK LOG
                        </div>

                        <h2>What do you want to track?</h2>

                        <p>
                            Choose an activity and log the details
                            in a few seconds.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="activity-options">
                    {activityOptions.map((activity) => (
                        <button
                            key={activity.code}
                            type="button"
                            className="activity-option"
                            onClick={() =>
                                handleSelect(activity.code)
                            }
                        >
                            <div className="activity-option-icon">
                                {activity.icon}
                            </div>

                            <div className="activity-option-content">
                                <strong>
                                    {activity.name}
                                </strong>

                                <span>
                                    {activity.description}
                                </span>
                            </div>

                            <span className="activity-option-arrow">
                                →
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}