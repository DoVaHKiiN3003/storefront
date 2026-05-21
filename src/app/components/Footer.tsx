import { ShoppingBag } from "lucide-react";

const footerLinks = {
  Shop: ["New Arrivals", "Best Sellers", "Collections", "Sale"],
  Company: ["About Us", "Our Story", "Journal", "Careers"],
  Support: ["Contact", "Shipping", "Returns", "FAQ"],
  Connect: ["Instagram", "Pinterest", "Newsletter", "Press"],
};

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/70">
      <div className="px-6 sm:px-12 lg:px-20 xl:px-28 py-20 sm:py-28">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 max-w-6xl mx-auto">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 group mb-4">
              <ShoppingBag
                size={18}
                strokeWidth={2.5}
                className="text-cream"
              />
              <span className="text-sm font-semibold tracking-tight text-cream">
                STORE
              </span>
            </a>
            <p className="text-sm text-cream/50 leading-relaxed max-w-[220px]">
              Thoughtfully crafted essentials for the modern home.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-cream/40 mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-cream/60 hover:text-cream transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-cream/30 max-w-6xl mx-auto">
          <p>&copy; 2025 Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-cream/50 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-cream/50 transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
