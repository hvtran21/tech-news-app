import { Config } from "react-native-config"
import { techGenres } from "./article";

async function retrieveArticles() {
    try {
        var response = await fetch(`${Config.BASE_URL}/api/articles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                genre: techGenres.AI,
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var data = await response.json();

    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

export default retrieveArticles;