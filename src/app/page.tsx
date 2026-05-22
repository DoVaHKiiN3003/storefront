import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import RecentlyViewed from "./components/RecentlyViewed";
import Categories from "./components/Categories";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <RecentlyViewed />
      <Categories />
      <Testimonials />
      <Newsletter />
      <Footer />
    </>
  );
}
