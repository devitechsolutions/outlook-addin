import React, { useState } from "react";
import { FaUsers, FaEdit } from "react-icons/fa";
import { useIndexedDBStore } from "use-indexeddb";
import { Shimmer, ShimmerElementType, ThemeProvider, mergeStyles } from "@fluentui/react";

const ActivityDetail = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const activitiesData = props.data;

  function ActivityEditHandler(id) {
    // eslint-disable-next-line react/prop-types
    props.onEditCancelClick(id);
  }

  const [loading, setLoading] = useState(true);

  const [crm_url, setCrmUrl] = useState("");

  getByID(1).then((res) => {
    setCrmUrl(res.crm_url);
    setLoading(false);
  });

  const wrapperClass = mergeStyles({
    padding: 2,
    selectors: {
      "& > .ms-Shimmer-container": {
        margin: "10px 0",
      },
    },
  });
  const shimmerWithElementFirstRow = [
    { type: ShimmerElementType.circle },
    { type: ShimmerElementType.gap, width: "2%" },
    { type: ShimmerElementType.line, width: "82%" },
    { type: ShimmerElementType.gap, width: "16%" },
  ];
  const shimmerWithElementSecondRow = [
    { type: ShimmerElementType.line, width: "50%" },
    { type: ShimmerElementType.gap, width: "50%" },
  ];

  return (
    <>
      {!loading && (
        <>
          {Object.entries(activitiesData).map(([keys, fields]) => {
            let record = fields.id;
            var record_arr = record.split("x");
            record = record_arr[1];

            return (
              <div className="border-bottom mb-1" key={keys}>
                <div className="row">
                  <div className="col-1 h6">
                    <FaUsers />
                  </div>
                  <div className="col-9 h6">
                    <a
                      href={crm_url + `/index.php?module=Calendar&view=Detail&record=${record}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {fields.subject}
                    </a>
                  </div>
                  <div className="col-1 text-end">
                    {fields.iseditable && (
                      <FaEdit
                        style={{ color: "#172b4d" }}
                        onClick={() => {
                          ActivityEditHandler(fields.id);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="row h6">
                  <div className="small">{fields.startDateTime}</div>
                </div>
              </div>
            );
          })}
        </>
      )}
      {loading && (
        <ThemeProvider className={wrapperClass}>
          <Shimmer shimmerElements={shimmerWithElementFirstRow} />
          <Shimmer shimmerElements={shimmerWithElementSecondRow} />
          <hr />
          <Shimmer shimmerElements={shimmerWithElementFirstRow} />
          <Shimmer shimmerElements={shimmerWithElementSecondRow} />
        </ThemeProvider>
      )}
    </>
  );
};

export default ActivityDetail;
