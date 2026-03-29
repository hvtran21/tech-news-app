enum techGenres {
    AI = 'Artificial Intelligence',
    ML = 'Machine Learning',
    APPLE = 'Apple',
    MICROSOFT = 'Microsoft',
    AMAZON = 'Amazon',
    GOOGLE = 'Google',
    GAMING = 'Gaming',
    CYBERSECURITY = 'Cybersecurity',
    GAME_DEVELOPMENT = 'Game development',
    NINTENDO = 'Nintendo',
    TESLA = 'Tesla',
    SPACE_TECH = 'Space Tech',
    STARTUPS = 'Startups',
    BLOCKCHAIN = 'Blockchain',
    ROBOTICS = 'Robotics',
}

enum categories {
    TECHNOLOGY = 'Technology',
}

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Curated reputable tech sources for higher quality content.
// Used as the `domains` param on the /everything endpoint.
export const curatedDomains = [
    'techcrunch.com',
    'theverge.com',
    'wired.com',
    'engadget.com',
    'techradar.com',
    'thenextweb.com',
    '9to5mac.com',
    '9to5google.com',
    'macrumors.com',
    'tomshardware.com',
    'theregister.com',
].join(',');

// Sources available on the top-headlines endpoint (subset of above).
export const curatedSources = [
    'techcrunch',
    'techradar',
    'the-next-web',
    'the-verge',
    'wired',
].join(',');

export default techGenres;
export { categories };
