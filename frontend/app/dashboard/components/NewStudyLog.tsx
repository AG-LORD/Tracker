"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type StudySubject = {
    id: string;
    name: string;
    is_active: boolean;
};

type NewStudyLogProps = {
    onClose: () => void;
    onCreated: () => void;
};

type FormState = {
    subject_id: string;
    title: string;
    topic: string;
    start_at: string;
    end_at: string;
    problems_solved: string;
    confidence: string;
    what_studied: string;
    what_struggled: string;
    what_learned: string;
};

const initialForm: FormState = {
    subject_id: "",
    title: "",
    topic: "",
    start_at: "",
    end_at: "",
    problems_solved: "0",
    confidence: "",
    what_studied: "",
    what_struggled: "",
    what_learned: "",
};

export default function NewStudyLog({
                                        onClose,
                                        onCreated,
                                    }: NewStudyLogProps) {
    const [subjects, setSubjects] = useState<StudySubject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<FormState>(initialForm);

    useEffect(() => {
        async function loadSubjects() {
            try {
                const response = await apiFetch("/study/subjects");

                if (response.status === 401) {
                    setError("Your session has expired.");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to load subjects");
                }

                const data: StudySubject[] =
                    await response.json();

                setSubjects(data);

                if (data.length > 0) {
                    setForm((current) => ({
                        ...current,
                        subject_id: data[0].id,
                    }));
                }
            } catch (err) {
                console.error(err);
                setError(
                    "Could not load your study subjects."
                );
            } finally {
                setLoadingSubjects(false);
            }
        }

        loadSubjects();
    }, []);

    function updateField(
        field: keyof FormState,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!form.subject_id) {
            setError("Please select a subject.");
            return;
        }

        if (!form.start_at || !form.end_at) {
            setError("Please enter both start and end time.");
            return;
        }

        const start = new Date(form.start_at);
        const end = new Date(form.end_at);

        if (end <= start) {
            setError("End time must be after start time.");
            return;
        }

        const problemsSolved = Number(
            form.problems_solved
        );

        const confidence = form.confidence
            ? Number(form.confidence)
            : null;

        if (
            !Number.isInteger(problemsSolved) ||
            problemsSolved < 0
        ) {
            setError(
                "Problems solved must be a non-negative number."
            );
            return;
        }

        if (
            confidence !== null &&
            (!Number.isInteger(confidence) ||
                confidence < 1 ||
                confidence > 5)
        ) {
            setError(
                "Confidence must be between 1 and 5."
            );
            return;
        }

        setSaving(true);

        try {
            const response = await apiFetch(
                "/study/sessions",
                {
                    method: "POST",
                    body: JSON.stringify({
                        subject_id: form.subject_id,
                        title:
                            form.title.trim() || null,
                        topic:
                            form.topic.trim() || null,
                        start_at:
                            start.toISOString(),
                        end_at:
                            end.toISOString(),
                        problems_solved:
                        problemsSolved,
                        confidence,
                        what_studied:
                            form.what_studied.trim() ||
                            null,
                        what_struggled:
                            form.what_struggled.trim() ||
                            null,
                        what_learned:
                            form.what_learned.trim() ||
                            null,
                    }),
                }
            );

            if (response.status === 401) {
                setError(
                    "Your session has expired. Please log in again."
                );
                return;
            }

            if (!response.ok) {
                const errorText =
                    await response.text();

                console.error(
                    "Study creation failed:",
                    response.status,
                    errorText
                );

                setError(
                    "Could not save the study session."
                );
                return;
            }

            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            setError(
                "Could not connect to the backend."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loadingSubjects) {
        return (
            <div className="study-loading">
                <div className="loading-dot" />
                <span>Loading your subjects...</span>
            </div>
        );
    }

    return (
        <div className="study-form">
            <div className="study-form-header">
                <div>
                    <div className="modal-eyebrow">
                        STUDY SESSION
                    </div>

                    <h2>Log your study</h2>

                    <p>
                        Capture what you worked on,
                        when you worked on it, and
                        what you learned.
                    </p>
                </div>

                <button
                    type="button"
                    className="modal-close"
                    onClick={onClose}
                    disabled={saving}
                >
                    ×
                </button>
            </div>

            {error && (
                <div className="form-error" role="alert">
                    {error}
                </div>
            )}

            {subjects.length === 0 ? (
                <div className="study-empty">
                    <div className="study-empty-icon">
                        ◇
                    </div>

                    <h3>No study subjects</h3>

                    <p>
                        Create a subject before logging
                        a study session.
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                    >
                        Go back
                    </button>
                </div>
            ) : (
                <form
                    className="study-form-fields"
                    onSubmit={handleSubmit}
                >
                    <div className="form-section">
                        <div className="form-section-title">
                            Session
                        </div>

                        <div className="form-grid">
                            <div className="field field-full">
                                <label htmlFor="subject">
                                    Subject
                                </label>

                                <select
                                    id="subject"
                                    value={
                                        form.subject_id
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "subject_id",
                                            event.target.value
                                        )
                                    }
                                >
                                    {subjects.map(
                                        (subject) => (
                                            <option
                                                key={
                                                    subject.id
                                                }
                                                value={
                                                    subject.id
                                                }
                                            >
                                                {
                                                    subject.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="title">
                                    Title
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    value={form.title}
                                    onChange={(event) =>
                                        updateField(
                                            "title",
                                            event.target.value
                                        )
                                    }
                                    placeholder="DSA Practice"
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="topic">
                                    Topic
                                </label>

                                <input
                                    id="topic"
                                    type="text"
                                    value={form.topic}
                                    onChange={(event) =>
                                        updateField(
                                            "topic",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Binary Search"
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="start_at">
                                    Started
                                </label>

                                <input
                                    id="start_at"
                                    type="datetime-local"
                                    value={
                                        form.start_at
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "start_at",
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="end_at">
                                    Finished
                                </label>

                                <input
                                    id="end_at"
                                    type="datetime-local"
                                    value={
                                        form.end_at
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "end_at",
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-title">
                            Progress
                        </div>

                        <div className="form-grid">
                            <div className="field">
                                <label htmlFor="problems_solved">
                                    Problems solved
                                </label>

                                <input
                                    id="problems_solved"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        form.problems_solved
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "problems_solved",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="confidence">
                                    Confidence
                                </label>

                                <select
                                    id="confidence"
                                    value={
                                        form.confidence
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "confidence",
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Not rated
                                    </option>
                                    <option value="1">
                                        1 — Very low
                                    </option>
                                    <option value="2">
                                        2 — Low
                                    </option>
                                    <option value="3">
                                        3 — Okay
                                    </option>
                                    <option value="4">
                                        4 — Good
                                    </option>
                                    <option value="5">
                                        5 — Strong
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-title">
                            Reflection
                        </div>

                        <div className="reflection-fields">
                            <div className="field">
                                <label htmlFor="what_studied">
                                    What did you study?
                                </label>

                                <textarea
                                    id="what_studied"
                                    rows={4}
                                    value={
                                        form.what_studied
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "what_studied",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Covered binary search, lower bound, upper bound..."
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="what_struggled">
                                    What did you struggle with?
                                </label>

                                <textarea
                                    id="what_struggled"
                                    rows={4}
                                    value={
                                        form.what_struggled
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "what_struggled",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Boundary conditions and choosing the correct loop..."
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="what_learned">
                                    What did you learn?
                                </label>

                                <textarea
                                    id="what_learned"
                                    rows={4}
                                    value={
                                        form.what_learned
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "what_learned",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Learned how lower_bound style searches work..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save study session"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}