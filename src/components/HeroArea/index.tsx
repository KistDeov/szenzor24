"use client";

import FsLightbox from "fslightbox-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const HeroArea = () => {
  const [toggler, setToggler] = useState(false);
  const modelViewerRef = useRef<HTMLDivElement>(null);

  // Load model from local images/hero directory (no remote logic)
  const localModelPath = "/images/hero/zold_feher.glb";
  const [modelSrc, setModelSrc] = useState<string>(localModelPath);

  useEffect(() => {
    // Dinamikusan importáljuk a model-viewer-t
    import("@google/model-viewer");
    // Nothing to check — we always use the local model path
  }, []);

  // Attach listeners to the model-viewer element to detect load errors at runtime
  useEffect(() => {
    const container = modelViewerRef.current;
    if (!container) return;

    const mv = container.querySelector("model-viewer");
    if (!mv) return;

    const onError = (ev: Event) => {
      // Log and replace the viewer with a static image placeholder
      console.warn("model-viewer failed to load model:", ev);
      // replace the model-viewer node with an image
      const parent = mv.parentElement;
      if (parent) {
        parent.innerHTML = `<img src="/images/hero/hero-light.png" alt="Model not available" style="width:100%;height:400px;object-fit:contain"/>`;
      }
    };

    const onLoad = () => {
      console.debug("model-viewer loaded model successfully");
    };

    mv.addEventListener("error", onError as EventListener);
    mv.addEventListener("load", onLoad as EventListener);

    return () => {
      mv.removeEventListener("error", onError as EventListener);
      mv.removeEventListener("load", onLoad as EventListener);
    };
  }, [modelSrc]);

  return (
    <>
      <section id="home" className="pt-[165px]">
        <div className="container lg:max-w-[1305px] lg:px-10">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-6/12">
              <div
                className="wow fadeInUp mb-12 lg:mb-0 lg:max-w-[570px]"
                data-wow-delay=".3s"
              >
                <span className="mb-5 block text-lg leading-tight font-medium text-black sm:text-[22px] xl:text-[22px] dark:text-white">
                  Okos szenzorok, melyek leegyszerűsítik az életed!
                </span>
                <h1 className="mb-6 text-3xl leading-tight font-bold text-black sm:text-[40px] md:text-[50px] lg:text-[42px] xl:text-[50px] dark:text-white">
                  <span className="bg-clip-text font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                  Szenzor24{" "}
                  </span>
                  - A szenzorok királya, a királyok szenzora!
                </h1>
                <p className="text-body mb-10 max-w-[475px] text-base leading-relaxed">
                 Fizess elő most és élvezd egyből a hatékonyságot és a kényelmet!
                </p>
                <p className="flex flex-wrap gap-4">
                </p>
               
              </div>
            </div>

            <div className="w-full px-4 lg:w-6/12">
              <div
                className="wow fadeInUp relative z-10 mx-auto w-full max-w-[790px]"
                data-wow-delay=".3s"
              >
 <div
                  ref={modelViewerRef}
                  dangerouslySetInnerHTML={{
                    __html: `<model-viewer
                      src="${modelSrc ?? localModelPath}"
                      alt="3D model"
                      auto-rotate
                      camera-controls
                      crossorigin="anonymous"
                      style="width: 100%; height: 400px;">
                    </model-viewer>`,
                  }}
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
