import Image from "next/image";
import { Container, Eyebrow } from "./primitives";

const photos = [
  {
    src: "/img1.jpg",
    alt: "Students attending a class session at Toronto Academy of Education",
    aspect: "aspect-[4/3]",
    offset: "lg:mt-10",
    rotate: "-rotate-1",
  },
  {
    src: "/img2.jpg",
    alt: "A student giving a thumbs up beside a Toronto Academy of Education banner",
    aspect: "aspect-[3/4]",
    offset: "",
    rotate: "rotate-1",
  },
  {
    src: "/img3.jpg",
    alt: "Two students standing beside a Toronto Academy of Education banner",
    aspect: "aspect-[3/4]",
    offset: "lg:mt-12",
    rotate: "rotate-1",
  },
  {
    src: "/img4.jpg",
    alt: "Two students posing in front of a Toronto Academy of Education banner",
    aspect: "aspect-[4/3]",
    offset: "lg:mt-4",
    rotate: "-rotate-1",
  },
];

export function CollegeMomentsSection() {
  return (
    <section className="overflow-hidden bg-cream text-foreground">
      <Container className="py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow className="text-brand">College moments</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A community that learns together
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground/70">
            Scenes from classes and student visits at Toronto Academy of
            Education.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className={`relative ${photo.aspect} ${photo.offset} ${photo.rotate} overflow-hidden rounded-3xl shadow-lg shadow-black/10 ring-1 ring-foreground/5 transition-transform duration-300 hover:rotate-0`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 280px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
