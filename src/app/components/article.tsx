// this is what's used when connecting to the backend API endpoint
interface article {
    id: string;
    source: string;
    author: string;
    title: string;
    description: string;
    url: URL;
    urlToImage: URL;
    publishedAt: string;
    content?: string;
}

enum techGenres {
    AI = 'artificial intelligence',
    DEVOPS = 'development operations',
    WEBDEV = 'web development',
    IT = 'information technology',
    ROBOTICS = 'robotics',
    TOP_NEWS_TECH = 'top tech news',
    ENGINEERING = 'engineering',
    START_UPS = 'Top start ups',
    GOOGLE = 'Google',
    APPLE = 'Apple',
}

export default article;
export {techGenres};
