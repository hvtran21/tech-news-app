import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tech News API',
            version: '1.0.0',
            description: 'API for fetching and managing tech news articles',
        },
        servers: [
            {
                url: 'http://localhost:{port}',
                variables: {
                    port: {
                        default: '8000',
                    },
                },
            },
        ],
    },
    apis: ['./src/index.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
