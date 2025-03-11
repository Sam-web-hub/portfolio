import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { companies, testimonials } from "@/data";

function Clients() {
  return (
    <div className="py-20" id="testimonials">
      <h1 className="heading">
        Kind words from <span className="text-purple">Satisfied Customers</span>
      </h1>
      <div className="flex flex-col items-center max-lg:mt-10">
        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="slow"
        />
        <div className="flex flex-wrap  justify-center items-center gaap-4 md:g-16 max-lg:mt-10">
          {companies.map(({ id, name, img, nameImg }) => (
            <div key={id} className="flex md:max-w-60 max-w-32 gap-2">
              <img src={img} alt={name} className="md:w-10 w-5" />
              <img src={nameImg} alt={name} className="md:w-24 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Clients;
