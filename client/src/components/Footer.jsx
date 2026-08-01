import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold text-amber-400">
              🧥 Clothing Exchange
            </h2>

            <p className="mt-3 max-w-sm leading-7 text-slate-300">
              Swap clothes, reduce waste, and support
              sustainable fashion.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-amber-400">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/dashboard"
                className="text-slate-300 no-underline hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                to="/listings"
                className="text-slate-300 no-underline hover:text-white"
              >
                Listings
              </Link>

              <Link
                to="/add-listing"
                className="text-slate-300 no-underline hover:text-white"
              >
                Add Listing
              </Link>

              <Link
                to="/swap-requests"
                className="text-slate-300 no-underline hover:text-white"
              >
                Swaps
              </Link>

              <Link
                to="/chat"
                className="text-slate-300 no-underline hover:text-white"
              >
                Chat
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-amber-400">
              Contact
            </h3>

            <div className="mt-4 space-y-3 text-slate-300">
              <p className="m-0">
                Email: support@clothingexchange.com
              </p>

              <p className="m-0">
                Phone: +91 98765 43210
              </p>

              <p className="m-0">
                Hyderabad, India
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
          © 2026 Clothing Exchange Marketplace. All Rights
          Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;