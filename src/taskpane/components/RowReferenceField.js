import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { useIndexedDBStore } from "use-indexeddb";

const RowReferenceField = (props) => {
  const { getByID } = useIndexedDBStore("users");
  const [options, setOptions] = useState([]);

  const [initReference, setInitReference] = useState(true);

  const [referenceValue, setReferenceValue] = useState("");

  const [defvalue, setDefvalue] = useState("");

  // eslint-disable-next-line react/prop-types
  const fieldname = props.fieldName;
  // eslint-disable-next-line react/prop-types
  const recordData = props.data;
  if (recordData !== undefined && Object.keys(recordData).length > 0 && initReference) {
    // eslint-disable-next-line react/prop-types
    let referenceInfo = recordData[fieldname];
    if (
      defvalue === "" &&
      // eslint-disable-next-line react/prop-types
      referenceInfo.label !== undefined &&
      // eslint-disable-next-line react/prop-types
      referenceInfo.label !== null &&
      // eslint-disable-next-line react/prop-types
      referenceInfo.label !== ""
    ) {
      let def_Value = "";
      // eslint-disable-next-line react/prop-types
      def_Value = referenceInfo.label;
      setDefvalue(def_Value);
    }

    if (
      referenceValue === "" &&
      // eslint-disable-next-line react/prop-types
      referenceInfo.value !== undefined &&
      // eslint-disable-next-line react/prop-types
      referenceInfo.value !== null &&
      // eslint-disable-next-line react/prop-types
      referenceInfo.value !== ""
    ) {
      let defValueForRef = "";
      // eslint-disable-next-line react/prop-types
      defValueForRef = referenceInfo.value;
      setReferenceValue(defValueForRef);
    }

    setInitReference(false);
  }

  const getData = (searchTerm) => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getReferenceRecords.php";
      axios
        .request({
          method: "POST",
          url: api_url,
          // eslint-disable-next-line react/prop-types
          params: { referenceModule: props.referenceModule, search_value: searchTerm },
        })
        .then(function (response) {
          const data = response.data;
          setOptions(data);
        })
        .catch(() => {});
    });
  };

  const onInputChange = (event, value) => {
    if (value.length > 2) {
      getData(value);
    } else {
      setOptions([]);
    }
  };

  return (
    <>
      <div className="mb-3">
        <label htmlFor="uname" className="form-label">
          {/* eslint-disable-next-line react/prop-types */}
          {props.fieldLabel}
        </label>
        {/* eslint-disable-next-line react/prop-types */}
        <input type="hidden" name={props.fieldName} value={referenceValue} />
        <Autocomplete
          value={defvalue}
          options={options}
          onInputChange={onInputChange}
          onChange={(op, sa) => {
            if (sa !== null) {
              setReferenceValue(sa.value);
              setDefvalue(sa.label);
            } else {
              setDefvalue("");
              if (referenceValue.length > 0) {
                let ref_arr = referenceValue.split("x");
                setReferenceValue(ref_arr[0] + "x");
              }
            }
          }}
          isOptionEqualToValue={(option, value) => {
            option.label === value;
            setDefvalue(value);
          }}
          renderInput={(params) => {
            params.inputProps.className = "form-control " + params.inputProps.className;
            return (
              // eslint-disable-next-line react/prop-types
              <TextField required={props.fieldMandatory} {...params} label="type to search" variant="outlined" />
            );
          }}
        />
        {/* eslint-disable-next-line react/prop-types */}
        <div className="invalid-feedback">{props.fieldLabel} required.</div>
      </div>
    </>
  );
};

export default RowReferenceField;
