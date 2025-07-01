import React, { useEffect, useState } from "react";
import axios from "axios";
import ContactTable from "./ContactTable";
import InvoiceTable from "./InvoiceTable";
import EmailsTable from "./EmailsTable";
import DocumentsTable from "./DocumentsTable";
import PotentialsTable from "./PotentialsTable";
import PurchaseOrderTable from "./PurchaseOrderTable";
import SalesOrderTable from "./SalesOrderTable";
import ProductTable from "./ProductTable";
import VendorTable from "./VendorTable";
import QuotesTable from "./QuotesTable";
import TaskTable from "./TaskTable";
import { useIndexedDBStore } from "use-indexeddb";
import { MdArrowBackIosNew } from "react-icons/md";
import { Shimmer, ShimmerElementType, ThemeProvider, mergeStyles } from "@fluentui/react";
import { toast } from "react-toastify";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RenderRelatedTabInfo = (props) => {
  const { getByID } = useIndexedDBStore("users");

  const [loading, setLoading] = useState(true);

  const [RecordList, setRecordList] = useState([]);

  const [RecordHeader, setRecordHeader] = useState([]);

  const [isCreatable, setIsCreatable] = useState(false);

  useEffect(() => {
    getByID(1).then((res) => {
      let crm_url = res.crm_url;
      let api_url = crm_url + "/modules/OutlookAddIn/api/getRelatedRecords.php";
      setLoading(true);
      axios
        .request({
          method: "POST",
          url: api_url,
          params: {
            // eslint-disable-next-line react/prop-types
            module: props.entity_info.module,
            // eslint-disable-next-line react/prop-types
            relModule: props.related_module,
            // eslint-disable-next-line react/prop-types
            record: props.entity_info.crmid,
          },
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
            setRecordList(data.data);
            setRecordHeader(data.headerFields);
            setIsCreatable(data.creatable);
          }
          setLoading(false);
        })
        .catch(() => {});
    });
  }, []);

  const CreateRelatedTabTable = () => {
    // eslint-disable-next-line react/prop-types
    switch (props.related_module) {
      case "Contacts": {
        return <ContactTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Invoice": {
        return <InvoiceTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Emails": {
        return <EmailsTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Documents": {
        return <DocumentsTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Potentials": {
        return <PotentialsTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Quotes": {
        return <QuotesTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "PurchaseOrder": {
        return <PurchaseOrderTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "SalesOrder": {
        return <SalesOrderTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Products": {
        return <ProductTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Vendors": {
        return <VendorTable data={RecordList} {...props} headerFields={RecordHeader} />;
      }
      case "Task": {
        return <TaskTable data={RecordList} {...props} headerFields={RecordHeader} Creatable={isCreatable} crmid={props.entity_info.crmid} />;
      }
      default:
        return <h1>Coming soon...</h1>;
    }
  };

  const wrapperClass = mergeStyles({
    padding: 2,
    selectors: {
      "& > .ms-Shimmer-container": {
        margin: "10px 0",
      },
    },
  });

  const shimmerWithElementSecondRow = [
    { type: ShimmerElementType.line, height: 16, width: "10%" },
    { type: ShimmerElementType.gap, width: "10%" },
    { type: ShimmerElementType.line, height: 16, width: "40%" },
    { type: ShimmerElementType.gap, width: "10%" },
    { type: ShimmerElementType.line, height: 16, width: "40%" },
    { type: ShimmerElementType.gap, width: "10%" },
    { type: ShimmerElementType.line, height: 16, width: "40%" },
  ];

  return (
    <>
      <div className="card mb-3 border-0" style={{ borderRadius: "0" }}>
        <div className="card-body">
          {loading ? (
            <ThemeProvider className={wrapperClass}>
              <Shimmer shimmerElements={shimmerWithElementSecondRow} />
              <hr />
              <Shimmer shimmerElements={shimmerWithElementSecondRow} />
            </ThemeProvider>
          ) : (
            <>
              {(props.related_module == 'Task') || (RecordList !== undefined && RecordList.length > 0) ? (
                <> {CreateRelatedTabTable()} </>
              ) : (
                <>
                  <div className="row">
                    <div className="col-12">
                      <a
                        href="#"
                        onClick={() => {
                          // eslint-disable-next-line react/prop-types
                          props.onCancelClick();
                        }}
                        style={{ textDecoration: "none" }}
                      >
                        <MdArrowBackIosNew style={{ verticalAlign: "middle" }} />
                        &nbsp;Back
                      </a>
                    </div>
                  </div>
                  <hr style={{ margin: "0.5rem 0" }} />
                  <div className="text-center">No Record Found</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RenderRelatedTabInfo;
