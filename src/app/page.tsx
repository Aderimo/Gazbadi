import HeroSection from '@/components/home/HeroSection';
import ExploreSection from '@/components/home/ExploreSection';
import MyRecommendations from '@/components/home/MyRecommendations';
import PopularRoutes from '@/components/home/PopularRoutes';
import NewlyAdded from '@/components/home/NewlyAdded';
import DiscoverOnMap from '@/components/home/DiscoverOnMap';
import FriendExperiencesSection from '@/components/home/FriendExperiencesSection';
import BlogPostsSection from '@/components/home/BlogPostsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <div className="bg-dark">
        <DiscoverOnMap />
      </div>

      <div className="bg-dark-secondary">
        <ExploreSection />
      </div>

      <div className="bg-dark">
        <PopularRoutes />
      </div>

      <div className="bg-dark-secondary">
        <MyRecommendations />
      </div>

      <div className="bg-dark">
        <NewlyAdded />
      </div>

      <div className="bg-dark-secondary">
        <FriendExperiencesSection />
      </div>

      <div className="bg-dark">
        <BlogPostsSection />
      </div>
    </>
  );
}
