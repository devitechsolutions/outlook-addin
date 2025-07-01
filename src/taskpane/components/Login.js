import React, { useState } from "react";
import axios from "axios";
import { useIndexedDBStore } from "use-indexeddb";
import logo from "./../../../assets/logo.png";
import Spinner from "react-bootstrap/Spinner";

const Login = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [validated, setValidated] = useState(false);

  const { add } = useIndexedDBStore("users");

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === true) {
      setError(null);
      setLoading(true);
      const apiUrl = "https://letsrevitup.com/";
      axios
        .request({
          method: "POST",
          url: apiUrl + "/modules/OutlookAddIn/api/outlook-login.php",
          params: { username: event.target.username.value, password: event.target.password.value },
        })
        .then((response) => {
          if (response.data.success === false) {
            setLoading(false);
            setError(response.data.message);
          } else {
            add({
              id: 1,
              token: response.data.token,
              userid: response.data.user_data.id,
              crm_url: "https://letsrevitup.com/",
              username: response.data.user_data.firstname + " " + response.data.user_data.lastname,
            })
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .then((w) => {
                // console.log(w);
                // setLoading(false);
                // eslint-disable-next-line react/prop-types
                props.onLogin(true);
              })
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .catch((w) => {
                // console.log(w);
              });
          }
        })
        .catch((e) => {
          setLoading(false);
          // eslint-disable-next-line no-undef
          console.log(e);
          setError("Something went wrong. Please try again later.");
        });
    }

    setValidated(true);
  };

  return (
    <div className="card border-0" style={{ borderRadius: "0" }}>
      <div className="container" /*style={{ background: "#d3d3d326" }}*/ >
        <div className="row text-center mt-3">
          <div className="col-12">
            <img src={logo} style={{ width: "72px" }}></img>
          </div>
          {/* <div className="col-12" style={{ fontSize: "20px" }}>
            Sign in
          </div> */}
          {/* <div className="col-12" style={{ fontSize: "13px", color: "gray" }}>
            with your CRM Credential
          </div> */}
        </div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <form
          className={`${validated ? "was-validated" : "needs-validation"}`}
          noValidate
          // validated={validated}
          onSubmit={handleSubmit}
        >
          {/* <div className="mb-3 pt-3">
            <div className="form-row">
              <label htmlFor="uname" className="form-label">
                CRM URL
              </label>
              <input
                className="form-control"
                type="text"
                id="uname"
                placeholder="CRM URL"
                name="crm_url"
                aria-describedby="inputGroupPrepend"
                required
                style={{ fontSize: "13px", borderRadius: "0" }}
              />
              <div className="invalid-feedback">Please fill out this field.</div>
            </div>
          </div> */}
          <div className="mb-3">
            <div className="form-row">
              <label htmlFor="uname" className="form-label">
                Username
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="Username"
                name="username"
                aria-describedby="inputGroupPrepend"
                required
                style={{ fontSize: "13px", borderRadius: "0" }}
              />
              <div className="invalid-feedback">Please fill out this field.</div>
            </div>
          </div>
          <div className="mb-3">
            <div className="form-row">
              <label htmlFor="uname" className="form-label">
                Password
              </label>
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                name="password"
                aria-describedby="inputGroupPrepend"
                required
                style={{ fontSize: "13px", borderRadius: "0" }}
              />
              <div className="invalid-feedback">Please fill out this field.</div>
            </div>
          </div>
          {error && (
            <>
              <small style={{ color: "red" }}>{error}</small>
              <br />
            </>
          )}
          <br />
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary"
              disabled={loading}
              type="submit"
              style={{
                width: "100%",
                borderRadius: "0",
                fontSize: "14px",
              }}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                  <span>&nbsp;Signing...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
