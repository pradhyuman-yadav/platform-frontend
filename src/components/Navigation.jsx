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

      {/* External Services */}
      <div className="nav-divider"></div>

      <a href="https://home.thepk.in" className="nav-external-link" target="_blank" rel="noopener noreferrer">
        Homepage
      </a>
      <a href="https://portainer.thepk.in" className="nav-external-link" target="_blank" rel="noopener noreferrer">
        Portainer
      </a>
      <a href="https://squidex.thepk.in" className="nav-external-link" target="_blank" rel="noopener noreferrer">
        Squidex
      </a>
      <a href="https://n8n.thepk.in" className="nav-external-link" target="_blank" rel="noopener noreferrer">
        n8n
      </a>
      <a href="https://excalidraw.thepk.in" className="nav-external-link" target="_blank" rel="noopener noreferrer">
        Excalidraw
      </a>
    </nav>
  );
};

export default Navigation;
