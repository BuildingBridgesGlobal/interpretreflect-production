'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, ThumbsUp, Send, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  user_id: string;
  post_type: string;
  title: string | null;
  content: string;
  tags: string[];
  domain: string | null;
  anonymous: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  user_profiles?: {
    profile_type: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  anonymous: boolean;
  created_at: string;
  user_profiles?: {
    profile_type: string;
  };
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch post and comments
  useEffect(() => {
    if (!user) return;
    fetchPostData();
  }, [user, params.id]);

  const fetchPostData = async () => {
    try {
      setLoading(true);

      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profiles (profile_type)
        `)
        .eq('id', params.id)
        .single();

      if (postError) throw postError;
      setPost(postData);

      // Increment view count
      await supabase
        .from('community_posts')
        .update({ view_count: (postData.view_count || 0) + 1 })
        .eq('id', params.id);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select(`
          *,
          user_profiles (profile_type)
        `)
        .eq('post_id', params.id)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching post data:', error);
      toast.error('Failed to load post');
      router.push('/community');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('community_comments').insert({
        post_id: params.id,
        user_id: user.id,
        content: commentContent.trim(),
        anonymous: commentAnonymous,
        moderation_status: 'approved', // Auto-approve for MVP
      });

      if (error) throw error;

      toast.success('Comment posted!');
      setCommentContent('');
      setCommentAnonymous(false);
      fetchPostData();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !post || post.user_id !== user.id) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Post deleted');
      router.push('/community');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string, commentUserId: string) => {
    if (!user || commentUserId !== user.id) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comment deleted');
      fetchPostData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const getPostTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      question: { label: 'Question', color: 'bg-blue-100 text-blue-700' },
      discussion: { label: 'Discussion', color: 'bg-purple-100 text-purple-700' },
      resource_share: { label: 'Resource', color: 'bg-green-100 text-green-700' },
      peer_support: { label: 'Support', color: 'bg-orange-100 text-orange-700' },
      reflection: { label: 'Reflection', color: 'bg-teal-100 text-teal-700' },
    };

    const badge = badges[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color} font-mono uppercase tracking-wider`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-electric mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="text-center">
          <p className="text-brand-gray-600 font-body">Post not found</p>
          <Link
            href="/community"
            className="text-brand-electric hover:text-brand-electric-hover font-semibold mt-4 inline-block"
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-brand-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-brand-electric hover:text-brand-electric-hover font-semibold font-body mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Post Card */}
        <div className="bg-white rounded-data p-8 border border-brand-gray-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getPostTypeBadge(post.post_type)}
              {post.tags.length > 0 && (
                <div className="flex gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs text-brand-gray-600 bg-brand-gray-100 px-2 py-1 rounded font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {user && post.user_id === user.id && (
              <button
                onClick={handleDeletePost}
                className="text-brand-error hover:text-brand-error-dark flex items-center gap-1 text-sm font-body"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          {post.title && (
            <h1 className="text-3xl font-bold text-brand-primary mb-4 font-sans">
              {post.title}
            </h1>
          )}

          <p className="text-brand-gray-700 mb-6 whitespace-pre-wrap font-body leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center gap-6 text-sm text-brand-gray-500 pt-4 border-t border-brand-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-body">{comments.length} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              <span className="font-body">{post.like_count || 0} likes</span>
            </div>
            <span className="font-body">{post.view_count || 0} views</span>
            <span className="ml-auto font-body">{formatDate(post.created_at)}</span>
            {post.anonymous && (
              <span className="text-brand-gray-400 italic font-body">Anonymous</span>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-data p-6 border border-brand-gray-200">
          <h2 className="text-xl font-bold text-brand-primary mb-6 font-sans">
            Comments ({comments.length})
          </h2>

          {/* New Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="comment-anonymous"
                  checked={commentAnonymous}
                  onChange={(e) => setCommentAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-gray-300 text-brand-electric focus:ring-brand-electric"
                />
                <label htmlFor="comment-anonymous" className="text-sm text-brand-gray-700 font-body">
                  Comment anonymously
                </label>
              </div>
              <button
                type="submit"
                disabled={submitting || !commentContent.trim()}
                className="px-6 py-2 bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white rounded-data hover:shadow-lg font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-brand-gray-500 font-body">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-brand-gray-50 rounded-data border border-brand-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-brand-gray-600">
                      {comment.anonymous ? (
                        <span className="font-semibold font-body">Anonymous</span>
                      ) : (
                        <span className="font-semibold font-body">
                          {comment.user_profiles?.profile_type || 'Interpreter'}
                        </span>
                      )}
                      <span className="font-body">•</span>
                      <span className="font-body">{formatDate(comment.created_at)}</span>
                    </div>
                    {user && comment.user_id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id, comment.user_id)}
                        className="text-brand-error hover:text-brand-error-dark text-sm flex items-center gap-1 font-body"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-brand-gray-700 whitespace-pre-wrap font-body">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
