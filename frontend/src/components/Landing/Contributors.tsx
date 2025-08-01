import Image from "next/image";
import { Card } from "../ui/card";
import { H2, H3, P } from "../ui/typography";
import C1 from "@/assets/images/contributors/hawa.jpg";
import C2 from "@/assets/images/contributors/nerina.jpg";
import C3 from "@/assets/images/contributors/Reta.jpeg";
import C4 from "@/assets/images/contributors/Siya.png";
import C5 from "@/assets/images/contributors/Zelin.jpg";
import { AspectRatio } from "../ui/aspect-ratio";
import Link from "next/link";

function Contributors() {
  return (
    <section id="contributors" className="py-20 md:py-40 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <H2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Our Contributors
          </H2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
          {/* Contributor 1 */}
          <Link
            href="https://github.com/HawaIbr01"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full"
          >
            <Card className="flex flex-col items-center p-4 gap-2 w-full max-w-xs transition-transform duration-300 group-hover:scale-105">
              <div className="w-3/4 sm:w-full pointer-events-none">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={C1}
                    alt="Hawa Ibrahim"
                    className="rounded-lg object-cover w-full h-full pointer-events-none"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 20vw"
                  />
                </AspectRatio>
              </div>
              <H3 className="text-center mt-2 text-lg sm:text-xl pointer-events-none">
                Hawa Ibrahim
              </H3>
              <P className="text-center text-muted-foreground pointer-events-none">
                AI engineer
              </P>
            </Card>
          </Link>

          {/* Contributor 2 */}
          <Link
            href="https://github.com/NerinaBorchard"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full"
          >
            <Card className="flex flex-col items-center p-4 gap-2 w-full max-w-xs hover:scale-105 transition-transform duration-300">
              <div className="w-3/4 sm:w-full">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={C2}
                    alt="Nerina Borchard"
                    className="rounded-lg object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 20vw"
                  />
                </AspectRatio>
              </div>
              <H3 className="text-center mt-2 text-lg sm:text-xl">
                Nerina Borchard
              </H3>
              <P className="text-center text-muted-foreground">Design</P>
            </Card>
          </Link>

          {/* Contributor 3 */}
          <Link
            href="https://github.com/Rethakgetse-Manaka"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full"
          >
            <Card className="flex flex-col items-center p-4 gap-2 w-full max-w-xs hover:scale-105 transition-transform duration-300">
              <div className="w-3/4 sm:w-full">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={C3}
                    alt="Reta"
                    className="rounded-lg object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 20vw"
                  />
                </AspectRatio>
              </div>
              <H3 className="text-center mt-2 text-lg sm:text-xl">Reta</H3>
              <P className="text-center text-muted-foreground">
                Fullstack developer
              </P>
            </Card>
          </Link>

          {/* Contributor 4 */}
          <Link
            href="https://github.com/siyamthandandlovu"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full"
          >
            <Card className="flex flex-col items-center p-4 gap-2 w-full max-w-xs hover:scale-105 transition-transform duration-300">
              <div className="w-3/4 sm:w-full">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={C4}
                    alt="Siyamthanda Ndlovu"
                    className="rounded-lg object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 20vw"
                  />
                </AspectRatio>
              </div>
              <H3 className="text-center mt-2 text-lg sm:text-xl">
                Siyamthanda Ndlovu
              </H3>
              <P className="text-center text-muted-foreground">
                Fullstack developer
              </P>
            </Card>
          </Link>

          {/* Contributor 5 */}
          <Link
            href="https://github.com/zelinzzl"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full"
          >
            <Card className="flex flex-col items-center p-4 gap-2 w-full max-w-xs hover:scale-105 transition-transform duration-300">
              <div className="w-3/4 sm:w-full">
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={C5}
                    alt="Zelin Zhang"
                    className="rounded-lg object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 20vw"
                  />
                </AspectRatio>
              </div>
              <H3 className="text-center mt-2 text-lg sm:text-xl">
                Zelin Zhang
              </H3>
              <P className="text-center text-muted-foreground">
                Team Lead & Fullstack
              </P>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Contributors;
