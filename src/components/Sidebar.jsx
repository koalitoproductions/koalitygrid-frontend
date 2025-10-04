import { Link } from 'react-router-dom';
import logo from '../assets/koalito.png';
import { useAuth } from './AuthContext';
import Logout from './Logout';

function Sidebar() {
  // Check if user is logged in by verifying the access token
  const { isLoggedIn } = useAuth();

  const sections = [
    { name: 'Beräkningar', path: '/berakningar', icon: 'fa-calculator' },
    { name: 'Omvandling', path: '/omvandling', icon: 'fa-exchange-alt' },
    { name: 'Formler', path: '/formler', icon: 'fa-square-root-alt' },
    { name: 'Ordlista', path: '/ordlista', icon: 'fa-solid fa-book'},
  ];

  // Add Favoriter only if logged in
  const allSections = isLoggedIn
    ? [
        ...sections,
        { name: 'Favoriter', path: '/favoriter', icon: 'fa-star' },
        { name: 'Mitt konto', path: '/account', icon: 'fa-user' },
      ]
    : sections;

  return (
    <aside className="bg-[#282828] min-w-[280px] max-w-[350px] p-6 border-r border-[#424242] flex flex-col h-full">
      <div className="mb-6">
        <img src={logo} alt="Sidebar Logo" className="w-full h-auto max-w-48 object-contain rounded-full border-4 border-gray-600 shadow-lg" />
      </div>
      {allSections.map((section) => (
        <Link
          key={section.path}
          to={section.path}
          className="flex items-center p-4 text-[#e0e0e0] hover:bg-[#383838] hover:text-white transition rounded mb-2 text-left w-full"
          aria-current={section.path === '/berakningar' ? 'page' : undefined}
        >
          <i className={`fas ${section.icon} text-[#fa7532] mr-4 text-xl`}></i>
          {section.name}
        </Link>
      ))}
      {isLoggedIn ? <Logout /> : (
        <Link
          to="/login"
          className="flex items-center p-4 text-[#e0e0e0] hover:bg-[#383838] hover:text-white transition rounded mb-2 text-left w-full"
        >
          <i className="fas fa-sign-in-alt text-[#fa7532] mr-4 text-xl"></i>
          Logga in
        </Link>
      )}
    </aside>
  );
}

export default Sidebar;