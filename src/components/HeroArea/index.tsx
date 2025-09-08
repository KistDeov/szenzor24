"use client";

import FsLightbox from "fslightbox-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const HeroArea = () => {
  const [toggler, setToggler] = useState(false);

  return (
    <>
      <section id="home" className="pt-[165px] font-pixellari">
        <div className="container lg:max-w-[1305px] lg:px-10">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-6/12">
              <div
                className="wow fadeInUp mb-12 lg:mb-0 lg:max-w-[570px]"
                data-wow-delay=".3s"
              >
                <span className="mb-5 block text-lg leading-tight font-medium text-black sm:text-[22px] xl:text-[22px] dark:text-white">
                  Ai vezérelt, Automata levelezés
                </span>
                <h1 className="mb-6 text-3xl leading-tight font-bold text-black sm:text-[40px] md:text-[50px] lg:text-[42px] xl:text-[50px] dark:text-white">
                  <span className="bg-gradient-1 bg-clip-text text-transparent">
                  Okos Mail{" "}
                  </span>
                  - Az AI által vezérelt automata levelező rendszer
                </h1>
                <p className="text-body mb-10 max-w-[475px] text-base leading-relaxed">
                  Töltse le most, és próbálja ki INGYEN a legújabb verziót!
                </p>

                <div className="flex flex-wrap items-center">
                  <Link
                    href="#"
                    className="mr-6 mb-6 inline-flex h-[60px] items-center rounded-lg bg-black px-[30px] py-[14px] text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    <span>
                      Letöltés
                    </span>
                  </Link>

                  <Link
                    href="#"
                    onClick={() => setToggler(!toggler)}
                    className="glightbox hover:text-primary dark:hover:text-primary mb-6 inline-flex items-center py-4 text-black dark:text-white"
                  >
                    <span className="mr-[22px] flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-current">
                      <svg
                        width="14"
                        height="16"
                        viewBox="0 0 14 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.5 7.06367C14.1667 7.44857 14.1667 8.41082 13.5 8.79572L1.5 15.7239C0.833334 16.1088 -3.3649e-08 15.6277 0 14.8579L6.05683e-07 1.00149C6.39332e-07 0.231693 0.833334 -0.249434 1.5 0.135466L13.5 7.06367Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <span className="text-base font-medium">
                      <span className="block text-sm"> Videó megtekintése </span>
                      Nézd meg hogyan működik
                    </span>
                  </Link>

                  <FsLightbox
                    toggler={toggler}
                    sources={[
                      "https://www.youtube.com/watch?v=_L2sfpTkVHw",
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="w-full px-4 lg:w-6/12">
              <div
                className="wow fadeInUp relative z-10 mx-auto w-full max-w-[790px]"
                data-wow-delay=".3s"
              >
                <Image
                  width={990}
                  height={546}
                  src={"/images/hero/dashboard_light.png"}
                  alt="hero image"
                  className="block dark:hidden"
            
                />
                <Image
                  width={990}
                  height={546}
                  src={"/images/hero/dashboard_dark.png"}
                  alt="hero image"
                  className="hidden dark:block"
                  style={{ width: "auto", height: "auto" }}
                />
                
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroArea;
