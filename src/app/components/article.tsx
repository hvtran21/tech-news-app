export type article = {
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
