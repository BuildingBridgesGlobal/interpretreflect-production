'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, ThumbsUp, Send, Plus, Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  comment_count?: number;
}

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch posts
  useEffect(() => {
    if (!user) return;
    fetchPosts();
  }, [user, filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          user_profiles (profile_type)
        `)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('post_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get comment counts for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from('community_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return { ...post, comment_count: count || 0 };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-electric mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-brand-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary font-sans">
                Interpreter Community
              </h1>
              <p className="text-brand-gray-600 mt-1 font-body">
                Connect with peers, share insights, and grow together
              </p>
            </div>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white font-bold px-6 py-3 rounded-data hover:shadow-lg transition-all flex items-center gap-2 font-sans"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>

            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Posts' },
                { value: 'question', label: 'Questions' },
                { value: 'discussion', label: 'Discussions' },
                { value: 'resource_share', label: 'Resources' },
                { value: 'peer_support', label: 'Support' },
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`px-4 py-2 rounded-data font-medium transition font-body ${
                    filter === filterOption.value
                      ? 'bg-brand-electric text-white'
                      : 'bg-white text-brand-gray-700 border border-brand-gray-300 hover:border-brand-electric'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-electric mx-auto mb-4"></div>
            <p className="text-brand-gray-600 font-body">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-data p-12 text-center border border-brand-gray-200">
            <MessageSquare className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-primary mb-2 font-sans">
              No posts yet
            </h3>
            <p className="text-brand-gray-600 mb-6 font-body">
              Be the first to start a conversation in the community!
            </p>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white font-bold px-6 py-3 rounded-data hover:shadow-lg transition-all inline-flex items-center gap-2 font-sans"
            >
              <Plus className="w-5 h-5" />
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onRefresh={fetchPosts} />
            ))}
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onSuccess={() => {
            setShowNewPostModal(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}

// Post Card Component
function PostCard({ post, onRefresh }: { post: Post; onRefresh: () => void }) {
  const router = useRouter();

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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={() => router.push(`/community/${post.id}`)}
      className="bg-white rounded-data p-6 border border-brand-gray-200 hover:border-brand-electric transition-all cursor-pointer hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getPostTypeBadge(post.post_type)}
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs text-brand-gray-600 bg-brand-gray-100 px-2 py-1 rounded font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <span className="text-sm text-brand-gray-500 ml-auto font-body">
              {formatDate(post.created_at)}
            </span>
          </div>

          {post.title && (
            <h3 className="text-xl font-bold text-brand-primary mb-2 font-sans">
              {post.title}
            </h3>
          )}

          <p className="text-brand-gray-700 mb-4 line-clamp-3 font-body">
            {post.content}
          </p>

          <div className="flex items-center gap-6 text-sm text-brand-gray-500">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-body">{post.comment_count || 0} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              <span className="font-body">{post.like_count || 0} likes</span>
            </div>
            {post.anonymous && (
              <span className="text-brand-gray-400 italic font-body">Anonymous</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// New Post Modal Component
function NewPostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [postType, setPostType] = useState<string>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        post_type: postType,
        title: title.trim() || null,
        content: content.trim(),
        tags: tags,
        anonymous: anonymous,
        moderation_status: 'approved', // Auto-approve for MVP
      });

      if (error) throw error;

      toast.success('Post created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-data max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-brand-gray-200">
          <h2 className="text-2xl font-bold text-brand-primary font-sans">Create New Post</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Post Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'question', label: 'Question', icon: '❓' },
                { value: 'discussion', label: 'Discussion', icon: '💬' },
                { value: 'resource_share', label: 'Resource', icon: '📚' },
                { value: 'peer_support', label: 'Support', icon: '🤝' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`p-3 border-2 rounded-data transition font-body ${
                    postType === type.value
                      ? 'border-brand-electric bg-brand-electric-light text-brand-charcoal'
                      : 'border-brand-gray-200 hover:border-brand-electric/50 text-brand-charcoal'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Title (optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or resources..."
              rows={6}
              required
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Tags (up to 5)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
                disabled={tags.length >= 5}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 5 || !tagInput.trim()}
                className="px-4 py-2 bg-brand-electric text-white rounded-data hover:bg-brand-electric-hover disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 bg-brand-gray-100 text-brand-gray-700 px-3 py-1 rounded-full text-sm font-mono"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-brand-error"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-brand-gray-300 text-brand-electric focus:ring-brand-electric"
            />
            <label htmlFor="anonymous" className="text-sm text-brand-gray-700 font-body">
              Post anonymously
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-brand-gray-300 text-brand-gray-700 rounded-data hover:bg-brand-gray-50 font-sans font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white rounded-data hover:shadow-lg font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
