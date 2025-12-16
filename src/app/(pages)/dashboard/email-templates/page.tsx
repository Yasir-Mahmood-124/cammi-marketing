import React from "react";
import ComingSoon from "@/components/ComingSoon";
import EmailTemplate from "@/assests/gif/EmailTemplates.gif";

const page = () => {
  return (
    <ComingSoon gifSrc={EmailTemplate} />
  );
};

export default page;
