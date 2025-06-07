import * as SQLite from 'expo-sqlite';
import retrieveArticles from '../components/article_api';

const db = SQLite.openDatabaseAsync('articles.db');


