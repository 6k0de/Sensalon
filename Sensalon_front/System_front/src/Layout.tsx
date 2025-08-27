import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow container mx-auto sm:px-6 lg:px-7 ">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
