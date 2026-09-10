"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NewLogModal from "./components/NewLogModal";
import "./dashboard.css";

import NewStudyLog from "./components/NewStudyLog";
import { apiFetch } from "@/lib/api";
import type { Activity } from "@/lib/types";

type User = {
    id: string;
    email: string;
    name: string;
    profile_image_url: string | null;
    timezone: string;
};

type StudySubject = {
    id: string;
    name: string;
    is_active: boolean;
};

type NavItem = {
    label: string;
    icon: string;
};

const mainNav: NavItem[] = [
    { label: "Dashboard", icon: "⌂" },
    { label: "Calendar", icon: "▣" },
    { label: "Analytics", icon: "◒" },
];

const trackingNav: NavItem[] = [
    { label: "Study", icon: "▤" },
    { label: "Health", icon: "♡" },
    { label: "Projects", icon: "◇" },
    { label: "Diary", icon: "▧" },
];

function formatDuration(start: string, end: string) {
    const minutes = Math.max(
        0,
        Math.round(
            (new Date(end).getTime() -
                new Date(start).getTime()) /
            60000
        )
    );

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
        return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 18) {
        return "Good afternoon";
    }

    return "Good evening";
}

function getActivityIcon(activity: Activity) {
    const code = activity.activity_type?.code;

    switch (code) {
        case "study":
            return "📚";
        case "exercise":
            return "🏋";
        case "walking":
            return "🚶";
        case "sleep":
            return "😴";
        case "reading":
            return "📖";
        case "meditation":
            return "🧘";
        case "project":
            return "💻";
        default:
            return "◉";
    }
}

export default function DashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [subjects, setSubjects] = useState<StudySubject[]>([]);

    const [loading, setLoading] = useState(true);
    const [showNewStudyLog, setShowNewStudyLog] =
        useState(false);
    const [showNewLogModal, setShowNewLogModal] =
        useState(false);

    const loadActivities = useCallback(async () => {
        try {
            const response = await apiFetch("/activities");

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load activities");
            }

            const data: Activity[] = await response.json();
            setActivities(data);
        } catch (error) {
            console.error(
                "Failed to load activities:",
                error
            );
        }
    }, [router]);

    const loadSubjects = useCallback(async () => {
        try {
            const response = await apiFetch(
                "/study/subjects"
            );

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load subjects");
            }

            const data: StudySubject[] =
                await response.json();

            setSubjects(data);
        } catch (error) {
            console.error(
                "Failed to load subjects:",
                error
            );
        }
    }, [router]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const userResponse = await apiFetch(
                    "/auth/me"
                );

                if (userResponse.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!userResponse.ok) {
                    throw new Error("Failed to load user");
                }

                const userData: User =
                    await userResponse.json();

                setUser(userData);

                await Promise.all([
                    loadActivities(),
                    loadSubjects(),
                ]);
            } catch (error) {
                console.error(
                    "Failed to load dashboard:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [router, loadActivities, loadSubjects]);

    const todayActivities = useMemo(() => {
        const today = new Date();

        return activities
            .filter((activity) => {
                const activityDate = new Date(
                    activity.start_at
                );

                return (
                    activityDate.getFullYear() ===
                    today.getFullYear() &&
                    activityDate.getMonth() ===
                    today.getMonth() &&
                    activityDate.getDate() === today.getDate()
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.start_at).getTime() -
                    new Date(b.start_at).getTime()
            );
    }, [activities]);

    const todayStudyMinutes = todayActivities
        .filter(
            (activity) =>
                activity.activity_type?.code === "study"
        )
        .reduce((total, activity) => {
            return (
                total +
                Math.max(
                    0,
                    Math.round(
                        (new Date(
                                activity.end_at
                            ).getTime() -
                            new Date(
                                activity.start_at
                            ).getTime()) /
                        60000
                    )
                )
            );
        }, 0);

    const todayExerciseMinutes = todayActivities
        .filter(
            (activity) =>
                activity.activity_type?.code ===
                "exercise"
        )
        .reduce((total, activity) => {
            return (
                total +
                Math.max(
                    0,
                    Math.round(
                        (new Date(
                                activity.end_at
                            ).getTime() -
                            new Date(
                                activity.start_at
                            ).getTime()) /
                        60000
                    )
                )
            );
        }, 0);

    const totalTodayMinutes = todayActivities.reduce(
        (total, activity) => {
            return (
                total +
                Math.max(
                    0,
                    Math.round(
                        (new Date(
                                activity.end_at
                            ).getTime() -
                            new Date(
                                activity.start_at
                            ).getTime()) /
                        60000
                    )
                )
            );
        },
        0
    );

    const formattedTodayStudy =
        formatMinutes(todayStudyMinutes);

    const formattedTodayExercise =
        formatMinutes(todayExerciseMinutes);

    const formattedTodayTotal =
        formatMinutes(totalTodayMinutes);

    if (loading) {
        return (
            <div className="app-loading">
                <div className="loading-dot" />
                <span>Loading Life Tracker...</span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">L</div>

                    <div>
                        <div className="brand-name">
                            Life Tracker
                        </div>
                        <div className="brand-subtitle">
                            Personal OS
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-label">
                        Workspace
                    </div>

                    <nav className="nav-list">
                        {mainNav.map((item, index) => (
                            <button
                                key={item.label}
                                className={`nav-item ${
                                    index === 0
                                        ? "active"
                                        : ""
                                }`}
                                type="button"
                            >
                                <span className="nav-icon">
                                    {item.icon}
                                </span>

                                <span>{item.label}</span>

                                {index === 0 && (
                                    <span className="active-indicator" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-label">
                        Track
                    </div>

                    <nav className="nav-list">
                        {trackingNav.map((item) => (
                            <button
                                key={item.label}
                                className="nav-item"
                                type="button"
                            >
                                <span className="nav-icon">
                                    {item.icon}
                                </span>

                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="sidebar-spacer" />

                <button
                    className="profile-mini"
                    type="button"
                >
                    <div className="avatar-small">
                        {user.profile_image_url ? (
                            <img
                                src={
                                    user.profile_image_url
                                }
                                alt={user.name}
                            />
                        ) : (
                            user.name
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div className="profile-mini-text">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                    </div>

                    <span className="profile-chevron">
                        ›
                    </span>
                </button>
            </aside>

            <div className="main-shell">
                <header className="topbar">
                    <div className="breadcrumb">
                        <span>Dashboard</span>
                    </div>

                    <div className="topbar-actions">
                        <button
                            className="icon-button"
                            type="button"
                            aria-label="Notifications"
                        >
                            ♢
                        </button>

                        <div className="topbar-divider" />

                        <div className="topbar-user">
                            <div className="avatar-small">
                                {user.profile_image_url ? (
                                    <img
                                        src={
                                            user.profile_image_url
                                        }
                                        alt={user.name}
                                    />
                                ) : (
                                    user.name
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <span>{user.name}</span>

                            <span className="chevron">
                                ▾
                            </span>
                        </div>
                    </div>
                </header>

                <main className="dashboard">
                    <section className="hero">
                        <div>
                            <div className="eyebrow">
                                {new Date().toLocaleDateString(
                                    [],
                                    {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    }
                                )}
                            </div>

                            <h1>
                                {getGreeting()},{" "}
                                {user.name.split(" ")[0]}.
                            </h1>

                            <p>
                                Here's your day at a glance.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            type="button"
                            onClick={() =>
                                setShowNewStudyLog(true)
                            }
                        >
                            <span>+</span>
                            New Log
                        </button>
                    </section>

                    <section className="stats-grid">
                        <StatCard
                            label="Focus time"
                            value={formattedTodayStudy}
                            description="Study today"
                            icon="◈"
                            type="focus"
                        />

                        <StatCard
                            label="Total tracked"
                            value={formattedTodayTotal}
                            description={`${todayActivities.length} activities today`}
                            icon="◷"
                            type="total"
                        />

                        <StatCard
                            label="Exercise"
                            value={formattedTodayExercise}
                            description="Movement today"
                            icon="⌁"
                            type="health"
                        />

                        <StatCard
                            label="Study subjects"
                            value={subjects.length.toString()}
                            description="Active subjects"
                            icon="◇"
                            type="subjects"
                        />
                    </section>

                    <div className="content-grid">
                        <section className="panel timeline-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>
                                        Today's timeline
                                    </h2>
                                    <p>
                                        Everything you've logged
                                    </p>
                                </div>

                                <button
                                    className="text-button"
                                    type="button"
                                >
                                    View all →
                                </button>
                            </div>

                            {todayActivities.length === 0 ? (
                                <EmptyTimeline
                                    onNewLog={() =>
                                        setShowNewStudyLog(
                                            true
                                        )
                                    }
                                />
                            ) : (
                                <div className="timeline">
                                    {todayActivities.map(
                                        (activity) => (
                                            <div
                                                className="timeline-row"
                                                key={
                                                    activity.id
                                                }
                                            >
                                                <div className="timeline-time">
                                                    {formatTime(
                                                        activity.start_at
                                                    )}
                                                </div>

                                                <div className="timeline-track">
                                                    <span className="timeline-dot" />
                                                    <span className="timeline-line" />
                                                </div>

                                                <div className="activity-icon">
                                                    {getActivityIcon(
                                                        activity
                                                    )}
                                                </div>

                                                <div className="timeline-content">
                                                    <div className="activity-title">
                                                        {activity.title ??
                                                            "Untitled activity"}
                                                    </div>

                                                    <div className="activity-meta">
                                                        <span>
                                                            {activity
                                                                    .activity_type
                                                                    ?.name ??
                                                                "Activity"}
                                                        </span>

                                                        <span>
                                                            ·
                                                        </span>

                                                        <span>
                                                            {formatDuration(
                                                                activity.start_at,
                                                                activity.end_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    {activity.notes && (
                                                        <div className="activity-note">
                                                            {
                                                                activity.notes
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="panel subjects-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>
                                        Study overview
                                    </h2>
                                    <p>
                                        Your current subjects
                                    </p>
                                </div>

                                <button
                                    className="circle-button"
                                    type="button"
                                    onClick={() =>
                                        setShowNewStudyLog(
                                            true
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>

                            {subjects.length === 0 ? (
                                <div className="empty-small">
                                    No subjects yet.
                                </div>
                            ) : (
                                <div className="subject-list">
                                    {subjects.map(
                                        (subject, index) => (
                                            <div
                                                className="subject-row"
                                                key={
                                                    subject.id
                                                }
                                            >
                                                <div
                                                    className={`subject-dot subject-dot-${index % 4}`}
                                                />

                                                <div className="subject-name">
                                                    {
                                                        subject.name
                                                    }
                                                </div>

                                                <div className="subject-bar">
                                                    <span
                                                        style={{
                                                            width: `${Math.min(
                                                                35 +
                                                                index *
                                                                15,
                                                                85
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    <section className="panel weekly-panel">
                        <div className="panel-header">
                            <div>
                                <h2>
                                    This week
                                </h2>
                                <p>
                                    Build consistency, not
                                    perfection.
                                </p>
                            </div>

                            <button
                                className="text-button"
                                type="button"
                            >
                                Analytics →
                            </button>
                        </div>

                        <div className="week-chart">
                            {[
                                ["Mon", 48],
                                ["Tue", 66],
                                ["Wed", 42],
                                ["Thu", 72],
                                ["Fri", 58],
                                ["Sat", 82],
                                ["Sun", 30],
                            ].map(
                                ([day, height]) => (
                                    <div
                                        className="chart-column"
                                        key={day}
                                    >
                                        <div className="chart-value">
                                            {height}%
                                        </div>

                                        <div className="chart-track">
                                            <div
                                                className="chart-bar"
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="chart-label">
                                            {day}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    <section className="quote-card">
                        <div className="quote-mark">
                            “
                        </div>

                        <div>
                            <p>
                                Small actions, repeated
                                consistently, become the
                                life you remember.
                            </p>

                            <span>
                                Your Life Tracker
                            </span>
                        </div>
                    </section>
                </main>
            </div>

            {showNewStudyLog && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <NewStudyLog
                            onClose={() =>
                                setShowNewStudyLog(
                                    false
                                )
                            }
                            onCreated={async () => {
                                await loadActivities();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function formatMinutes(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (hours === 0) {
        return `${remaining}m`;
    }

    if (remaining === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remaining}m`;
}

type StatCardProps = {
    label: string;
    value: string;
    description: string;
    icon: string;
    type: "focus" | "total" | "health" | "subjects";
};

function StatCard({
                      label,
                      value,
                      description,
                      icon,
                      type,
                  }: StatCardProps) {
    return (
        <article className={`stat-card stat-${type}`}>
            <div className="stat-top">
                <span className="stat-label">
                    {label}
                </span>

                <span className="stat-icon">
                    {icon}
                </span>
            </div>

            <div className="stat-value">
                {value}
            </div>

            <div className="stat-description">
                {description}
            </div>
        </article>
    );
}

function EmptyTimeline({
                           onNewLog,
                       }: {
    onNewLog: () => void;
}) {
    return (
        <div className="empty-timeline">
            <div className="empty-icon">◷</div>

            <h3>
                Nothing tracked yet
            </h3>

            <p>
                Start capturing your day one activity
                at a time.
            </p>

            <button
                className="secondary-button"
                type="button"
                onClick={onNewLog}
            >
                + Add your first log
            </button>
        </div>
    );
}