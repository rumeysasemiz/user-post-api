const {Client} = require('@elastic/elasticsearch');
const logger = require('../utils/logger');
const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: true,
});

const initializeElasticsearch = async () => {
    try {
        await elasticClient.indices.create( {
            index: "posts",
            body: {
                mappings: {
                    properties: {
                        title: { type: 'text' },
                        content: { type: 'text' },
                        tags: { type: 'keyword' },
                        userId: { type: 'keyword' },
                        createdAt: { type: 'date' }
                    }
                }
            }
        }, { ignore: [400] } );
                // Users index initialization
                await elasticClient.indices.create({
                    index: "users",
                    body: {
                        mappings: {
                            properties: {
                                username: { type: 'text' },
                                email: { type: 'keyword' },
                                role: { type: 'keyword' },
                                createdAt: { type: 'date' },
                                updatedAt: { type: 'date' }
                            }
                        }
                    }
                }, { ignore: [400] });
        
        logger.info('Elasticsearch index created successfully');
    } 
    catch (error) {
        logger.error('Error creating Elasticsearch index:', error);
        
    }
};
// Helper function to check if indices exist
const checkIndices = async () => {
    try {
        const postsExists = await elasticClient.indices.exists({ index: 'posts' });
        const usersExists = await elasticClient.indices.exists({ index: 'users' });
        
        logger.info(`Elasticsearch indices status - Posts: ${postsExists}, Users: ${usersExists}`);
        return { postsExists, usersExists };
    } catch (error) {
        logger.error('Error checking indices:', error);
        throw error;
    }
};

module.exports = {
    elasticClient,
    initializeElasticsearch,
    checkIndices,
};