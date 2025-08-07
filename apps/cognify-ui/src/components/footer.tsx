import Link from "next/link";
import { Logo } from "./logo";

export default function Footer() {
  const platformLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/knowledge-graphs", label: "Knowledge Graphs" },
  ];

  const companyLinks = [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
  ];

  const supportLinks = [{ href: "/contact", label: "Contact" }];

  return (
    <footer className="bg-gray-900 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold text-white">
                Cognify Academy
              </span>
            </div>
            <p className="text-sm">
              Making complex knowledge accessible through connected learning
              experiences.
            </p>
          </div>
          <FooterLinkSection title="Platform" links={platformLinks} />
          <FooterLinkSection title="Company" links={companyLinks} />
          <FooterLinkSection title="Support" links={supportLinks} />
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Cognify Academy. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-semibold text-white">{title}</h4>
      <div className="space-y-2 text-sm">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block transition-colors hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
