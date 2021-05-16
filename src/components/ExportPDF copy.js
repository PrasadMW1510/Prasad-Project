import React from 'react';
import { Button } from '@nokia-csf-uxr/csfWidgets';
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

const reportTickets = [{"id":1,"title":"a","request":"b","status":"open"},
{"id":2,"title":"dddd","request":"c","status":"Close"}];

const generatePDF = tickets => {

  const doc = new jsPDF();
  const tableColumn = ["Id", "Title", "Issue", "Status"];
  const tableRows = [];

  tickets.forEach(ticket => {
    const ticketData = [
      ticket.id,
      ticket.title,
      ticket.request,
      ticket.status
    ];
    tableRows.push(ticketData);
  });

  doc.autoTable(tableColumn, tableRows, { startY: 20 });
  const date = Date().split(" ");

  const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];

  doc.text("FNI Application Status", 14, 15);
  doc.save(`report_${dateStr}.pdf`);
};

class ExportPDF extends React.Component {

    constructor(props) {
        super(props);
  //      this.download = this.download.bind(this);
        this.state = {

        }
    }

   render() {
        return <div>
                <Button id="ExportPDF" text="Export to PDF" onClick={() => generatePDF(reportTickets)}>
                    Download
                    </Button>
              </div>
    }
}

export default ExportPDF;