import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Home
      </Link>
      <Link to="/articles" className={location.pathname === '/articles' ? 'active' : ''}>
        Articles
      </Link>
      <Link to="/tools" className={location.pathname === '/tools' ? 'active' : ''}>
        Tools
      </Link>
      <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
        About Me
      </Link>
    </nav>
  );
};

export default Navigation;
