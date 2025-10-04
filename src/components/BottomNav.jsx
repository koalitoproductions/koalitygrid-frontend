import { Link } from 'react-router-dom';

function BottomNav() {
  const sections = [
    { name: 'Beräkningar', path: '/berakningar', icon: 'fa-calculator' },
    { name: 'Omvandling', path: '/omvandling', icon: 'fa-exchange-alt' },
    { name: 'Formler', path: '/formler', icon: 'fa-square-root-alt' },
  ];

  return (
    <nav className="flex fixed bottom-0 left-0 w-full bg-[#282828] border-t border-[#424242] justify-around items-center py-2 z-50">
      {sections.map((section) => (
        <Link
          key={section.path}
          to={section.path}
          className="flex flex-col items-center text-[#e0e0e0] text-xs hover:text-[#fa7532] transition"
          aria-current={section.path === '/berakningar' ? 'page' : undefined}
        >
          <i className={`fas ${section.icon} text-lg mb-1 text-[#fa7532]`}></i>
          {section.name}
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;