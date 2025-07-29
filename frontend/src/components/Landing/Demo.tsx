import { Card } from "../UI/card";
import { H2 } from "../UI/typography";

function Demo() {
  return (
    <section
      id="demo"
      className="flex flex-col items-center justify-center p-8 pb-20 "
    >
      <H2 className="text-3xl font-bold mb-4">Demo</H2>

      {/* insert demo video here, on replay */}
      <Card className="w-full max-w-3xl p-6  dark:bg-neutral-800 shadow-lg">
        <video
          className="w-full h-auto"
          controls
          src="/path/to/demo-video.mp4"
        />
      </Card>
    </section>
  );
}

export default Demo;
