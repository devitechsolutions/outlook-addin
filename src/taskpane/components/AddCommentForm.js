import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoIosArrowBack } from "react-icons/io";
import { useIndexedDBStore } from "use-indexeddb";
import { Shimmer, ShimmerElementType, ThemeProvider, mergeStyles } from "@fluentui/react";
import { toast } from "react-toastify";

const AddCommentForm = (props) => {
  const { getByID } = useIndexedDBStore("users");
  // eslint-disable-next-line react/prop-types
  const crmid = props.crmid;

  const [comments, setComments] = useState([]);

  const [refresh, setRefresh] = useState(false);

  const [loading, setLoading] = useState(false);

  const [validated, setValidated] = useState(false);

  const [saving, setSaving] = useState(false);

  const [comment_content, setCommentContent] = useState("");

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getRelatedRecords.php";
      setLoading(true);
      axios
        .request({
          method: "POST",
          url: api_url,
          params: { record: crmid, relModule: "ModComments" },
        })
        .then((response) => {
          setLoading(false);
          let data = response.data;
          if (data.success === true) {
            setComments(data.data);
          }
        })
        .catch(() => {});
    });
  }, [refresh]);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === true) {
      setValidated(false);
      const formData = new FormData(event.target);
      const formDataObj = Object.fromEntries(formData.entries());

      setSaving(true);
      getByID(1).then((res) => {
        let crm_url = res.crm_url;
        const apiUrl = crm_url + "/modules/OutlookAddIn/api/save_comment.php";
        axios
          .request({
            method: "POST",
            url: apiUrl,
            params: formDataObj,
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
            } else {
              setSaving(false);
              setCommentContent("");
              setRefresh(!refresh);
            }
          })
          .catch(() => {});
      });
    } else {
      setValidated(true);
    }
  };

  const CancelClickHandler = () => {
    // eslint-disable-next-line react/prop-types
    props.onCancelClick();
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
      {/* eslint-disable-next-line react/no-unknown-property */}
      <form className={`${validated ? "was-validated" : "needs-validation"}`} noValidate onSubmit={handleSubmit}>
        <input type="hidden" name="crmid" value={crmid} />
        <div className="card border-0 py-2 px-2 mt-3" style={{ borderRadius: 0 }}>
          <div className="row">
            <div className="col-6">
              <a href="#" style={{ textDecoration: "none" }} onClick={CancelClickHandler}>
                <IoIosArrowBack />
                Back
              </a>
            </div>
            {/* <div className="col-6 text-end">
              <h6> Comments </h6>
            </div> */}
          </div>
          <hr style={{ margin: "0.5rem 0" }} />
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Type comment here..."
              name="commentcontent"
              aria-describedby="inputGroupPrepend"
              required={true}
              value={comment_content}
              onChange={(e) => {
                setCommentContent(e.target.value);
              }}
              style={{ fontSize: "14px", borderRadius: "0" }}
            />
            <div className="invalid-feedback">Comment required</div>
          </div>
          <div className="row">
            <div className="col-12 text-end">
              <span>
                <a
                  href="#"
                  className="px-2"
                  style={{ textDecoration: "none" }}
                  onClick={() => {
                    setCommentContent("");
                  }}
                >
                  Reset
                </a>
              </span>
              <button
                className="btn btn-primary btn-sm"
                disabled={saving}
                type="submit"
                style={{ fontSize: "12px", borderRadius: "0" }}
              >
                {saving ? "Wait..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="card mt-2 border-0 py-3 px-3">
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
              {Object.entries(comments).map(([keys, cmt]) => {
                return (
                  <div key={keys}>
                    <div className="row">
                      <div className="col-sm-12 py-2" style={{ fontSize: "13px" }}>
                        <span>{cmt.commentcontent}</span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-7">
                        <span className="col-form-label-sm text-muted" style={{ fontSize: "12px", paddingRight: "0" }}>
                          {cmt.assigned_user_id.label}
                        </span>
                      </div>
                      <div className="col-5 text-end col-form-label-sm text-muted" style={{ fontSize: "12px" }}>
                        {cmt.modifiedtime}
                      </div>
                    </div>
                    <hr />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </form>
    </>
  );
};

export default AddCommentForm;
