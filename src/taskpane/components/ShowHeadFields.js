import React from "react";
import { BsFillInfoCircleFill } from "react-icons/bs";

const ShowHeadFields = (props) => {
  // eslint-disable-next-line react/prop-types
  let data = props.data;
  // eslint-disable-next-line react/prop-types
  let headerfields = data.headerFields;

  // eslint-disable-next-line react/prop-types
  let entity_label = data.label;

  return (
    <>
      <div className="col-9 mb-3">
        <div className="text-truncate" style={{ textTransform: "capitalize", fontSize: "17px" }}>
          {entity_label}
        </div>
        {headerfields !== undefined &&
          // eslint-disable-next-line react/prop-types
          Object.keys(headerfields).length > 0 &&
          // eslint-disable-next-line react/prop-types
          Object.entries(headerfields).map(([keys, fields]) => {
            // eslint-disable-next-line react/prop-types
            if (data[fields].length > 0) {
              return (
                <h6 className="text-truncate ms-Label root-154" key={keys} style={{ fontSize: "13px" }}>
                  <BsFillInfoCircleFill />
                  &nbsp;{data[fields]}
                </h6>
              );
            }
          })}
      </div>
    </>
  );
};

export default ShowHeadFields;
