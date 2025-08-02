import { Card } from "@/components/ui/card";
import { H2, P } from "../ui/typography";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

import Vision1 from "@/assets/images/vision/Accident1.png";
import Vision2 from "@/assets/images/vision/Accident2.png";
import Vision3 from "@/assets/images/vision/Accident3.png";
import Vision4 from "@/assets/images/vision/Accident4.png";
import Vision5 from "@/assets/images/vision/Vision1.png";
import Vision6 from "@/assets/images/vision/Vision2.png";
import Vision7 from "@/assets/images/vision/Vision3.png";
import Vision8 from "@/assets/images/vision/Vision4.png";
import React from "react";

const visionImages = [
  Vision1,
  Vision2,
  Vision3,
  Vision4,
  Vision5,
  Vision6,
  Vision7,
  Vision8,
];

function Vision() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <section id="vision" className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/2">
        <section className="flex flex-col items-center justify-center h-full">
          <H2 className="text-3xl font-bold mb-4">Our Vision</H2>
          <P className="text-muted-foreground text-center px-4 md:px-10">
            At the intersection of AI, insurance, and travel risk management,
            our vision is to redefine the digital landscape by delivering
            innovative, user-centric solutions that harness artificial
            intelligence to optimize underwriting, claims processing, and
            real-time risk assessment. By integrating predictive analytics and
            machine learning into travel risk insurance platforms, we enable
            insurers to offer dynamic, personalized coverage based on evolving
            traveler behavior and geopolitical factors. Our approach combines
            cutting-edge design with high-performance software to create
            scalable, intuitive solutions that not only enhance user experience
            but also drive measurable operational efficiency and data-driven
            decision-making.
          </P>
        </section>
      </div>

      <div className="w-full md:w-1/2">
        <Card className="p-4">
          <Carousel
            plugins={[plugin.current]}
            className="w-full relative"
            opts={{
              align: "start",
              loop: true,
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {visionImages.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="p-1">
                    <Image
                      src={img}
                      alt={`Vision ${i + 1}`}
                      width={600}
                      height={400}
                      className="rounded-lg object-cover w-full h-auto"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
        </Card>
      </div>
    </section>
  );
}

export default Vision;
