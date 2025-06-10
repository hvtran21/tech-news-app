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
    AI = 'Artificial Intelligence',
    ML = 'Machine Learning',
    APPLE = 'Apple',
    INFO_TECH = 'Information Iechnology',
    ROBOTICS = 'Robotics',
    BIG_TECH = 'Big Tech',
    START_UPS = 'Start ups',
    MICROSOFT = 'Microsoft',
    AMAZON = 'Amazon',
    GAMING = 'Gaming',
    CYBERSECURITY = 'Cybersecurity',
    GAME_DEVELOPMENT = 'Game development'
}

export default article;
export {techGenres};
