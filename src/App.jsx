import CartDrawer from './components/ui/CartDrawer';
import Footer from './components/Footer';
import Nav from './components/ui/Nav';
import Journey from './sections/Journey';

// Scenes 01–02 live inside <Journey /> (one canvas, one timeline). Scene 03 will mount below it.
export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only fixed top-3 left-3 z-[100] bg-soft text-cocoa px-3 py-2">Skip to content</a>
      <Nav />
      <CartDrawer />
      <main id="main">
        <Journey />
      </main>
      <Footer />
    </>
  );
}
