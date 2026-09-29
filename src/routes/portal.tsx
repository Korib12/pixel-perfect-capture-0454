import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, LogOut, MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Aether Studio" },
      {
        name: "description",
        content:
          "Sign in to the Aether Studio client portal to post project ideas and join studio discussions.",
      },
      { property: "og:title", content: "Client Portal — Aether Studio" },
      {
        property: "og:description",
        content: "Post project ideas and join the Aether Studio project board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});

const inputClass =
  "w-full border-b border-glass-border bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-accent transition-colors";

function Portal() {
  const { user, loading } = useAuth();

  return (
    <div className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="eyebrow">Client portal</p>
          <h1 className="display-lg mt-3">Project Board</h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A shared space for clients and the studio: post an idea, respond to others, and
            watch the thread update live.
          </p>
        </Reveal>

        <div className="mt-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <Board />
          ) : (
            <AuthPanel />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
          data: { display_name: displayName || email.split("@")[0] },
        },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (!data.session) {
        toast.success("Check your email to confirm your account.");
        return;
      }
      toast.success("Welcome to the board.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Signed in.");
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed. Please try again.");
  }

  return (
    <div className="glass mx-auto max-w-md p-8">
      <div className="flex gap-2">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              "flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors " +
              (mode === m
                ? "bg-primary text-primary-foreground"
                : "border border-glass-border text-muted-foreground hover:text-foreground")
            }
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-6">
        {mode === "signup" && (
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className={inputClass}
          />
        )}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
        />
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span className="h-px flex-1 bg-glass-border" /> or <span className="h-px flex-1 bg-glass-border" />
      </div>

      <button
        onClick={google}
        className="w-full rounded-full border border-glass-border py-3 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-secondary"
      >
        Continue with Google
      </button>
    </div>
  );
}

type Post = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
};
type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

const CATEGORIES = ["General", "Residential", "Cultural", "Hospitality", "Urban"];

function Board() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("board")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        void qc.invalidateQueries({ queryKey: ["posts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        void qc.invalidateQueries({ queryKey: ["comments"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const posts = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  const comments = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Comment[];
    },
  });

  const profiles = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, display_name");
      if (error) throw error;
      return Object.fromEntries(data.map((p) => [p.id, p.display_name])) as Record<string, string>;
    },
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]!);

  const createPost = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("posts")
        .insert({ user_id: user!.id, title, body, category });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setBody("");
      toast.success("Posted to the board.");
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => toast.error("Couldn't publish your post."),
  });

  const nameOf = (id: string) => profiles.data?.[id] ?? "Member";

  return (
    <div className="space-y-12">
      <div className="glass flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{user?.email}</span>
        </p>
        <button
          onClick={async () => {
            await qc.cancelQueries();
            qc.clear();
            await signOut();
            toast.message("Signed out.");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-xs uppercase tracking-[0.18em] hover:bg-secondary"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate();
        }}
        className="glass space-y-6 p-6 md:p-8"
      >
        <h2 className="font-display text-xl font-bold uppercase">Post a project idea</h2>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className={inputClass}
        />
        <textarea
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe the site, the idea, the question…"
          className={inputClass + " resize-none"}
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-glass-border bg-transparent px-4 py-2 text-xs uppercase tracking-[0.16em] outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-popover text-popover-foreground">
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createPost.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {createPost.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Publish
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {posts.isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {posts.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No discussions yet. Start the first one.</p>
        )}
        <AnimatePresence initial={false}>
          {posts.data?.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <PostCard
                post={post}
                author={nameOf(post.user_id)}
                comments={(comments.data ?? []).filter((c) => c.post_id === post.id)}
                nameOf={nameOf}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PostCard({
  post,
  author,
  comments,
  nameOf,
}: {
  post: Post;
  author: string;
  comments: Comment[];
  nameOf: (id: string) => string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);

  const addComment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("comments")
        .insert({ post_id: post.id, user_id: user!.id, body: reply });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply("");
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => toast.error("Couldn't add your comment."),
  });

  const removePost = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.message("Post deleted.");
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <article className="glass p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-glass-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {post.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {author} · {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      <h3 className="mt-4 font-display text-2xl font-bold uppercase">{post.title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {post.body}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" /> {comments.length} comment
          {comments.length === 1 ? "" : "s"}
        </button>
        {user?.id === post.user_id && (
          <button
            onClick={() => removePost.mutate()}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        )}
      </div>

      {open && (
        <div className="hairline mt-6 pt-6">
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {nameOf(c.user_id)}
                </span>
                <p className="mt-1 text-muted-foreground">{c.body}</p>
              </li>
            ))}
            {comments.length === 0 && (
              <li className="text-sm text-muted-foreground">No comments yet.</li>
            )}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (reply.trim()) addComment.mutate();
            }}
            className="mt-6 flex items-center gap-3"
          >
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a comment…"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={addComment.isPending}
              className="rounded-full bg-primary px-5 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
            >
              Reply
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
