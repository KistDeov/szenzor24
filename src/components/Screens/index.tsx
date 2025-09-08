"use client";

import Graphics from "@/components/Screens/Graphics";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Screens = () => {
  return (
    <>
      <section id="screens" className="relative z-20 pt-[110px]">
        <div className="container">
          <div
            className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center"
            data-wow-delay=".2s"
          >
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[44px] md:leading-tight dark:text-white">
              Szoftver képernyőképek
            </h2>
            <p className="text-body text-base">
              Tekintsd meg a modern és felhasználóbarát felületet, amely
              megkönnyíti a mindennapi levelezési feladatokat.
            </p>
          </div>
        </div>

        <div className="container">
          <div
            className="wow fadeInUp mx-auto max-w-[900px]"
            data-wow-delay=".2s"
          >
            <Swiper
              className="swiper mySwiper relative z-20"
              modules={[Navigation]}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              loop={true}
              slidesPerView={1}
              spaceBetween={40}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                1024: {
                  slidesPerView: 1,
                  spaceBetween: 40,
                },
              }}
            >
       


              {/* Slide 1: level_szerkeztes */}
              <SwiperSlide>
                <div className="xs:max-w-[1800px] mx-auto w-full max-w-[900px]">
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/level_szerkesztes_dark.png"}
                    alt="screenshot 1"
                    className="mx-auto w-full rounded-2xl block dark:hidden"
                  />
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/level_szerkeztes_light.png"}
                    alt="screenshot 1 dark"
                    className="mx-auto w-full rounded-2xl hidden dark:block"
                  />
                </div>
              </SwiperSlide>

              {/* Slide 2: fooldal */}
              <SwiperSlide>
                <div className="xs:max-w-[1800px] mx-auto w-full max-w-[900px]">
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/fooldal_dark.png"}
                    alt="screenshot 2"
                    className="mx-auto w-full rounded-2xl block dark:hidden"
                  />
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/fooldal_light.png"}
                    alt="screenshot 2 dark"
                    className="mx-auto w-full rounded-2xl hidden dark:block"
                  />
                </div>
              </SwiperSlide>

              {/* Slide 3: level_szerkezet */}
              <SwiperSlide>
                <div className="xs:max-w-[1800px] mx-auto w-full max-w-[900px]">
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/level_szerkezet_dark.png"}
                    alt="screenshot 3"
                    className="mx-auto w-full rounded-2xl block dark:hidden"
                  />
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/level_szerkezet_light.png"}
                    alt="screenshot 3 dark"
                    className="mx-auto w-full rounded-2xl hidden dark:block"
                  />
                </div>
              </SwiperSlide>

              {/* Slide 4: level_be */}
              <SwiperSlide>
                <div className="xs:max-w-[1800px] mx-auto w-full max-w-[900px]">
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/level_be_dark.png"}
                    alt="screenshot 4"
                    className="mx-auto w-full rounded-2xl block dark:hidden"
                  />
                  <Image
                    width={900}
                    height={1800}
                    src={"/images/screens/level_be_light.png"}
                    alt="screenshot 4 dark"
                    className="mx-auto w-full rounded-2xl hidden dark:block"
                  />
                </div>
              </SwiperSlide>

              <div className="flex items-center justify-center gap-x-4 pt-10">
                <button className="swiper-button-prev">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_46_342)">
                      <path
                        d="M6.52334 10.8334L10.9933 15.3034L9.81501 16.4817L3.33334 10L9.815 3.51836L10.9933 4.69669L6.52334 9.16669L16.6667 9.16669L16.6667 10.8334L6.52334 10.8334Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_46_342">
                        <rect
                          width="20"
                          height="20"
                          fill="white"
                          transform="translate(20 20) rotate(180)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                <button className="swiper-button-next">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_46_337)">
                      <path
                        d="M13.4767 9.16664L9.00667 4.69664L10.185 3.51831L16.6667 9.99998L10.185 16.4816L9.00667 15.3033L13.4767 10.8333H3.33334V9.16664H13.4767Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_46_337">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </Swiper>
          </div>
        </div>

        {/*Graphics*/}
        <Graphics />
      </section>
    </>
  );
};

export default Screens;
