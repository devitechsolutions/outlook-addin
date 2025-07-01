import React, { useState } from "react";
import ModuleList from "./ModuleList";
// import { MdOutlineMarkEmailRead } from "react-icons/md";
// import { IoIosContact } from "react-icons/io";
import RenderEntityForm from "./RenderEntityForm";

const CreateMode = (props) => {
  // eslint-disable-next-line react/prop-types
  let saved_to = props.fromEmail;
  // eslint-disable-next-line react/prop-types
  let fullname = props.firstname + " " + props.lastname;

  const [SelectMode, setSelectMode] = useState(true);

  const [ShowEntityForm, setShowEntityForm] = useState(false);

  const [module, setModule] = useState("");

  const onSelectModeHandler = () => {
    setSelectMode(!SelectMode);
  };

  const ContactClickHandler = () => {
    setModule("Contacts");
    setSelectMode(false);
    setShowEntityForm(true);
  };

  const LeadClickHandler = () => {
    setModule("Leads");
    setSelectMode(false);
    setShowEntityForm(true);
  };

  const AccountClickHandler = () => {
    setModule("Accounts");
    setSelectMode(false);
    setShowEntityForm(true);
  };

  const CancelClickHandler = () => {
    setShowEntityForm(false);
    setSelectMode(true);
  };

  return (
    <>
      <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
        <div className="card-body">
          <div className="">
            <div className="col-12 text-truncate" style={{ textTransform: "capitalize", fontSize: "17px" }}>
              {fullname}
            </div>
            <div className="col-12 text-truncate mb-1"> {saved_to} </div>
          </div>
        </div>
      </div>
      <div>
        {SelectMode && (
          <ModuleList
            onSelectMode={onSelectModeHandler}
            onContactClick={ContactClickHandler}
            onLeadClick={LeadClickHandler}
            onAccountClick={AccountClickHandler}
          />
        )}
        {ShowEntityForm && <RenderEntityForm module={module} onCancelClick={CancelClickHandler} {...props} />}
      </div>
    </>
  );
};

export default CreateMode;
