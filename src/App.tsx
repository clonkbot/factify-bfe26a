import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";

type Tab = "home" | "submit" | "admin" | "profile";
type Category = { _id: string; name: string; slug: string; icon: string; color: string };
type NewsItem = {
  _id: string;
  title: string;
  content: string;
  sourceUrl?: string;
  category: string;
  submittedAt: number;
  aiVerdict?: "real" | "fake" | "pending";
  aiReason?: string;
  manualVerdict?: "real" | "fake";
  isManuallyVerified: boolean;
};

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const seedCategories = useMutation(api.categories.seed);

  useEffect(() => {
    if (isAuthenticated) {
      seedCategories();
    }
  }, [isAuthenticated, seedCategories]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-24">
        {activeTab === "home" && <HomeFeed />}
        {activeTab === "submit" && <SubmitNews />}
        {activeTab === "admin" && <AdminPanel />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-4xl md:text-5xl">🔍</span>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Factify</h1>
        <p className="text-blue-200 mt-2 text-sm md:text-base">Verifying truth...</p>
      </div>
    </div>
  );
}

function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", flow);
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 md:mb-10">
            <div className="relative inline-block">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl md:text-5xl">🔍</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Factify</h1>
            <p className="text-blue-200 mt-2 text-sm md:text-base">AI-Powered News Verification</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
              {flow === "signIn" ? "Welcome back" : "Create account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none text-base"
              >
                {loading ? "Please wait..." : flow === "signIn" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400">or</span>
              </div>
            </div>

            <button
              onClick={() => signIn("anonymous")}
              className="mt-6 w-full border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-medium py-3 rounded-xl transition-colors text-sm md:text-base"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
      <Footer light />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-lg md:text-xl">🔍</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[8px]">✓</span>
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Factify</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-slate-500 bg-slate-100 px-2 md:px-3 py-1 rounded-full">
            AI Verified
          </span>
        </div>
      </div>
    </header>
  );
}

function HomeFeed() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = useQuery(api.categories.list);
  const news = useQuery(api.news.listVerified, { category: selectedCategory === "all" ? undefined : selectedCategory });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
      {/* Category Pills */}
      <div className="mb-4 md:mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
            }`}
          >
            All News
          </button>
          {categories?.map((cat: Category) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
              }`}
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* News Cards */}
      {news === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl md:text-4xl">📰</span>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No verified news yet</h3>
          <p className="text-slate-500 text-sm md:text-base">Check back soon for fact-checked stories</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item: NewsItem) => (
            <NewsCard key={item._id} news={item} categories={categories || []} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsCard({ news, categories }: { news: NewsItem; categories: Category[] }) {
  const category = categories.find((c) => c.slug === news.category);
  const isReal = news.manualVerdict === "real" || news.aiVerdict === "real";
  const verdict = news.manualVerdict || news.aiVerdict;
  const reason = news.aiReason;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 md:p-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {category && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {category.icon} {category.name}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {formatTime(news.submittedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-2 leading-snug">
          {news.title}
        </h3>

        {/* Content preview */}
        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {news.content}
        </p>

        {/* Verdict Badge */}
        <div className={`rounded-xl p-3 md:p-4 ${isReal ? "bg-emerald-50" : "bg-red-50"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-sm ${
              isReal ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}>
              {isReal ? "✓" : "✗"}
            </span>
            <span className={`font-bold text-sm md:text-base ${isReal ? "text-emerald-700" : "text-red-700"}`}>
              {verdict === "real" ? "VERIFIED REAL" : "MARKED FAKE"}
            </span>
            <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">
              AI
            </span>
          </div>
          <p className={`text-xs md:text-sm ${isReal ? "text-emerald-600" : "text-red-600"}`}>
            {reason}
          </p>
        </div>

        {/* Source */}
        {news.sourceUrl && (
          <a
            href={news.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium"
          >
            <span>🔗</span>
            View Source
          </a>
        )}
      </div>
    </article>
  );
}

function SubmitNews() {
  const categories = useQuery(api.categories.list);
  const submitNews = useMutation(api.news.submit);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    try {
      await submitNews({
        title,
        content,
        sourceUrl: sourceUrl || undefined,
        category,
      });
      setSuccess(true);
      setTitle("");
      setContent("");
      setSourceUrl("");
      setCategory("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <span className="text-xl md:text-2xl">📝</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">Submit News</h2>
            <p className="text-slate-500 text-xs md:text-sm">AI will analyze and verify your submission</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
            ✓ News submitted! AI is analyzing it now.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base bg-white"
              required
            >
              <option value="">Select a category</option>
              {categories?.map((cat: Category) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base"
              placeholder="Enter the news headline"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none text-base"
              placeholder="Describe the news in detail..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Source URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none text-base"
          >
            {loading ? "Submitting..." : "Submit for AI Verification"}
          </button>
        </form>

        <div className="mt-4 p-3 md:p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-xs md:text-sm text-yellow-800">
              <strong>How it works:</strong> Our AI analyzes your submission and provides a preliminary verdict. An admin will then manually verify it before it appears on the home feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const user = useQuery(api.users.currentUser);
  const categories = useQuery(api.categories.list);
  const pendingNews = useQuery(api.news.listPending);
  const adminCreate = useMutation(api.news.adminCreate);
  const verifyNews = useMutation(api.news.verify);
  const deleteNews = useMutation(api.news.deleteNews);
  const initFirstAdmin = useMutation(api.users.initFirstAdmin);

  const [activeAdminTab, setActiveAdminTab] = useState<"pending" | "create">("pending");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState("");
  const [verdict, setVerdict] = useState<"real" | "fake">("real");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBecomeAdmin = async () => {
    try {
      const result = await initFirstAdmin();
      if (result) {
        alert("You are now an admin!");
      } else {
        alert("Admin already exists. Contact existing admin.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setLoading(true);
    try {
      await adminCreate({
        title,
        content,
        sourceUrl: sourceUrl || undefined,
        category,
        verdict,
        reason,
      });
      setSuccess(true);
      setTitle("");
      setContent("");
      setSourceUrl("");
      setCategory("");
      setReason("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (newsId: string, newsVerdict: "real" | "fake") => {
    await verifyNews({ newsId: newsId as any, verdict: newsVerdict });
  };

  const handleDelete = async (newsId: string) => {
    if (confirm("Are you sure you want to delete this news?")) {
      await deleteNews({ newsId: newsId as any });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl md:text-4xl">🔒</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Admin Access Required</h2>
          <p className="text-slate-500 text-sm md:text-base mb-6">This area is for verified administrators only.</p>
          <button
            onClick={handleBecomeAdmin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm md:text-base"
          >
            Become First Admin
          </button>
          <p className="text-xs text-slate-400 mt-3">Only works if no admin exists yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
      {/* Admin Tabs */}
      <div className="flex gap-2 mb-4 md:mb-6">
        <button
          onClick={() => setActiveAdminTab("pending")}
          className={`flex-1 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
            activeAdminTab === "pending"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Pending Review {pendingNews && pendingNews.length > 0 && (
            <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
              {pendingNews.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab("create")}
          className={`flex-1 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${
            activeAdminTab === "create"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Add Post
        </button>
      </div>

      {activeAdminTab === "pending" ? (
        <div className="space-y-4">
          {pendingNews === undefined ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 h-48" />
              ))}
            </div>
          ) : pendingNews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">All caught up!</h3>
              <p className="text-slate-500 text-sm">No pending news to review</p>
            </div>
          ) : (
            pendingNews.map((news: NewsItem) => (
              <div key={news._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-slate-400">{formatTime(news.submittedAt)}</span>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-2">{news.title}</h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{news.content}</p>

                {/* AI Verdict */}
                <div className={`rounded-xl p-3 mb-4 ${
                  news.aiVerdict === "real" ? "bg-emerald-50" : news.aiVerdict === "fake" ? "bg-red-50" : "bg-slate-50"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">
                      AI Verdict
                    </span>
                    <span className={`font-semibold text-sm ${
                      news.aiVerdict === "real" ? "text-emerald-700" : news.aiVerdict === "fake" ? "text-red-700" : "text-slate-600"
                    }`}>
                      {news.aiVerdict?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{news.aiReason}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(news._id, "real")}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    ✓ Verify Real
                  </button>
                  <button
                    onClick={() => handleVerify(news._id, "fake")}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    ✗ Mark Fake
                  </button>
                  <button
                    onClick={() => handleDelete(news._id)}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-xl md:text-2xl">➕</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Add Verified Post</h2>
              <p className="text-slate-500 text-xs md:text-sm">Publish directly to the home feed</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              ✓ Post published successfully!
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Verdict</label>
                <select
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value as "real" | "fake")}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base bg-white"
                >
                  <option value="real">✓ Real</option>
                  <option value="fake">✗ Fake</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Headline</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base"
                placeholder="Enter the news headline"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none text-base"
                placeholder="Describe the news in detail..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Verification Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none text-base"
                placeholder="Explain why this is real or fake..."
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Source URL <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none text-base"
            >
              {loading ? "Publishing..." : "Publish to Feed"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ProfileScreen() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="text-3xl md:text-4xl">👤</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            {user?.email || "Guest User"}
          </h2>
          {user?.isAdmin && (
            <span className="inline-block mt-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              ADMIN
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-slate-600 text-sm md:text-base">Account Status</span>
            <span className="text-emerald-600 font-medium text-sm md:text-base">Active</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-slate-600 text-sm md:text-base">Role</span>
            <span className="text-slate-800 font-medium text-sm md:text-base">
              {user?.isAdmin ? "Administrator" : "Member"}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 md:py-4 rounded-xl transition-colors text-base"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const user = useQuery(api.users.currentUser);

  const tabs = [
    { id: "home" as Tab, icon: "🏠", label: "Home" },
    { id: "submit" as Tab, icon: "📝", label: "Submit" },
    { id: "admin" as Tab, icon: "⚙️", label: "Admin", adminOnly: true },
    { id: "profile" as Tab, icon: "👤", label: "Profile" },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || user?.isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 md:py-3 transition-colors min-h-[56px] md:min-h-[64px] ${
                activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="text-xl md:text-2xl mb-0.5">{tab.icon}</span>
              <span className="text-[10px] md:text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Footer({ light = false }: { light?: boolean }) {
  return (
    <footer className={`py-4 text-center ${light ? "text-blue-300/60" : "text-slate-400"}`}>
      <p className="text-xs">
        Requested by <span className="font-medium">@hiddendeg</span> · Built by <span className="font-medium">@clonkbot</span>
      </p>
    </footer>
  );
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default App;
