// this is what's used when connecting to the backend API endpoint
export interface article {
    id: string;
    source: string;
    author: string
    title: string;
    description: string;
    url: URL;
    urlToImage: URL;
    publishedAt: string;
    content: string | undefined;
}

export default article;
