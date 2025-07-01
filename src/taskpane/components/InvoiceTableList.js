import React from "react";

const InvoiceTableList = (props) => {
  // eslint-disable-next-line react/prop-types
  const InvoiceData = props.data;

  return (
    <>
      <table className="table table-striped" size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Invoice No</th>
            <th>Total</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(InvoiceData).map(([keys, fields]) => {
            let balance = parseFloat(fields.balance);
            let total = parseFloat(fields.hdnGrandTotal);
            return (
              <tr key={keys}>
                <td> {++keys} </td>
                <td> {fields.invoice_no} </td>
                <td> {total.toFixed(2)} </td>
                <td> {balance.toFixed(2)} </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default InvoiceTableList;
