import React from "react";
import { MagicButton } from "./ui/MagicButton";
import { FaLocationArrow } from "react-icons/fa";
import { socialMedia } from "@/data";

function Footer() {
  return (
    <footer className="w-full mb-[150px] md:mb-5 pb-10" id="contact">
      <div className="flex flex-col items-center">
        <h1 className="heading lg:max-w-[40vw]">
          Ready to <span className="text-purple">get started?</span>
        </h1>
        <p className="text-center mt-5 text-lg max-w-[40vw]">
          Let&apos;s build something amazing together. Let&apos;s turn your idea
          into a<span> reality.</span>
        </p>
        <a
          href="mailto:shamiulhasan20@gmail.com"
          aria-label="Send email to Shamiul Hasan"
        >
          <MagicButton
            title="Lets get in touch"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>
      <div className="flex flex-col items-center justify-between mt-16">
        <p className="text-center mt-10 text-gray-400">
          &copy; 2025 Shamiul Hasan. All rights reserved.
        </p>
      </div>
      <div className="flex items-center justify-center mt-3 md:gap-3 gap-6">
        {socialMedia.map((profile) => (
          <div
            key={profile.id}
            className="w-10 h-10 cursor-pointer flex items-center justify-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300"
          >
            <img
              src={profile.img}
              alt={profile.id.toString()}
              width={20}
              height={20}
            />
          </div>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
