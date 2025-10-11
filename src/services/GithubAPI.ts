import axios, { AxiosRequestHeaders, AxiosResponse } from "axios"
import { RepositoryStargazerInfo } from "../types";

interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

const githubApiClient = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
        'User-Agent': 'markterence/hoshizora',
    }
});

export const createGithubGraphQLClient = (token?: string) => {
    const headers: AxiosRequestHeaders = {
        'Content-Type': 'application/json',
    } as AxiosRequestHeaders;

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return {
        query: async <T = any>(
            query: string, 
            variables?: Record<string, any>,
            headersOverride?: AxiosRequestHeaders
        ): Promise<GraphQLResponse<T>> => {
            try {
                const response: AxiosResponse<GraphQLResponse<T>> = await githubApiClient({
                    method: 'POST',
                    headers: { ...headers, ...headersOverride },
                    data: {
                        query,
                        variables
                    }
                });

                if (response.data.errors && response.data.errors.length > 0) {
                    console.error('GraphQL errors:', response.data.errors);
                }

                return response.data;
            } catch (error) {
                console.error('GitHub API request failed:', error);
                throw error;
            }
        },
    };
};

/**
 * Default GitHub GraphQL client instance
 */
export const githubClient = createGithubGraphQLClient(process.env.GITHUB_API_TOKEN);

export const getRepositoryInfo = async (owner: string, name: string, count: number) => {
    const query = `
        query GetRepository($owner: String!, $name: String!, $count: Int!) {
            repository(owner: $owner, name: $name) {
                id
                name,
                
                stargazerCount
                stargazers(first: $count, orderBy: {field: STARRED_AT, direction: DESC}) {
                    nodes {
                        avatarUrl 
                        login 
                    }
                }
                forkCount
            }
        }
    `;
    const result = await githubClient.query<{ repository: RepositoryStargazerInfo }>(query, { owner, name, count });

    return result?.data?.repository;
};
