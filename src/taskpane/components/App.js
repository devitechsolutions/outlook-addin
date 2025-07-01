import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Login from "./Login";
import Home from "./Home";
import Progress from "./Progress";
import setupIndexedDB, { useIndexedDBStore } from "use-indexeddb";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from '@fluentui/react/lib/Spinner';
import { Stack } from '@fluentui/react/lib/Stack';

App.propTypes = {
  title: PropTypes.string,
  isOfficeInitialized: PropTypes.bool,
};

/* global require */

function App(props) {
  const { getByID, deleteByID } = useIndexedDBStore("users");
  setupAxios(axios, getByID);

  const title = props.title;
  const isOfficeInitialized = props.isOfficeInitialized;
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(false);

  let token = "";
  let crm_url = "";

  useEffect(() => {
    getByID(1)
      .then((res) => {
        token = res.token;
        crm_url = res.crm_url;
        if (token !== "" && token !== undefined && crm_url !== "" && crm_url !== undefined) {
          const api_url = crm_url + "/modules/OutlookAddIn/api/verifyPortalToken.php";
          axios
            .request({
              method: "POST",
              url: api_url,
              params: { api_token: token },
            })
            .then(() => {
              // setUserSession(response.data.token, response.data.user);
              setAuthLoading(false);
              setCurrentUser(true);
            })
            .catch(() => {
              logoutHandler();
            });
        } else {
          setAuthLoading(false);
        }
      })
      .catch(() => {
        setAuthLoading(false);
      });
  }, [currentUser]);

  const stackTokens = {
    childrenGap: 20,
  };

  if (authLoading && token) {
    return <div className="content">
      <Stack tokens={stackTokens}>
        <div>
          <Spinner label="Wait, still loading..." ariaLive="assertive" labelPosition="top" />
        </div>
      </Stack>
    </div>;
  }

  const logoutHandler = () => {
    // removeUserSession();
    deleteByID(1)
      .then(() => {
        setCurrentUser(false);
        setAuthLoading(false);
      })
      .catch(() => {
        setCurrentUser(false);
        setAuthLoading(false);
      });
  };

  const loginHandler = (isLogin) => {
    setAuthLoading(false);
    getByID(1).then((res) => {
      token = res.token;
      setCurrentUser(isLogin);
      setAuthLoading(true);
    });
  };

  // Database Configuration
  const idbConfig = {
    databaseName: "version-1-msoutlook-db",
    version: 1,
    stores: [
      {
        name: "users",
        id: { keyPath: "id", autoIncrement: false },
        indices: [
          { name: "token", keypath: "token", options: { unique: false } },
          { name: "userid", keypath: "userid", options: { unique: false } },
          { name: "crm_url", keypath: "crm_url", options: { unique: false } },
          { name: "username", keypath: "username", options: { unique: false } },
        ],
      },
    ],
  };

  useEffect(() => {
    setupIndexedDB(idbConfig)
      .then(() => {
        // eslint-disable-next-line no-undef
        console.log("successfully db created");
      })
      // eslint-disable-next-line no-undef
      .catch((e) => console.error("error / unsupported Indexeddb", e));
  }, [currentUser]);

  return (
    <>
      {!isOfficeInitialized ? (
        <Progress
          title={title}
          logo={require("./../../../assets/logo.png")}
          message="Please sideload your addin to see app body or Refresh frame."
        />
      ) : (
        <div className="App" style={{ backgroundColor: "#f7f7f7" }}>
          <ToastContainer theme="colored" />
          {authLoading && <div className="content" style={{ backgroundColor: "#ffffff" }}>
              <Stack tokens={stackTokens}>
                <div>
                  <Spinner label="Wait, still loading..." ariaLive="assertive" labelPosition="top" />
                </div>
              </Stack>  
            </div>}
          {!authLoading && (currentUser ? <Home onLogout={logoutHandler} /> : <Login onLogin={loginHandler} />)}
        </div>
      )}
    </>
  );
}

function setupAxios(axios, getByID) {
  axios.defaults.headers.Accept = "application/json";
  axios.interceptors.request.use(async function (config) {
    let token = "";
    await getByID(1)
      .then((res) => {
        token = res.token;
        if (token !== "" && token !== undefined) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      })
      .catch(() => {});
    return config;
  });
  axios.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      if (err.response) {
        // Access Token was expired
        if (err.response.status === 404 && !originalConfig._retry) {
          originalConfig._retry = true;
          // eslint-disable-next-line no-undef
          console.log(err.response);
          try {
            // const rs = await refreshToken();
            // const { accessToken } = rs.data;
            // window.localStorage.setItem("accessToken", accessToken);
            // axios.defaults.headers.common["x-access-token"] = accessToken;
            // return axios(originalConfig);
          } catch (_error) {
            if (_error.response && _error.response.data) {
              return Promise.reject(_error.response.data);
            }

            return Promise.reject(_error);
          }
        }

        if (err.response.status === 403 && err.response.data) {
          return Promise.reject(err.response.data);
        }
      }

      return Promise.reject(err);
    }
  );
}

export default App;
