'use client';

import { useEffect, useState } from 'react';
import { MainHeader } from "../components/components";
import { PostCard } from "../components/post-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add white background to the entire page
  useEffect(() => {
    document.body.style.backgroundColor = 'white';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/reddit');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCommentPosted = () => {
    // Refresh the posts after a comment is posted
    fetchPosts();
  };

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 space-y-6">
        <MainHeader />
        
        {error && (
          <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-4 bg-white border border-gray-200 shadow-sm">
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
                <Skeleton className="h-20 w-full bg-gray-200" />
              </div>
            </Card>
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onCommentPosted={handleCommentPosted}
            />
          ))
        ) : (
          <Card className="p-6 text-center text-gray-500 bg-white border border-gray-200 shadow-sm">
            No relevant posts found. Try refreshing the page or check back later.
          </Card>
        )}
      </div>
    </div>
    </div>
  );
}
