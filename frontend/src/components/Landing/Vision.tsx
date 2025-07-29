import { Card } from "@/components/UI/card";
import { H2, P } from "../UI/typography";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "../UI/carousel";

import Vision1 from "@/assets/images/vision/Vision1.png";
import Vision2 from "@/assets/images/vision/Vision2.png";
import Vision3 from "@/assets/images/vision/Vision3.png";
import Vision4 from "@/assets/images/vision/Vision4.png";

const visionImages = [Vision1, Vision2, Vision3, Vision4];

function Vision() {
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
            className="w-full"
            opts={{
              align: "start",
              loop: true,
              active: true,
            }}
          >
            <CarouselContent>
              {visionImages.map((img, i) => (
                <CarouselItem
                  key={i}
                  className="basis-full flex justify-center"
                >
                  <Image
                    src={img}
                    alt={`Vision ${i + 1}`}
                    width={600}
                    height={400}
                    className="rounded-lg object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </Card>
      </div>
    </section>
  );
}

export default Vision;
