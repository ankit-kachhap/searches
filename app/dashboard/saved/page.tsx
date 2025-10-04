'use client';

import { useEffect, useState } from 'react';
import { MainHeader } from "../components/components";
import { PostCard } from "../components/post-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch('/api/posts/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch saved posts');
      }
      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load saved posts. Please try again later.');
      console.error('Error fetching saved posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = posts.filter(post => 
      post.title?.toLowerCase().includes(lowercaseQuery) ||
      post.text?.toLowerCase().includes(lowercaseQuery) ||
      post.subreddit?.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredPosts(filtered);
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 space-y-6">
        <MainHeader onSearch={handleSearch} />
        
        {error && (
          <div className="text-red-500 p-4 rounded-lg bg-red-50 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4 bg-white border border-gray-200 shadow-sm">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                  <Skeleton className="h-20 w-full bg-gray-200" />
                </div>
              </Card>
            ))
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                showSaveButton={false}
                isSavedView={true}
                onCommentPosted={() => {
                  // Remove the deleted post from both posts and filteredPosts
                  const updatedPosts = posts.filter(p => p._id !== post._id);
                  const updatedFilteredPosts = filteredPosts.filter(p => p._id !== post._id);
                  setPosts(updatedPosts);
                  setFilteredPosts(updatedFilteredPosts);
                }}
              />
            ))
          ) : (
            <Card className="p-6 text-center text-gray-500 bg-white border border-gray-200 shadow-sm">
              No saved posts found. Save some posts from the dashboard to see them here.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}