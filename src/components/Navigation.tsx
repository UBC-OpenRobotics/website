import React, { useState, useEffect, useRef } from 'react';

interface NavigationItem {
  name: string;
  link: string;
}

interface NavigationProps {
  items: NavigationItem[];
}

const Navigation: React.FC<NavigationProps> = ({ items }) => {

  const NAV_FONT_SIZE = 'text-base'; // text-xs, text-sm, text-base, text-lg, text-xl

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLocationDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);

    // Prevent body scroll on mobile when modal is open
    if (!isDropdownOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside on desktop
      if (
        window.innerWidth >= 768 &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen && window.innerWidth >= 768) {
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="bg-white dark:bg-gray-800 w-full border-b border-gray-200 dark:border-gray-700 fixed top-0 z-50 transition-colors duration-200 shadow-md dark:shadow-none" style={{ fontFamily: "'JetBrains Mono', sans-serif" }}>
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-1">

          {/* Nav links */}
          <ul className="flex flex-col md:flex-row md:space-x-12 space-y-2 md:space-y-0 mb-2 md:mb-0">
            {items.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  className={`text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-500 font-semibold md:${NAV_FONT_SIZE} transition-colors`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Donate button + map pin */}
          <div className="flex items-center space-x-4">

            {/* Map pin icon */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleLocationDropdown}
                className="p-2 text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                aria-label="Location"
              >
                <span className="material-icons text-3xl">location_on</span>
              </button>

              {/* Desktop dropdown menu */}
              <div
                className={`${
                  isDropdownOpen ? '' : 'hidden'
                } md:absolute md:right-0 md:mt-2 md:w-80 md:border md:border-gray-300 dark:md:border-gray-600 md:rounded-lg md:shadow-xl fixed inset-0 md:inset-auto bg-white dark:bg-gray-800 z-50 transition-colors duration-200`}
              >
                {/* Mobile header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Our Location</h3>
                  <button onClick={toggleLocationDropdown} className="p-1 text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-500">
                    <span className="material-icons text-3xl">close</span>
                  </button>
                </div>

                <div className="p-4 md:p-4">
                  {/* Desktop header, hidden for mobile */}
                  <h3 className="hidden md:block text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Our Location</h3>

                  <p className="text-sm md:text-sm text-gray-700 dark:text-gray-300 mb-3 mt-4 md:mt-0">
                    <strong>Hennings Building Room 200</strong><br />
                    6224 Agricultural Rd #325<br />
                    Vancouver, BC V6T 1Z1
                  </p>

                  <div className="w-full h-64 md:h-48 rounded-md overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2603.5233475984237!2d-123.25476908768105!3d49.26647977178184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548672b6f5321131%3A0x1877a1f004691be!2sHennings%20Building!5e0!3m2!1sen!2sca!4v1763926664596!5m2!1sen!2sca"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <a
                    href="https://maps.app.goo.gl/PDkgJSt9E2Qph4Em9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 md:mt-3 block text-center py-3 md:py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Mobile Backdrop overlay */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                  onClick={toggleLocationDropdown}
                />
              )}
            </div>

            {/* Sponsor */}
            <a
              href="https://donate.support.ubc.ca/page/20924/donate/1?transaction.dirgift=Open+Robotics+Student+Team%20G1102"
              className={`py-2 px-4 border-2 border-red-600 hover:bg-red-600 text-gray-900 dark:text-gray-100 hover:text-white font-bold rounded-md transition-colors ${NAV_FONT_SIZE}`}
            >
              Sponsor
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navigation;
