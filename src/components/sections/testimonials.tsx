import { Reveal } from "@/components/motion/reveal";
import { TestimonialCarousel } from "@/components/sections/testimonial-carousel";
import { Section, SectionHeading } from "@/components/site/section";
import type { TestimonialDTO } from "@/server/queries/types";

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialDTO[] }) {
  if (testimonials.length === 0) return null;
  const average = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  return (
    <Section id="testimonials" labelledBy="testimonials-title" className="bg-muted/25">
      <SectionHeading
        id="testimonials-title"
        eyebrow="Testimonials"
        title="Trusted by the people I've worked with"
        description={`Average rating ${average.toFixed(1)} / 5 across ${testimonials.length} reviews.`}
        align="center"
      />
      <Reveal>
        <TestimonialCarousel testimonials={testimonials} />
      </Reveal>
    </Section>
  );
}
