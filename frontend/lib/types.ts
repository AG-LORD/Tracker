export type ActivityType = {
    id: string;
    code: string;
    name: string;
};

export type Activity = {
    id: string;
    user_id: string;
    activity_type_id: string;
    title: string | null;
    start_at: string;
    end_at: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    activity_type: ActivityType;
};