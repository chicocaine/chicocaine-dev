import { lazy, Suspense } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { Link, useParams } from "react-router-dom";
import Prompt from "../components/Prompt";

// Every entry is generated into src/pages/blog/ by blog/blog-parser.c and is
// committed, so adding a post is one file in blog/entries/ plus `make gen` —
// no route table or listing to update.
const loaders = import.meta.glob<{ default: ComponentType }>("./blog/*.tsx");

// lazy() must be called once per module: calling it during render would build
// a new component on every pass and remount the page.
const cache = new Map<string, LazyExoticComponent<ComponentType>>();

function postFor(slug: string) {
  const key = `./blog/${slug}.tsx`;
  if (!(key in loaders)) return null;

  let post = cache.get(key);
  if (!post) {
    post = lazy(loaders[key] as () => Promise<{ default: ComponentType }>);
    cache.set(key, post);
  }
  return post;
}

function BlogPost() {
  const { slug = "" } = useParams();
  const Post = postFor(slug);

  if (!Post) {
    return (
      <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
        <p>
          <Prompt>
            <span className="text-text">cat</span>{" "}
            <span className="text-secondary">~</span>
            <span className="text-text-muted">/blog/{slug}.md</span>
          </Prompt>
        </p>

        <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
          <p className="text-danger">
            cat: /blog/{slug}.md: No such file or directory
          </p>
          <Link
            to="/blog"
            className="text-tertiary hover:text-primary transition-colors mt-4 inline-block"
          >
            <span className="select-none">&lt;- </span>
            <span className="text-text-muted">cd</span> ..
          </Link>
        </div>
      </main>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Post />
    </Suspense>
  );
}

export default BlogPost;
