import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdArrowBackIosNew } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import ActivityDetail from "./ActivityDetail";
import ActivityForm from "./ActivityForm";
import { useIndexedDBStore } from "use-indexeddb";
import { Shimmer, ShimmerElementType, ThemeProvider, mergeStyles } from "@fluentui/react";
import { toast } from "react-toastify";

const Activities = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const crmid = props.crmid;

  const [Activities, setActivities] = useState([]);

  const [ShowActivityForm, setShowActivityForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState("");

  const [isCreatable, setIsCreatable] = useState(false);

  useEffect(() => {
    setLoading(true);
    getByID(1).then((res) => {
      setLoading(false);
      let crm_url = res.crm_url;
      if (crm_url !== "" && crm_url !== undefined) {
        let api_url = crm_url + "/modules/OutlookAddIn/api/getUpcomingActivities.php";
        setLoading(true);
        axios
          .request({
            method: "POST",
            url: api_url,
            params: { record: crmid },
          })
          .then((response) => {
            if (response.data.success === false) {
              if (response.data.code === 100) {
                toast.error(response.data.message, {
                  closeOnClick: true,
                  pauseOnHover: true,
                  theme: "colored",
                  autoClose: 7000,
                });
                // eslint-disable-next-line react/prop-types
                props.onLogout();
              } else {
                toast.error(response.data.message, {
                  closeOnClick: true,
                  pauseOnHover: true,
                  theme: "colored",
                  autoClose: 7000,
                });
              }
            } else if (response.data.success === true) {
              let data = response.data;
              setActivities(data.data);
              setIsCreatable(data.creatable);
            }
            setLoading(false);
          })
          .catch(() => {});
      }
    });
  }, [ShowActivityForm]);

  const CancelClickHandler = () => {
    // eslint-disable-next-line react/prop-types
    props.onCancelClick();
  };

  const addActivityHandler = () => {
    setShowActivityForm(true);
  };

  const EditClickHandler = (id) => {
    setShowActivityForm(true);
    setEditId(id);
  };

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
      {ShowActivityForm ? (
        <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
          <ActivityForm
            record={editId}
            parentid={crmid}
            {...props}
            onFormCancelClick={() => setShowActivityForm(false)}
          />
        </div>
      ) : (
        <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
          <div className="card-header bg-white">
            <div className="row">
              <div className="col-10">
                <a href="#" onClick={CancelClickHandler} style={{ textDecoration: "none" }}>
                  <MdArrowBackIosNew style={{ verticalAlign: "middle" }} />
                  &nbsp;Back
                </a>
              </div>
              <div className="col-2 text-end">
                {isCreatable && (
                  <a href="#" className="" onClick={addActivityHandler} style={{ color: "#172b4d" }}>
                    <FaPlus />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <ThemeProvider className={wrapperClass}>
                <Shimmer shimmerElements={shimmerWithElementFirstRow} />
                <Shimmer shimmerElements={shimmerWithElementSecondRow} />
                <hr />
                <Shimmer shimmerElements={shimmerWithElementFirstRow} />
                <Shimmer shimmerElements={shimmerWithElementSecondRow} />
              </ThemeProvider>
            ) : (
              <>
                {Activities !== undefined && Activities.length > 0 ? (
                  <ActivityDetail data={Activities} onEditCancelClick={EditClickHandler} />
                ) : (
                  <div className="text-center">No pending activities</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Activities;
