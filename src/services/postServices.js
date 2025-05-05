const { elasticClient } = require("../config/elastic_search_config");
const Post = require("../models/postModel");
const User = require("../models/userModel");  // Bu satırı ekleyin
const logger = require("../utils/logger");
const createPost = async (title, content, tags, userId) => {
    try {
                // Cache'i temizle
                await redisClient.del('all_posts');
                await redisClient.del(`user_posts:${userId}`);
        // önce redisten  kontrol ediyoruz
        const cachedPosts = await redisClient.get("all_posts");
        if(cachedPosts) {
            logger.debug("Posts retrieved from Redis cache");
            return JSON.parse(cachedPosts);
        }
        // Kullanıcının var olup olmadığını kontrol et
        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`Post creation attempted with invalid user ID: ${userId}`);

            throw new Error("User not found");
        }
        const newPost = new Post({ title, content, tags, userId });
        await newPost.save();

        // elastic searche kaydetme işlemi
        await elasticClient.index({
            index: "posts",
            document:{
                title,
                content,
                tags,
                userId,
                postId: newPost._id.toString(),
                createdAt: new Date()
            }


        });
        logger.info(`New post created: ${newPost._id} by user ${userId}`);

        return {
            message: "Post created",
            postId: newPost._id,
        };
    } catch (error) {
        logger.error(`Error in createPost: ${error.message}`);

        throw new Error(error.message);
    }
};

// search işlemi için elastic search kullanıyoruz
const searchPosts= async (query)=> {
    try {
        const result = await elasticClient.search({
            index: "posts",
            body:{
                query:{
                    multi_match:{
                        query,
                        fields: ["title", "content", "tags"]
                    }
                }
            }

        });

        return result.hits.hits.map(hit => ({
            ...hit._source,
            score: hit._score
        }));
        } catch (error) {
            logger.error(`Error in searchPosts: ${error.message}`);
            throw new Error(error.message);
    }

}
const getAllPosts = async () => {
    try {
        // mongo dbden tüm postları getiriyoruz
        const posts = await Post.find({}).populate("userId", "username email").sort({ createdAt: -1 });

              // Elasticsearch'den de kontrol et ve senkronize et
              const elasticPosts = await elasticClient.search({
                index: 'posts',
                size: 10000 // Dikkat: Büyük veri setleri için pagination kullanılmalı
            });
            logger.debug(`Retrieved ${posts.length} posts from MongoDB and ${elasticPosts.hits.hits.length} from Elasticsearch`);


        return posts;
    } catch (error) {
        logger.error(`Error in getAllPosts: ${error.message}`);
        throw new Error(error.message);

    }
};
const getPostsByUserId = async (userId) => {
    try {
        const cachedPosts = await redisClient.get(`user_posts:${userId}`);
        if(cachedPosts){
            logger.info(`Retrieved posts for user ${userId} from Redis cache`);
            return JSON.parse(cachedPosts);
        }

        // öncce kullanıcı var mı onu kontrol ediyoruz 
        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`Posts requested for invalid user ID: ${userId}`);

            throw new Error("User not found");
        }
// mongodbden kullanıcnın postlarını getiriyoruz
        const posts = await Post.find({ userId }).populate("userId", "username email").sort({ createdAt: -1 });
    // elastic search den de kullanıcının postlarını getiriyoruz
    const elasticPosts= await elasticClient.search({
        index: "posts",
        body:{
            query:{
                match:{
                    userId: userId
                }
            }
        }
    });
    logger.debug(`Retrieved ${posts.length} posts for user: ${userId} from MongoDB and ${elasticPosts.hits.hits.length} from Elasticsearch`);
      // Redis'e cache'le
        await redisClient.set(`user_posts:${userId}`, JSON.stringify(posts), 'EX', 3600);
        return posts;
    } catch (error) {
        logger.error(`Error in getPostsByUserId: ${error.message}`);
        throw new Error(error.message
        );

    }
};
const getPostsByTag = async (tag) => {
    try {
        // mongo dbden tage göre postlarını getir 
        const posts = await Post.find({ tags: tag }).populate("userId", "username email").sort({ createdAt: -1 });
        // elastic search den de tag'e göre postları getiriyoruz
        const elasticPosts = await elasticClient.search({
            index: 'posts',
            body: {
                query: {
                    term: {
                        tags: tag
                    }
                }
            }
        });
        logger.debug(`Retrieved ${posts.length} posts with tag: ${tag}`);

        return posts;
    } catch (error) {
        logger.error(`Error in getPostsByTag: ${error.message}`);
        throw new Error(error.message);

    }
};
const getPostById = async (postId) => {
    try {
        const cachedPost = await redisClient.get(`post_${postId}`);
        if (cachedPost) {
            logger.debug(`Post retrieved from Redis cache: ${postId}`);
            return JSON.parse(cachedPost);
        }
        // MongoDB'den postu getir
        const post = await Post.findById(postId).populate("userId", "username email");
        
        if (!post) {
            // Elasticsearch'den de kontrol et
            const elasticPost = await elasticClient.get({
                index: 'posts',
                id: postId
            });

            if (!elasticPost.found) {
                logger.warn(`Post not found with ID: ${postId}`);
                throw new Error("Post not found");
            }
        }
       // Sonucu Redis'e 1 saat için cache'le
       await redisClient.set(`post:${postId}`, JSON.stringify(post), 'EX', 3600);
        logger.debug(`Retrieved post: ${postId}`);
        return post;
    } catch (error) {
        logger.error(`Error in getPostById: ${error.message}`);
        throw new Error(error.message);
    }
};

const updatePost = async (postId, userId, updateData) => {
    try {
                // Cache'i temizle
                await redisClient.del(`post:${postId}`);
                await redisClient.del('all_posts');
                await redisClient.del(`user_posts:${userId}`);
        // Önce kullanıcının var olup olmadığını kontrol et
        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`Post update attempted with invalid user ID: ${userId}`);

            throw new Error("User not found");
        }
        const post = await Post.findById(postId);
        if (!post) {
            logger.warn(`Update attempted on non-existent post: ${postId}`);
            throw new Error("Post not found");
        }

        if (post.userId.toString() !== userId) {
            logger.warn(`Unauthorized post update attempt: ${userId} tried to update post ${postId}`);
            throw new Error("You are not authorized to update this post");
        }
        // mongo db güncelleme işlemi

        const updatedPost = await Post.findByIdAndUpdate(postId, { $set: updateData }, { new: true, runValidators: true }).populate("userId", "username email");
        logger.info(`Post updated: ${postId} by user ${userId}`);

        // elastic search güncelleme işlemi
        await elasticClient.update( {
            index: 'posts',
            id: postId,
            doc: {
                title: updateData.title,
                content: updateData.content,
                tags: updateData.tags,
                updatedAt: new Date()
            }
        });
        logger.info(`Post updated in MongoDB and Elasticsearch: ${postId} by user ${userId}`);

        return updatedPost;
    } catch (error) {
        logger.error(`Error in updatePost: ${error.message}`);
        throw new Error(error.message);

    }
};
const deletePost = async (postId, userId) => {
    try {
                // Cache'i temizle
                await redisClient.del(`post:${postId}`);
                await redisClient.del('all_posts');
                await redisClient.del(`user_posts:${userId}`);
           // Önce kullanıcının var olup olmadığını kontrol et
           const user = await User.findById(userId);
           if (!user) {
            logger.warn(`Post deletion attempted with invalid user ID: ${userId}`);
            throw new Error("User not found");
        }
        const post = await Post.findById(postId);
        if (!post) {
            logger.warn(`Deletion attempted on non-existent post: ${postId}`);
            throw new Error("Post not found");
        }
      // mongo db den silme 
        await Post.findByIdAndDelete(postId);
        logger.info(`Post deleted: ${postId} by user ${userId}`);
// elastic search den silme işlemi
        await elasticClient.delete( {
            index: "posts",
            id: post._id.toString()
        });

        logger.info(`Post deleted from MongoDB and Elasticsearch: ${postId} by user ${userId}`);
        return { message: "Post deleted successfully", postId: postId };    } catch (error) {
            

        logger.error(`Error in deletePost: ${error.message}`);
        throw new Error(error.message);
    }

};
// data senkronizasyonu için elastic search ile mongo db arasında veri senkronizasyonu yapıyoruz
const syncPostToElastic = async (post) => {
    try {
        await elasticClient.index({
            index: 'posts',
            id: post._id.toString(),
            document: {
                title: post.title,
                content: post.content,
                tags: post.tags,
                userId: post.userId.toString(),
                postId: post._id.toString(),
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }
        });
    } catch (error) {
        logger.error(`Error syncing post to Elasticsearch: ${error.message}`);
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostsByUserId,
    getPostsByTag,
    getPostById,
    updatePost,
    deletePost,
    searchPosts,
    syncPostToElastic
};