import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="hairline mt-32 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="display-lg">Aether</h3>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              An architecture practice working at the edge of material, light and permanence.
            </p>
          </div>

          <div>
            <p className="eyebrow">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-muted-foreground hover:text-foreground">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/portal" className="text-muted-foreground hover:text-foreground">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Studio</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Zurich · Lisbon · Kyoto</li>
              <li>studio@aether.example</li>
              <li>Mon–Fri, 09:00–18:00 CET</li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-16 flex flex-col gap-2 pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} Aether Studio. All rights reserved.</span>
          <span>Ultra-luxury architecture, engineered quietly.</span>
        </div>
      </div>
    </footer>
  );
}
