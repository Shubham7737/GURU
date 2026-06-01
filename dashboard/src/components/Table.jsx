import React from 'react';
import '../css/Table.css';

const Table = ({ columns, data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="skeleton-table">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton-row">
              {columns.map((_, colIndex) => (
                <div key={colIndex} className="skeleton-cell"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No data found</h3>
        <p>There are no items to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;