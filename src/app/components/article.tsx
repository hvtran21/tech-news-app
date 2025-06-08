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
    DEVOPS = 'Dev Ops',
    WEBDEV = 'Web Dev',
    INFO_TECH = 'Information Iechnology',
    ROBOTICS = 'Robotics',
    BIG_TECH = 'Big Tech',
    // ENGINEERING = 'Engineering',
    START_UPS = 'Start-ups',
    GOOGLE = 'Google',
    APPLE = 'Apple',
    MICROSOFT = 'Microsoft',
    AMAZON = 'Amazon',
    GAMING = 'Gaming',
    CYBERSECURITY = 'Cybersecurity',
    GAME_DEV = 'Grame development'
}

export default article;
export {techGenres};
