import React from "react";
import { useGetTermsConditionsQuery } from "../page/redux/api/metaDataApi";

const LinkTerms = () => {
  const { data: termData, isLoading, error } = useGetTermsConditionsQuery();

  // Extract description from API response
  const description = termData?.data?.description || "No terms and conditions available.";

  return (
    <div className="container m-auto">
      {isLoading ? (
        <div className="text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">
          Error: {error?.data?.message || "Failed to load terms and conditions"}
        </div>
      ) : (
       <div>
      
         <div
          className=" bg-white p-4 mt-8"
          dangerouslySetInnerHTML={{ __html: description }}
        />
       </div>
      )}
    </div>
  );
};

export default LinkTerms;