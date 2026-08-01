import React from "react";
import { useGetPrivecyQuery, useGetTermsConditionsQuery } from "../page/redux/api/metaDataApi";

const LinkPrivecy = () => {
  const { data: termData, isLoading, error } = useGetPrivecyQuery();

  // Extract description from API response
  const description = termData?.data?.description || "No terms and Privecy available.";

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

export default LinkPrivecy;