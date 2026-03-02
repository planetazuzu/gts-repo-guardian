export interface Profile {
    type: 'sanitario' | 'tech' | 'lab';
    repos: string[];
    template: string;
    requiredSections: string[];
}
export declare const PROFILES: Record<string, Profile>;
export declare const AUTHOR: {
    name: string;
    username: string;
    role: string;
    company: string;
    linkedin: string;
    github: string;
};
//# sourceMappingURL=profiles.d.ts.map