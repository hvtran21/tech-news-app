import techGenres from '../../../constants';

// Maps each genre to its NewsAPI `/everything` search query string.
export const genreSearchQueries = new Map<string, string>([
    [techGenres.AI, '"artificial intelligence" OR "AI"'],
    [techGenres.ML, '"machine learning" OR "ML"'],
    [techGenres.MICROSOFT, 'Microsoft'],
    [techGenres.CYBERSECURITY, 'cybersecurity OR "cyber security"'],
    [techGenres.GAME_DEVELOPMENT, '"game development" OR gamedev OR "games industry"'],
    [techGenres.GAMING, 'gaming OR videogames OR "video games"'],
    [techGenres.APPLE, 'Apple'],
    [techGenres.AMAZON, 'Amazon'],
    [techGenres.GOOGLE, 'Google'],
    [techGenres.NINTENDO, 'Nintendo'],
    [techGenres.TESLA, 'Tesla OR "electric vehicle" OR EV'],
    [techGenres.SPACE_TECH, 'SpaceX OR NASA OR "space technology" OR satellite'],
    [techGenres.STARTUPS, 'startup OR "venture capital" OR "series A" OR YC'],
    [techGenres.BLOCKCHAIN, 'blockchain OR crypto OR "web3"'],
    [techGenres.ROBOTICS, 'robotics OR "humanoid robot" OR automation'],
]);
