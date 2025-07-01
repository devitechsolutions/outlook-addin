import React from "react";

const WorkOrderTableList = (props) => {
  // eslint-disable-next-line react/prop-types
  const InvoiceData = props.data;

  return (
    <>
      <table className="table-hover" size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Work Order No.</th>
            <th>Subject</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(InvoiceData).map(([keys, fields]) => {
            let total = parseFloat(fields.hdnGrandTotal);
            return (
              <tr key={keys}>
                <td> {++keys} </td>
                <td> {fields.salesorder_no} </td>
                <td> {fields.subject} </td>
                <td> {total.toFixed(2)} </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default WorkOrderTableList;
