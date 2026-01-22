import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Sportify</h3>
            <p className="text-gray-400">
              Your one-stop solution for booking sports venues and facilities.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/venues" className="hover:text-white">
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">
              Email: support@sportify.com
              <br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Sportify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

