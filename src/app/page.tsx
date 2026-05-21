import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import Categories from "./components/Categories";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <Testimonials />
      <Newsletter />
      <Footer />
    </>
  );
}
