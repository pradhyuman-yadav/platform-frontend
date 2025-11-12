import Navigation from './Navigation';
import DarkModeToggle from './DarkModeToggle';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Left sidebar - Navigation */}
      <div className="nav-sidebar">
        <Navigation />
        <DarkModeToggle />
      </div>

      {/* Center - Main page content */}
      <div className="page-container">
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Right sidebar - Name branding */}
      <div className="name-branding">
        <h1 className="site-title-vertical">Pradhyuman Yadav</h1>
      </div>
    </div>
  );
};

export default Layout;
