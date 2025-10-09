import Link from "next/link";
import { getPosts } from "@/lib/api"; 
import post_banner from "../assets/images/post_banner.png"; // fallback image

import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import StartNow from "@/components/common/StartNow";
import TableStart from "@/components/tables/TableStart";
import { Metadata } from "next";
import Image from "next/image";
import more from "../assets/icons/3dots.svg";
import StarFill from "../assets/icons/3star-fill.svg";
import Star from "../assets/icons/3star.svg";
import alphaPlus from "../assets/icons/alphaplus_metaverse_logo.svg";
import alphaway from "../assets/icons/alphaway_logo.svg";
import asana from "../assets/icons/asana_logo.svg";
import ericsson from "../assets/icons/ericsson_logo.svg";
import google from "../assets/icons/google_logo.svg";
import healthLine from "../assets/icons/healthline_media_logo.svg";
import home1 from "../assets/icons/home-1.png";
import home2 from "../assets/icons/home-2.png";
import home3 from "../assets/icons/home-3.png";
import ibmLogo from "../assets/icons/ibm_logo.svg";
import iconAudio from "../assets/icons/icon_audio.svg";
import iconChatbot from "../assets/icons/icon_chatbot.svg";
import iconTraining from "../assets/icons/icon_training.svg";
import techcombank from "../assets/icons/techcombank_logo.svg";
import Tick from "../assets/icons/tick.svg";
import turningCom from "../assets/icons/turingcom_logo.svg";
import img1 from "../assets/images/1.png";
import img2 from "../assets/images/2.png";
import img3 from "../assets/images/3.png";
import img4 from "../assets/images/4.png";
import img5 from "../assets/images/5.png";
import img6 from "../assets/images/6.png";
import avt1 from "../assets/images/avt-1.png";
import avt2 from "../assets/images/avt-2.png";
import avt3 from "../assets/images/avt-3.png";
import avt4 from "../assets/images/avt-4.png";
import avtExpert2 from "../assets/images/avt-daviddo.png";
import avtExpert1 from "../assets/images/avt-tamle.png";
import bgrab from "../assets/images/bgr-ab.png";
import ImageContact from "../assets/images/image.jpg";

export const metadata: Metadata = {
  title: "Tbrain",
  description: "Full-service human resource agency for AI training experts",
};

export default async function Home() {
const CASE_STUDY_CATEGORY_SLUG = "case-study";
const { edges } = await getPosts({ first: 7, categorySlug: CASE_STUDY_CATEGORY_SLUG });
const caseStudies = edges.map((e: any) => e.node);
const firstPost = caseStudies[0];
const restPosts = caseStudies.slice(1);

  return (
    <div>
      <Header />
      <main>
        <div className="wrap">
          <div className="one top-0 left-1/4 h-80 w-80 "></div>
          <div className="two top-0 right-1/4 h-80 w-80 "></div>
        </div>
        <section
          id="home"
          className="container h-screen mx-auto px-3 pt-24 relative"
        >
          <div className="h-full flex items-center justify-center">
            <div>
              <div className="flex items-center justify-center gap-3">
                <div className="up-down">
                  <Image
                    src={Star}
                    width={38}
                    height={38}
                    alt="Floating Icon"
                  />
                </div>

                <div
                  className="z-1 text-nowrap rounded-3xl bg-white px-5 py-2 text-sm font-medium text-[#6C3CF4] shadow"
                  data-aos="fade-left"
                >
                  The human power of RLHF and SFT
                </div>
              </div>

              <h3 className="mt-10 text-center leading-tight text-5xl md:text-7xl font-medium">
                High Quality Data for{" "}
                <span className="gradient-text">
                  {" "}
                  Smarter AI Data Generation, Annotation and Evaluation
                </span>
              </h3>

              <p className="max-w-screen-md text-center mt-16 text-lg mx-auto text-gray-500">
                Skilled, ready-to-deploy experts in data labeling, model
                evaluation, and technical domains. U.S.-based and offshore
                talent. Fast, scalable, and reliable.
              </p>
              <div className="flex justify-center items-center mt-16">
                <StartNow />
              </div>
            </div>
          </div>

          <div
            className="absolute top-[15%] left-[27%] hidden md:block"
            data-aos="fade-down-right"
          >
            <Image src={home1} width={110} height={110} alt="Floating Icon" />
          </div>
          <div className="absolute top-[55%] right-[13%] hidden md:block">
            <Image
              src={home2}
              width={130}
              height={130}
              alt="Floating Icon"
              data-aos="fade-up-left"
              data-aos-delay="200"
            />
          </div>
          <div
            className="absolute bottom-[15%] left-[13%] hidden md:block"
            data-aos="fade-up-right"
          >
            <Image
              src={home3}
              width={180}
              height={180}
              alt="Floating Icon"
              data-aos-delay="400"
            />
          </div>
        </section>
        <div className="wrap">
          <div className="one top-0 left-0 h-80 w-80 "></div>
          <div className="two top-0 right-0 h-80 w-80 "></div>
        </div>
        <section id="about" className="container mx-auto px-3 pt-24">
          <div className="text-center">
            <h3 className="mx-auto max-w-max text-4xl md:text-5xl font-medium">
              Our Differentiation{" "}
              <div className="float-end">
                <div className="up-down">
                  <Image
                    src={StarFill}
                    width={38}
                    height={38}
                    alt="Floating Icon"
                  />
                </div>
              </div>
            </h3>
            <p className="mx-auto mt-5 max-w-5xl text-lg font-normal">
              Our trainers are NOT anonymous crowd workers. Many are our
              employees, while others are carefully vetted experts referred into
              our network through trusted channels. Each undergoes rigorous
              verification and specialized training led by our dedicated subject
              matter trainers to ensure the highest quality and expertise
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-screen-lg grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <Image
                    src={img1}
                    loading="lazy"
                    width={600}
                    height={500}
                    alt="img"
                    data-aos="fade-down-right"
                  />
                </div>
                <div className="col-span-12">
                  <Image
                    src={img2}
                    loading="lazy"
                    width={600}
                    height={500}
                    alt="img"
                    data-aos="fade-up-right"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="grid grid-cols-12 gap-7">
                <div className="col-span-12">
                  <Image
                    src={img3}
                    loading="lazy"
                    width={600}
                    height={500}
                    alt="img"
                  />
                </div>
                <div className="col-span-12">
                  <Image
                    src={img4}
                    loading="lazy"
                    width={600}
                    height={500}
                    alt="img"
                    data-aos="fade-up"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <Image
                    src={img6}
                    loading="lazy"
                    width={600}
                    height={500}
                    alt="img"
                    data-aos="fade-down-left"
                  />
                </div>
                <div className="col-span-12">
                  <Image
                    src={img5}
                    loading="lazy"
                    width={600}
                    height={500}
                    alt="img"
                    data-aos="fade-up-left"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container mx-auto mt-32 px-3">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-sm hidden md:block ">
              <Image
                src={bgrab}
                loading="lazy"
                width={1000}
                height={1000}
                alt="img"
                data-aos="zoom-in"
              />
            </div>
            <div className="text-center">
              <h3 className="mx-auto max-w-max text-4xl md:text-5xl font-medium">
                Sample Profiles{" "}
                <div className="float-end">
                  <div className="up-down">
                    <Image
                      src={StarFill}
                      width={38}
                      height={38}
                      alt="Floating Icon"
                    />
                  </div>
                </div>
              </h3>
            </div>
            <div className="mx-auto mt-16 max-w-screen-lg">
              <div className="grid grid-cols-12 gap-4">
                <div
                  className="col-span-12 px-8 md:col-span-6 xl:col-span-3 flex flex-col items-center"
                  data-aos="fade-up"
                >
                  <div>
                    <Image
                      src={avt1}
                      loading="lazy"
                      width={500}
                      height={500}
                      alt="img"
                    />
                  </div>
                  <h2 className="font-family_avt my-3 text-center text-2xl font-semibold">
                    Nguyen Minh T.
                  </h2>
                  <p className="text-center text-base font-normal text-gray-500">
                    Radiologist with 9+ years of experience, currently working
                    at one of the top international hospitals in Hanoi,
                    specializing in diagnostic imaging and image guided
                    interventions

                    Radiologist with 9+ years of experience, currently working
                    at one of the top international hospitals in Hanoi,
                    specializing in diagnostic imaging and image guided
                    interventions
                  </p>
                  <div className="flex mt-auto pt-4">
                    <div className="mx-auto rounded-full bg-[#4A21EF] text-sm text-white px-4 py-1 w-fit">
                      Medical
                    </div>
                  </div>
                </div>
                <div
                  className="col-span-12 px-8 md:col-span-6 xl:col-span-3 flex flex-col items-center"
                  data-aos="fade-up"
                >
                  <div>
                    <Image
                      src={avt2}
                      loading="lazy"
                      width={500}
                      height={500}
                      alt="img"
                    />
                  </div>
                  <h2 className="font-family_avt my-3 text-center text-2xl font-semibold">
                    Trang M.
                  </h2>
                  <p className="text-center text-base font-normal text-gray-500">
                    Co-founder of PowerGate Labs
                    <br />
                    Head of Al at PowerGate Group (Test)
                    <br />
                    Ph.D. in Software Engineering, Hanoi University, Vietnam.
                  </p>
                  <div className="flex mt-auto pt-4">
                    <div className="mx-auto rounded-full bg-[#4A21EF] text-sm text-white px-4 py-1 w-fit">
                      Coding / AI
                    </div>
                  </div>
                </div>
                <div
                  className="col-span-12 px-8 md:col-span-6 xl:col-span-3 flex flex-col items-center"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <div>
                    <Image
                      src={avt3}
                      loading="lazy"
                      width={500}
                      height={500}
                      alt="img"
                    />
                  </div>
                  <h2 className="font-family_avt my-3 text-center text-2xl font-semibold">
                    Huy L.
                  </h2>
                  <p className="text-center text-base font-normal text-gray-500">
                    Al Expert ai PowerGate
                    <br />
                    Ph.D. in engineering with research interest on deep learning
                    applications Researcher at Phenikaa University
                  </p>
                  <div className="flex mt-auto pt-4">
                    <div className="mx-auto rounded-full bg-[#4A21EF] text-sm text-white px-4 py-1 w-fit">
                      Coding / AI
                    </div>
                  </div>
                </div>
                <div
                  className="col-span-12 px-8 md:col-span-6 xl:col-span-3 flex flex-col items-center"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <div>
                    <Image
                      src={avt4}
                      loading="lazy"
                      width={500}
                      height={500}
                      alt="img"
                    />
                  </div>
                  <h2 className="font-family_avt my-3 text-center text-2xl font-semibold">
                    Tu Ng.
                  </h2>
                  <p className="text-center text-base font-normal text-gray-500">
                    10+ years in Data Science
                    <br />
                    Head of AI at PowerGate Labs
                    <br />
                    MS Computer Science
                    <br />
                    Expert in Python, SQL, machine learning
                  </p>
                  <div className="flex mt-auto pt-4">
                    <div className="mx-auto rounded-full bg-[#4A21EF] text-sm text-white px-4 py-1 w-fit">
                      Data
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-[36%]">
                <div className="down-up">
                  <Image
                    src={Star}
                    width={38}
                    height={38}
                    alt="Floating Icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="wrap">
          <div className="one top-0 left-0 h-80 w-80 "></div>
          <div className="two top-0 right-0 h-80 w-80 "></div>
        </div>
        <section className="container max-w-screen-xl mx-auto mt-32 px-3 flex flex-col items-center">
          <div className="text-center">
            <h3 className="mx-auto max-w-max text-[#6C3CF4] text-4xl md:text-5xl font-medium">
              Sample Projects
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 w-fit gap-6 mt-16">
            <div
              className="bg-[linear-gradient(0deg,rgba(255,255,255,0)_0%,rgba(126,82,228,0.05)_50%,rgba(132,101,255,0.15)_100%)] p-8 w-[352px] h-[362px] gradient-border-top"
              data-aos="fade-up"
            >
              <div className="w-[90px] h-[90px] mb-6">
                <Image
                  src={iconChatbot}
                  width={90}
                  height={90}
                  alt="Chatbot icon"
                />
              </div>
              <h4 className="text-[20px] font-bold text-[#6C3CF4] mb-4">
                Chatbot data generation
              </h4>
              <p className="text-[#222]">
                Make Q&A pairs to train a chatbot on medical questions.
              </p>
            </div>

            <div
              className="bg-[linear-gradient(0deg,rgba(255,255,255,0)_0%,rgba(126,82,228,0.05)_50%,rgba(132,101,255,0.15)_100%)] p-8 w-[352px] h-[362px] gradient-border-top"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-[90px] h-[90px] mb-6">
                <Image
                  src={iconTraining}
                  width={90}
                  height={90}
                  alt="Training icon"
                />
              </div>
              <h4 className="text-[20px] font-bold text-[#6C3CF4] mb-4">
                Training data generation
              </h4>
              <p className="text-[#222]">
                Assess the accuracy and validity of LLM-generated responses in
                advanced domains by verifying if answers are correct and if
                questions are solvable.
              </p>
            </div>

            <div
              className="bg-[linear-gradient(0deg,rgba(255,255,255,0)_0%,rgba(126,82,228,0.05)_50%,rgba(132,101,255,0.15)_100%)] p-8 w-[352px] h-[362px] gradient-border-top"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-[90px] h-[90px] mb-6">
                <Image
                  src={iconAudio}
                  width={90}
                  height={90}
                  alt="Audio icon"
                />
              </div>
              <h4 className="text-[20px] font-bold text-[#6C3CF4] mb-4">
                Audio Data Collection
              </h4>
              <p className="text-[#222]">
                Gather high-quality audio data to enhance smart device
                capabilities, enabling better understanding and response to a
                variety of user commands and accents.
              </p>
            </div>
          </div>
        </section>
       {/* CASE STUDIES — news-style format */}
<section className="container mx-auto px-3 pt-24 pb-24 relative max-w-[1128px]">
  {/* Title + floating star giống News */}
  <div className="relative mb-12">
    <div className="absolute -top-4 right-[15%] hidden md:block">
      <div className="up-down">
        <Image src={Star} width={38} height={38} alt="Floating Icon" />
      </div>
    </div>
    <h3 className="text-[#222222] text-4xl lg:text-5xl font-medium leading-tight">
      Case Studies
    </h3>
  </div>

  {/* Featured Post (y hệt cách trình bày News) */}
  {firstPost && (
    <div
      className="w-full bg-white/80 backdrop-blur-sm rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 flex p-6 md:p-8 gap-6 md:gap-8 flex-col lg:flex-row mb-12"
      data-aos="fade-up"
    >
      <div className="lg:w-[58%] relative group overflow-hidden rounded-[24px]">
        <Image
          width={800}
          height={415}
          className="w-full h-[300px] md:h-[415px] object-cover transition-transform duration-300 group-hover:scale-105"
          src={firstPost.featuredImage?.node?.sourceUrl ?? post_banner}
          alt={firstPost.featuredImage?.node?.altText ?? firstPost.title}
        />
        <div className="absolute top-4 left-4 bg-[#6c3cf4] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          Featured
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-[#0e1b2e] text-2xl md:text-3xl font-semibold leading-tight mb-4 hover:text-[#6c3cf4] transition-colors">
            <Link href={`/case-study/${firstPost.slug}`}>{firstPost.title}</Link>
          </h2>
          <div
            className="text-[#78818f] text-base font-normal leading-relaxed mb-6 line-clamp-4"
            dangerouslySetInnerHTML={{ __html: firstPost.excerpt }}
          />
        </div>
        <Link
          href={`/case-study/${firstPost.slug}`}
          className="inline-flex items-center gap-2 text-[#6c3cf4] text-base font-semibold hover:gap-3 transition-all group"
        >
          Read more
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )}

  {/* BG blur blobs như News */}
  <div className="wrap">
    <div className="one top-[60%] left-0 h-80 w-80"></div>
    <div className="two top-[60%] right-0 h-80 w-80"></div>
  </div>

  {/* Grid danh sách các bài còn lại */}
  <div className="relative z-10">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#0e1b2e]">Latest Case Studies</h2>
      <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-[#6c3cf4]/20 to-transparent rounded-full"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restPosts.map((post: any) => (
        <Link
          key={post.id}
          href={`/case-study/${post.slug}`}
          className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow hover:shadow-lg transition-all overflow-hidden group"
          data-aos="fade-up"
        >
          <div className="relative h-56 overflow-hidden">
            <Image
              src={post?.featuredImage?.node?.sourceUrl ?? post_banner}
              alt={post?.featuredImage?.node?.altText ?? post?.title ?? "Case study"}
              width={640}
              height={320}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 bg-white/90 text-[#6c3cf4] px-3 py-1 rounded-full text-xs font-semibold shadow">
              Case Study
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-[#0e1b2e] text-xl font-semibold line-clamp-2 mb-3 group-hover:text-[#6c3cf4] transition-colors">
              {post.title}
            </h3>
            <div
              className="text-[#78818f] text-sm leading-relaxed line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
            <span className="inline-flex items-center gap-2 text-[#6c3cf4] text-sm font-semibold mt-4 group-hover:gap-3 transition-all">
              Read more
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
      {restPosts.length === 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">
          No case studies yet. Add some posts in the “{CASE_STUDY_CATEGORY_SLUG}” category.
        </div>
      )}
    </div>

    {/* CTA xem tất cả */}
    <div className="flex justify-center mt-10">
      <Link
        href="/case-study"
        className="px-8 h-12 bg-[#6c3cf4] hover:bg-[#5a2fd3] text-white text-base font-semibold rounded-xl transition-all hover:shadow-lg inline-flex items-center"
      >
        View all case studies
      </Link>
    </div>
  </div>
</section>


        <section className="container mx-auto px-3 pt-28">
          <div className="text-center">
            <h3 className="mx-auto max-w-screen-lg text-4xl md:text-5xl font-medium">
              Leadership has extensive experience in{" "}
              <span className="gradient-text">AI training</span> and{" "}
              <span className="gradient-text">resource management</span>{" "}
              <div className="float-end">
                <div className="up-down">
                  <Image
                    src={StarFill}
                    width={38}
                    height={38}
                    alt="Floating Icon"
                  />
                </div>
              </div>
            </h3>
          </div>
          <div className="wrap">
            <div className="three top-0 left-[30%] h-80 w-80 "></div>
            <div className="two top-0 right-[30%] h-80 w-80 "></div>
          </div>

          <div className="mx-auto max-w-screen-lg">
            <div className="mt-12 grid grid-cols-12 gap-5">
              <div
                className="col-span-12 min-h-56 md:col-span-6"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="h-full rounded-3xl bg-[#e8e6e664] p-8 backdrop-blur-xl">
                  <Image
                    src={avtExpert1}
                    width={88}
                    height={88}
                    alt="Floating Icon"
                    className="rounded-full"
                  />
                  <h3 className="mt-6 text-3xl font-medium">Tam Le</h3>
                  <p className="mt-3 text-base font-normal min-h-[130px]">
                    Seasoned Data Science and Analytics leader with over 15
                    years of experience across big tech and startups, including
                    Google, Adobe, and Asana. Expertise in AI training, honed
                    through intimate knowledge of the AI trainer industry at
                    Turing
                  </p>
                  <div className="flex gap-4">
                    <Image
                      src={google}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={turningCom}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={asana}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={healthLine}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={more}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                  </div>
                </div>
              </div>
              <div
                className="col-span-12 min-h-56 md:col-span-6"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="h-full rounded-3xl bg-[#e8e6e664] p-8 backdrop-blur-xl">
                  <Image
                    src={avtExpert2}
                    width={88}
                    height={88}
                    alt="Floating Icon"
                    className="rounded-full"
                  />
                  <h3 className="mt-6 text-3xl font-medium">David Do</h3>
                  <p className="mt-3 text-base font-normal min-h-[130px]">
                    Senior Software Engineering leader with 20 years of
                    experience managing outsourced teams. Formerly led an
                    engineering organization of 500+ professionals and oversaw
                    multi-million-dollar contracts
                  </p>
                  <div className="flex gap-4">
                    <Image
                      src={alphaPlus}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={alphaway}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={ibmLogo}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={ericsson}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={techcombank}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                    <Image
                      src={more}
                      alt="tbrain-logo"
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[28px] aspect-square"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="skills" className="container mx-auto px-3 pt-24 mb-32">
          <div className="mx-auto max-w-screen-lg">
            <div className="border-gradient-rounded">
              <h3 className="mt-4 md:mt-3  font-medium text-center gradient-text !text-[40px]">
                Deep Technical Expertise
              </h3>
              <div className="mx-auto max-w-3xl">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-6">
                    <ul className="mt-12">
                      <li
                        className="flex items-center gap-4"
                        data-aos="fade-up"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">
                            Data Scientists/ Engineers/ Analysts:
                          </span>{" "}
                          <br /> Python, SQL, machine learning, LLM
                        </p>
                      </li>
                      <li
                        className="mt-5 flex items-center gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">Mathematics: </span>
                          real analysis, linear algebra, topology, number theory
                        </p>
                      </li>

                      <li
                        className="mt-5 flex items-center gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">Science:</span>{" "}
                          Physics, chemistry and biology
                        </p>
                      </li>
                      <li
                        className="mt-5 flex items-center gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">Vietnamese </span>
                          language
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <ul className="mt-12">
                      <li
                        className="mt-5 flex items-center gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">
                            Coding / Software engineers:{" "}
                          </span>
                          Python, C++, Java, backend, front end, full stack
                        </p>
                      </li>
                      <li
                        className="mt-5 flex items-center gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">
                            Finance & business:{" "}
                          </span>
                          macroeconomics, financial reporting, etc.
                        </p>
                      </li>
                      <li
                        className="mt-5 flex items-center gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                      >
                        <Image src={Tick} width={28} height={28} alt="icon" />
                        <p className="text-base font-normal">
                          <span className="gradient-text">
                            Medical Sciences:{" "}
                          </span>
                          Clinical, Basic medicines, Imaging, Diagnostics &
                          Laboratory Medicine
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="float-end">
                <div className="down-up">
                  <Image
                    src={StarFill}
                    width={38}
                    height={38}
                    alt="Floating Icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <TableStart />

        <section id="contact" className="container mx-auto px-3 pt-24">
          <div className="text-center">
            <h3 className="mx-auto max-w-screen-lg text-4xl md:text-5xl font-medium">
              Ready to start now{" "}
            </h3>
            <p className="text-lg text-black font-normal mt-4 mb-8">
              &middot; Our team is available to start a project immediately!{" "}
              <br /> &middot; Talk to us now about your needs!
            </p>
          </div>
          <div className="mx-auto max-w-screen-lg">
            <div className="w-full">
              <Image
                src={ImageContact}
                loading="lazy"
                height={500}
                width={2000}
                className="rounded-[30px] md:rounded-[61px]"
                alt="img"
              />
            </div>
            <h3 className="text-4xl font-medium text-center text-black my-8">
              Send us an email at{" "}
              <a
                href="mailto:info@tbrain.ai"
                className="text-[#682EC3] underline"
              >
                info@tbrain.ai
              </a>
            </h3>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
