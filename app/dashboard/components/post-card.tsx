'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: any; // Reddit post from Snoowrap
  onCommentPosted?: () => void;
  showSaveButton?: boolean;
  isSaved?: boolean;
  isSavedView?: boolean;
}

export function PostCard({ post, onCommentPosted, showSaveButton = true, isSaved = false, isSavedView = false }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(post.score);
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // In saved view, post.postUrl contains the URL, otherwise use post.url
      const postUrlToDelete = isSavedView ? post.postUrl : post.url;
      
      if (!postUrlToDelete) {
        throw new Error('No post URL found');
      }

      console.log('Deleting post with URL:', postUrlToDelete); // Debug log

      const response = await fetch(`/api/posts/saved?postUrl=${encodeURIComponent(postUrlToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText); // Debug log
        throw new Error(`Failed to delete post: ${errorText}`);
      }

      toast.success('Post deleted successfully');
      
      // Call the callback to update the parent's state first
      if (onCommentPosted) {
        onCommentPosted();
      }
      
      // Always update local state
      setIsSavedState(false);
      
      // Close the dialog immediately after successful deletion
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  const handleVote = (type: 'up' | 'down') => {
    if (vote === type) {
      setVote(null);
      setCurrentUpvotes(post.score);
    } else {
      setVote(type);
      setCurrentUpvotes(type === 'up' ? post.score + 1 : post.score - 1);
    }
  };

  const handleSavePost = async () => {
    setIsSaving(true);
    try {
      if (!isSavedState) {
        // Save the post
        const response = await fetch('/api/posts/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postUrl: post.url,
            title: post.title,
            content: post.selftext || post.url,
          }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            toast.error('Post already saved');
          } else {
            throw new Error('Failed to save post');
          }
        } else {
          setIsSavedState(true);
          toast.success('Post saved successfully');
        }
      } else {
        // Unsave the post
        const response = await fetch(`/api/posts/saved?postUrl=${encodeURIComponent(post.url)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove saved post');
        }
        setIsSavedState(false);
        toast.success('Post removed from saved');
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      toast.error('Failed to update saved status');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts/reddit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      toast.success('Comment posted successfully');
      setComment("");
      setIsCommenting(false);
      onCommentPosted?.();
    } catch (error) {
      toast.error('Failed to post comment. Please try again.');
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="group border hover:border-gray-300 border-gray-200 bg-white hover:bg-gray-50/50 transition-all duration-200 overflow-hidden shadow-sm hover:shadow">
      <div className="flex">
        {/* Vote buttons - only show in posts view */}
        {!isSavedView && (
          <div className="flex flex-col items-center px-4 py-3 bg-gray-50/50 group-hover:bg-white">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 rounded-md text-gray-500 hover:text-orange-500 hover:bg-orange-50",
                vote === 'up' && "text-orange-500 bg-orange-50"
              )}
              onClick={() => handleVote('up')}
            >
              <ArrowBigUp className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold my-1.5 tabular-nums text-gray-900">
              {currentUpvotes >= 1000 ? `${(currentUpvotes / 1000).toFixed(1)}k` : currentUpvotes}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 rounded-md text-gray-500 hover:text-blue-500 hover:bg-blue-50",
                vote === 'down' && "text-blue-500 bg-blue-50"
              )}
              onClick={() => handleVote('down')}
            >
              <ArrowBigDown className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Post metadata */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2">
            {post.subreddit?.display_name ? (
              <>
                <a 
                  href={`https://reddit.com/r/${post.subreddit.display_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:underline cursor-pointer"
                >
                  r/{post.subreddit.display_name}
                </a>
                <span className="mx-1.5">•</span>
                <span className="text-gray-500">
                  Posted by{" "}
                  <a 
                    href={`https://reddit.com/user/${post.author?.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline cursor-pointer"
                  >
                    u/{post.author?.name}
                  </a>
                </span>
                <span className="mx-1.5">•</span>
              </>
            ) : (
              <span className="text-gray-500"></span>
            )}
            <span>{post.created_utc ? formatDate(post.created_utc) : new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Post title and content */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              <a 
                href={post.permalink ? `https://reddit.com${post.permalink}` : post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 hover:underline"
              >
                {post.title}
              </a>
            </h2>
            
            {(post.selftext || post.content) && (
              <div className="prose prose-sm max-w-none text-gray-600 line-clamp-3">
                {post.selftext || post.content}
              </div>
            )}

            {post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && (
              <div className="mt-3">
                <img 
                  src={post.thumbnail}
                  alt={post.title}
                  className="rounded-md max-h-96 object-cover bg-gray-100"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-6">
            {/* Save button */}
            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent className='bg-gray-50 text-black'>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this saved post. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className='bg-white border-gray-200 hover:bg-gray-100 hover:text-black'>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Save button */}
            {showSaveButton && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-4 flex items-center gap-2 transition-all duration-200 px-[-2]",
                  isSavedState 
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50",
                  isSaving && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleSavePost}
                disabled={isSaving}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isSavedState ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-all duration-200",
                    isSavedState ? "scale-110" : "scale-100"
                  )}
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                {isSaving ? 'Saving...' : isSavedState ? 'Saved' : 'Save'}
              </Button>
            )}

            {/* Delete button (only shown in saved posts view) */}
            {isSavedView && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}