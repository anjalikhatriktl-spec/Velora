import React from 'react';
import { HeroAndBrandSections } from '../components/home/HeroAndBrandSections';
import { CollectionAndGallerySections } from '../components/home/CollectionAndGallerySections';
import { FeaturedAndExperienceSections } from '../components/home/FeaturedAndExperienceSections';
import { TestimonialsContactBlogSections } from '../components/home/TestimonialsContactBlogSections';

export const HomePage: React.FC = () => {
  return (
    <div>
      <HeroAndBrandSections />
      <CollectionAndGallerySections />
      <FeaturedAndExperienceSections />
      <TestimonialsContactBlogSections />
    </div>
  );
};
