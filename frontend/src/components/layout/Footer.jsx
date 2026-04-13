import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Sportify</h3>
            <p className="leading-relaxed text-sm">
              Your one-stop solution for booking sports venues and facilities.
              Join our community and play more.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/venues" className="hover:text-white transition-colors text-sm">Browse venues</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors text-sm">My dashboard</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <p>Email: support@sportify.com</p>
              <p>Phone: +977 9827927767</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-slate-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Sportify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

