import Footer from "@/components/footer";
import MissionAnimation from "@/components/mission-animation";
import { Navbar } from "@/components/navbar";
import {
  CommunityIcon,
  EmpowermentIcon,
  InterconnectedLearningIcon,
} from "@/components/value-icons";

export default function AboutPage() {
  const values = [
    {
      Icon: InterconnectedLearningIcon,
      title: "Interconnected Learning",
      description:
        "We focus on showing the relationships between concepts, not just isolated facts.",
      iconContainerClassName: "bg-blue-100",
    },
    {
      Icon: EmpowermentIcon,
      title: "Empowerment",
      description:
        "Providing tools and knowledge that enable personal and professional growth.",
      iconContainerClassName: "bg-green-100",
    },
    {
      Icon: CommunityIcon,
      title: "Community",
      description:
        "Building a vibrant ecosystem where learners and instructors can connect and collaborate.",
      iconContainerClassName: "bg-purple-100",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar />

      <main>
        <section className="mx-auto my-10 max-w-7xl rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-20 shadow-inner sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl leading-tight font-extrabold text-gray-900 md:text-6xl">
              Unlocking Knowledge, One Connection at a Time
            </h1>
            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-700">
              At Cognify Academy, we believe that understanding comes from
              connecting ideas. Our platform is designed to help you not just
              learn facts, but truly grasp how concepts interrelate, building a
              robust and interconnected web of knowledge.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="mb-4 text-lg text-gray-700">
                Our mission is to empower learners worldwide by providing an
                intuitive, engaging, and effective platform that leverages the
                power of knowledge graphs to make complex subjects accessible
                and deeply understood. We aim to transform passive learning into
                active discovery.
              </p>
              <p className="text-lg text-gray-700">
                We are committed to fostering a community of curious minds and
                dedicated instructors, creating an ecosystem where continuous
                learning and intellectual growth flourish.
              </p>
            </div>
            <MissionAnimation />
          </div>

          <div className="mt-20 border-t border-gray-200 pt-12">
            <h2 className="mb-10 text-center text-4xl font-bold text-gray-900">
              Our Values
            </h2>
            <div className="grid gap-8 text-center md:grid-cols-3">
              {values.map(
                ({ Icon, title, description, iconContainerClassName }) => (
                  <div
                    key={title}
                    className="rounded-lg border border-gray-100 bg-white p-8 shadow-sm"
                  >
                    <div
                      className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${iconContainerClassName}`}
                    >
                      <Icon />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                      {title}
                    </h3>
                    <p className="text-gray-600">{description}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="mt-20 rounded-lg bg-blue-600 p-12 text-center text-white shadow-xl">
            <h2 className="mb-4 text-3xl font-bold">Join Our Journey!</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg">
              Whether you&apos;re looking to expand your knowledge or share your
              expertise, Cognify Academy offers a unique platform to connect and
              grow.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 shadow transition-colors hover:bg-gray-100">
                Explore Courses
              </button>
              <button className="rounded-lg border border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600">
                Become an Instructor
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
