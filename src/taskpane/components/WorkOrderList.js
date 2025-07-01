import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdArrowBackIosNew } from "react-icons/md";
import WorkOrderTableList from "./WorkOrderTableList";
import BsLoader from "./BsLoader";
import { toast } from "react-toastify";
import { useIndexedDBStore } from "use-indexeddb";

const WorkOrderList = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const crmid = props.crmid;

  // eslint-disable-next-line react/prop-types
  const module = props.module;

  const [WorkOrderList, setWorkOrderList] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getRelatedRecords.php";
      setLoading(true);
      axios
        .request({
          method: "POST",
          url: api_url,
          params: { record: crmid, module: module, relModule: "SalesOrder" },
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
            setWorkOrderList(data.data);
          }
          setLoading(false);
        })
        .catch(() => {});
    });
  }, []);

  const CancelClickHandler = () => {
    // eslint-disable-next-line react/prop-types
    props.onCancelClick();
  };

  return (
    <>
      <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
        <div className="card-body">
          <div className="row">
            <div className="col-12">
              <a href="#" onClick={CancelClickHandler} style={{ textDecoration: "none" }}>
                <MdArrowBackIosNew style={{ verticalAlign: "middle" }} />
                &nbsp;Back
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
        <div className="card-body">
          {loading ? (
            <BsLoader />
          ) : (
            <>
              {WorkOrderList !== undefined && WorkOrderList.length > 0 ? (
                <WorkOrderTableList data={WorkOrderList} />
              ) : (
                <div className="text-center">No Record Found</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkOrderList;
