enum techGenres {
    AI = 'Artificial Intelligence',
    ML = 'Machine Learning',
    APPLE = 'Apple',
    MICROSOFT = 'Microsoft',
    AMAZON = 'Amazon',
    GAMING = 'Gaming',
    CYBERSECURITY = 'Cybersecurity',
    GAME_DEVELOPMENT = 'Game development',
    NINTENDO = 'Nintendo',
}

enum categories {
    TECHNOLOGY = 'Technology',
}

export const DAYS_IN_SECONDS = 24 * 60 * 60 * 1000;

// Curated reputable tech sources for higher quality content.
// Used as the `domains` param on the /everything endpoint.
export const curatedDomains = [
    'arstechnica.com',
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
    'bleepingcomputer.com',
    'zdnet.com',
    'anandtech.com',
    'theregister.com',
].join(',');

// Sources available on the top-headlines endpoint (subset of above).
export const curatedSources = [
    'ars-technica',
    'engadget',
    'techcrunch',
    'techradar',
    'the-next-web',
    'the-verge',
    'wired',
].join(',');

export default techGenres;
export { categories };
