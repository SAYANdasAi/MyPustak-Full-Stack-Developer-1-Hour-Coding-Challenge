"use client";

import { useState, useEffect, useCallback } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
}

export default function Home() {
  // Posts states
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search filter state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Toast notification states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/posts";

  // Trigger toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch posts from backend or load from localStorage if offline
  const fetchPosts = useCallback(async () => {
    // Defer state updates to avoid synchronous setState inside useEffect
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.statusText}`);
      }
      const data: Post[] = await res.json();
      setPosts(data);
      setIsOffline(false);
      // Synchronize to localStorage
      localStorage.setItem("mypustak_posts", JSON.stringify(data));
    } catch (err) {
      console.error("Backend offline. Falling back to localStorage:", err);
      setIsOffline(true);
      setError("Unable to connect to backend server. Running in Local Storage Mode.");
      
      // Load from localStorage
      const cachedPosts = localStorage.getItem("mypustak_posts");
      if (cachedPosts) {
        setPosts(JSON.parse(cachedPosts));
      } else {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Save changes to localStorage in offline mode
  const saveToLocal = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem("mypustak_posts", JSON.stringify(updatedPosts));
  };

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const titleTrimmed = title.trim();
    const bodyTrimmed = body.trim();

    // Basic Validation
    if (!titleTrimmed || !bodyTrimmed) {
      setFormError("Both title and body are required and cannot be empty.");
      return;
    }

    setSubmitting(true);

    if (isOffline) {
      // Offline mode: generate a client-side ID and save to localStorage
      const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
      const newPost: Post = {
        id: newId,
        title: titleTrimmed,
        body: bodyTrimmed
      };
      saveToLocal([...posts, newPost]);
      setTitle("");
      setBody("");
      setToast({ message: "Post saved locally (Offline Mode)!", type: "info" });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: titleTrimmed,
          body: bodyTrimmed,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create post: ${res.statusText}`);
      }

      const newPost: Post = await res.json();
      const updated = [...posts, newPost];
      setPosts(updated);
      localStorage.setItem("mypustak_posts", JSON.stringify(updated));
      setTitle("");
      setBody("");
      setToast({ message: "Post created successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create post.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (id: number) => {
    if (isOffline) {
      // Offline mode: delete directly from localStorage
      const updated = posts.filter((post) => post.id !== id);
      saveToLocal(updated);
      setToast({ message: "Post deleted locally (Offline Mode)!", type: "info" });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete post: ${res.statusText}`);
      }

      const updated = posts.filter((post) => post.id !== id);
      setPosts(updated);
      localStorage.setItem("mypustak_posts", JSON.stringify(updated));
      setToast({ message: "Post deleted successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete post.";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-medium ${toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : toast.type === "info"
                  ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
              }`}
          >
            {toast.type === "success" || toast.type === "info" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Main Layout container */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header */}
        <header className="mb-12 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
                M
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                MyPustak Post Manager
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
              A responsive, premium dashboard with automatic local storage synchronization and offline support.
            </p>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {isOffline ? "Local Storage Mode" : "API Connection Active"}
            </span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Post
              </h2>

              <form onSubmit={handleCreatePost} className="space-y-5">
                <div>
                  <label htmlFor="post-title" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="post-title"
                    placeholder="Enter an engaging title..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="post-body" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Content
                  </label>
                  <textarea
                    id="post-body"
                    rows={5}
                    placeholder="Write your thoughts..."
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Search & Posts List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search posts by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition"
              />
            </div>

            {/* Error / Alert Message */}
            {isOffline && (
              <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-300">Local Storage Mode</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      {error} Any additions or deletions will affect local storage.
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition duration-150 shrink-0 self-start sm:self-center cursor-pointer"
                >
                  Retry API Connection
                </button>
              </div>
            )}

            {/* Main Content Area */}
            {loading ? (
              // Loading Skeleton States
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4 animate-pulse"
                  >
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              // Displaying Posts
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 relative flex flex-col justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-3">
                        {post.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {post.body}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md">
                        ID: {post.id}
                      </span>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Delete Post"
                        aria-label={`Delete post ${post.title}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="font-bold text-zinc-950 dark:text-zinc-50 mb-1">No posts found</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {searchQuery ? "No posts match your search query. Try typing something else!" : "Be the first to share your thoughts and create a post!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
