export type WebsiteStatus = 'active' | 'inactive' | 'suspended';

export interface Website {
    id: string;
    title: string;
    description?: string | null;
    subdomain: string;
    domain?: string | null;
    status: WebsiteStatus;
    status_label?: string;
    users_count?: number;
    created_at: string | null;
}

export const WEBSITE_STATUSES: WebsiteStatus[] = ['active', 'inactive', 'suspended'];

export const websiteStatusVariant = (status: WebsiteStatus): 'emerald' | 'slate' | 'amber' => {
    switch (status) {
        case 'active':
            return 'emerald';
        case 'suspended':
            return 'amber';
        default:
            return 'slate';
    }
};
