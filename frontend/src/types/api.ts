export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// User & Access
export interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
    phone?: string | null;
    bio?: string | null;
    division?: string | null;
    avatar?: string | null;
    status?: string;
    has_password?: boolean;
    google_id?: string | null;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    roles?: Role[];
}

export interface UserStats {
    total_projects: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

// CRM
export interface Client {
    id: number;
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: number;
    client_id: number;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Contract {
    id: number;
    project_id: number;
    contract_number: string;
    start_date?: string;
    end_date?: string;
    value?: number;
    created_at: string;
    updated_at: string;
}

// Financials
export interface ProjectFinancial {
    id: number;
    project_id: number;
    total_budget?: number;
    used_budget?: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectPayment {
    id: number;
    project_id: number;
    amount: number;
    payment_date?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectCost {
    id: number;
    project_id: number;
    amount: number;
    description?: string;
    cost_date?: string;
    created_at: string;
    updated_at: string;
}

// Operations / Production
export interface ProjectOutput {
    id: number;
    project_id: number;
    output_type_id?: number;
    description?: string;
    target_date?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Brief {
    id: number;
    project_id: number;
    title: string;
    content?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ContentPlan {
    id: number;
    project_id: number;
    output_type_id?: number;
    title: string;
    description?: string;
    publish_date?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Script {
    id: number;
    content_plan_id: number;
    title: string;
    content?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Task Management
export interface Task {
    id: number;
    project_id: number;
    title: string;
    description?: string;
    status: string;
    due_date?: string;
    priority: string;
    created_at: string;
    updated_at: string;
}

export interface TaskAssignment {
    id: number;
    task_id: number;
    user_id: number;
    assigned_by?: number;
    assigned_at?: string;
    deadline?: string;
    priority: string;
    extra_brief?: string;
    personal_notes?: string;
    created_at: string;
    updated_at: string;
}

// File Management
export interface File {
    id: number;
    project_id: number;
    task_id?: number;
    name: string;
    file_type_id: number;
    path?: string;
    uploaded_by?: number;
    current_version_id?: number;
    created_at: string;
    updated_at: string;
}

export interface FileVersion {
    id: number;
    file_id: number;
    version_number: number;
    path?: string;
    uploaded_by?: number;
    approval_status: string;
    revision_reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Approvals & Revisions
export interface Approval {
    id: number;
    approvable_type: string;
    approvable_id: number;
    approval_type: string;
    user_id?: number;
    client_name?: string;
    status: string;
    comments?: string;
    reviewed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Revision {
    id: number;
    revisionable_type: string;
    revisionable_id: number;
    requested_by?: number;
    description?: string;
    status: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
}

// Notifications
export interface Notification {
    id: string; // usually UUID
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: Record<string, unknown>;
    read_at?: string;
    created_at: string;
    updated_at: string;
}
