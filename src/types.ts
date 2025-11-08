
export interface StargazerUser {
    avatarUrl: string;
    login: string;
}
export interface StargazerNodes {
    nodes: StargazerUser[];
}
export interface RepositoryStargazerInfo {
    id: string;
    name: string;
    stargazerCount: number;
    forkCount: number;
    stargazers: StargazerNodes;
    owner: {
        login: string;
    }
}