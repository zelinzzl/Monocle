import Image from "next/image";
import { Card } from "../UI/card";
import { H2, H3, P } from "../UI/typography";
import C1 from "@/assets/images/contributors/Hawa.jpg";
import C2 from "@/assets/images/contributors/Reta.jpeg";
import C3 from "@/assets/images/contributors/Zelin.jpg";
import { AspectRatio } from "../UI/aspect-ratio";

function Contributors() {
  return (
    <section id="contributors">
      <div className="flex-col gap-4 pl-4 pr-4 pt-40 pb-40">
        <section className="flex items-center justify-center h-full">
          <H2 className="text-3xl font-bold mb-4">Our Contributors</H2>
        </section>

        <div className="flex flex-row items-start justify-center gap-6 ">
          <Card className="flex flex-col items-center p-4 gap-2 w-64">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={C1}
                alt="Hawa Ibrahim"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <H3 className="text-center mt-2">Hawa Ibrahim</H3>
            <P className="text-center -mt-1">AI engineer</P>
          </Card>

          <Card className="flex flex-col items-center p-4 gap-2 w-64">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={""}
                alt="Nerina Borchard"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <H3 className="text-center mt-2">Nerina Borchard</H3>
            <P className="text-center -mt-1">Design</P>
          </Card>

          <Card className="flex flex-col items-center p-4 gap-2 w-64">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={C2}
                alt="Reta"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <H3 className="text-center mt-2">Reta</H3>
            <P className="text-center -mt-1">Fullstack developer</P>
          </Card>

          <Card className="flex flex-col items-center p-4 gap-2 w-64">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={""}
                alt="Siyamthanda Ndlovu"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <H3 className="text-center mt-2">Siyamthanda Ndlovu</H3>
            <P className="text-center -mt-1">Fullstack developer</P>
          </Card>

          <Card className="flex flex-col items-center p-4 gap-2 w-64 ">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={C3}
                alt="Zelin"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <H3 className="text-center mt-2">Zelin Zhang</H3>
            <P className="text-center -mt-2">Team Lead & Fullstack</P>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Contributors;
