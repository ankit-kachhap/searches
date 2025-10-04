import Snoowrap from 'snoowrap';

if (!process.env.REDDIT_CLIENT_ID || 
    !process.env.REDDIT_CLIENT_SECRET || 
    !process.env.REDDIT_USERNAME || 
    !process.env.REDDIT_PASSWORD) {
  throw new Error('Missing Reddit API credentials in environment variables');
}

export const redditClient = new Snoowrap({
  userAgent: 'searches-App-v1.0.0',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

export const fetchRelevantPosts = async (brandKeywords: string[]) => {
  const posts = [];
  
  // Search across all of Reddit for each keyword
  for (const keyword of brandKeywords) {
    // Use Reddit's search functionality to find relevant posts across all subreddits
    const searchResults = await redditClient.search({
      query: keyword,
      sort: 'new',
      time: 'week',  // Look for posts from the last week
      limit: 25
    });

    // Filter out any posts that might not be suitable for brand promotion
    const relevantPosts = searchResults.filter(post => {
      // Exclude posts that are locked or archived
      if (post.locked || post.archived) return false;
      
      // Check if the post content is relevant to the brand
      const postContent = (post.title + ' ' + post.selftext).toLowerCase();
      return brandKeywords.some(kw => postContent.includes(kw.toLowerCase()));
    });

    posts.push(...relevantPosts);
  }

  // Remove duplicates based on post ID
  const uniquePosts = Array.from(new Map(posts.map(post => [post.id, post])).values());
  
  // Sort posts by engagement (upvotes + comments) to find the best opportunities
  const sortedPosts = uniquePosts.sort((a, b) => 
    (b.ups + b.num_comments) - (a.ups + a.num_comments)
  );

  return sortedPosts.slice(0, 10); // Return top 10 most relevant and engaging posts
};

export const postComment = async (postId: string, comment: string) => {
  try {
    const submission = redditClient.getSubmission(postId) as any;
    const response = await submission.reply(comment);
    return response;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};