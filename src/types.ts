
export interface Stargazers {
    nodes: Array<{
        avatarUrl: string;
        login: string;
    }>;
}
export interface RepositoryStargazerInfo {
    id: string;
    name: string;
    stargazerCount: number;
    forkCount: number;
    stargazers: Stargazers;
}