import Prompt from "../components/Prompt";
import { Link } from "react-router-dom";

const posts = [
  {
    slug: "the-cost-of-efficiency",
    label: "the-cost-of-efficiency.md",
    meta: "10-10-2026 · reflection",
  },
];

function Blog() {
  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">ls</span>{" "}
          <span className="text-text-muted">-la</span>{" "}
          <span className="text-secondary">~</span>
          <span className="text-text-muted">/blog/</span>
        </Prompt>
      </p>

      <div className="mt-6 pl-4 border-l-2 border-border max-w-2xl">
        <p className="text-text-muted text-xs select-none mb-4">
          <span className="text-primary">total</span>{" "}
          <span className="text-text">{posts.length}</span>
        </p>

        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block text-left w-full hover:bg-surface rounded px-2 py-1 -mx-2 transition-colors"
            >
              <p>
                <span className="text-text-muted select-none">
                  -rw-r--r--{" "}
                </span>
                <span className="text-primary hover:text-quaternary transition-colors">
                  {post.label}
                </span>
              </p>
              <p className="text-text-muted text-xs ml-4">{post.meta}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="pt-8">
        <Prompt>
          <span className="inline-block w-3 h-5 bg-text align-middle animate-pulse" />
        </Prompt>
      </p>
    </main>
  );
}

export default Blog;
