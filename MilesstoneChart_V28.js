(function () {
  class MilestoneOutstanding extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      this._title = "MILESTONE WISE OUTSTANDING";

      this._headerBackground = "#15263A";
      this._cardBackground = "#FFFFFF";

      this._titleColor = "#FFFFFF";

      this._barColor = "#E26A00";

      this._manualTotalInvoiced = null;
      this._manualTotalOutstanding = null;

      this.renderBase();
    }

    connectedCallback() {
      this.render();
    }

    set myDataBinding(dataBinding) {
      this._myDataBinding = dataBinding;
      this.render();
    }

    setTitle(value) {
      this._title = value;
      this.render();
    }

    setHeaderBackground(value) {
      this._headerBackground = value;
      this.render();
    }

    setCardBackground(value) {
      this._cardBackground = value;
      this.render();
    }

    setBarColor(value) {
      this._barColor = value;
      this.render();
    }

    setTotalInvoiced(value) {
      this._manualTotalInvoiced = Number(value);
      this.render();
    }

    setTotalOutstanding(value) {
      this._manualTotalOutstanding = Number(value);
      this.render();
    }

    formatValue(value) {
      value = Number(value || 0);

      return "₹" + Math.round(value).toLocaleString("en-IN") + " Cr";
    }

    formatRowValue(value) {
      value = Number(value || 0);

      return (
        "₹" +
        value.toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        })
      );
    }

    renderBase() {
      this.shadowRoot.innerHTML = `
      <style>

      *{
        box-sizing:border-box;
        font-family:Arial,sans-serif;
      }

      .outer{
        width:100%;
        height:100%;
        padding:4px;
      }

      .card{
        width:100%;
        height:100%;
        background:#fff;
        border-radius:10px;
        overflow:hidden;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
        display:flex;
        flex-direction:column;
      }

      .header{
        background:#15263A;
        color:white;
        padding:12px 14px;
        font-size:16px;
        font-weight:700;
        letter-spacing:0.5px;
      }

      .content{
          flex:1;
          display:flex;
          flex-direction:column;
          min-height:0;
      }

      .rows-container{
          flex:1;
          overflow-y:auto;
          padding:10px;
      }

      .footer{
          padding:10px;
          border-top:1px solid #E5E7EB;
          background:#FFFFFF;
      }

      .table-header{
        display:grid;
        grid-template-columns:
          1.8fr
          1fr
          1fr
          80px;
        gap:8px;

        padding:10px 8px;

        background:#F4F5F7;

        border-radius:6px;

        font-size:11px;
        font-weight:700;
        color:#8A94A6;
        text-transform:uppercase;
      }

      .row{
        display:grid;
        grid-template-columns:
          1.8fr
          1fr
          1fr
          80px;

        gap:8px;

        padding:10px 8px;

        align-items:center;

        border-bottom:1px solid #ECECEC;
      }

      .milestone{
        font-size:13px;
        font-weight:600;
        color:#1F2937;
      }

      .invoiced{
        font-size:13px;
        font-weight:700;
        color:#111827;
      }

      .outstanding{
        font-size:13px;
        font-weight:700;
        color:#F97316;
      }

      .progress-bg{
        width:100%;
        height:8px;
        background:#E5E7EB;
        border-radius:999px;
        overflow:hidden;
      }

      .progress-fill{
        height:100%;
        background:#E26A00;
        border-radius:999px;
      }

      .total-box{
        margin-top:12px;

        background:#F8F8F8;

        border-radius:8px;

        display:flex;
        justify-content:space-between;
        align-items:center;

        padding:12px;
      }

      .total-label{
        color:#8A94A6;
        font-size:11px;
        font-weight:700;
        text-transform:uppercase;
      }

      .total-value{
        color:#111827;
        font-size:18px;
        font-weight:700;
      }

      .total-outstanding{
        color:#F97316;
      }

      .empty{
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#667085;
      }

      </style>

      <div class="outer">

        <div class="card">

          <div id="header" class="header">
            ${this._title}
          </div>

          <div id="content" class="content">

            <div class="empty">
              Waiting For Data Binding...
            </div>

          </div>

        </div>

      </div>
      `;
    }

    render() {
      const header = this.shadowRoot.getElementById("header");

      const content = this.shadowRoot.getElementById("content");

      const card = this.shadowRoot.querySelector(".card");

      if (header) {
        header.innerHTML = this._title;
        header.style.background = this._headerBackground;
        header.style.color = this._titleColor;
      }

      if (card) {
        card.style.background = this._cardBackground;
      }

      if (!this._myDataBinding) {
        content.innerHTML = `
        <div class="empty">
          No Data Binding Assigned
        </div>
        `;

        return;
      }

      if (this._myDataBinding.state !== "success") {
        content.innerHTML = `
        <div class="empty">
          Loading Data...
        </div>
        `;

        return;
      }

      try {
        const dimensionKey =
          this._myDataBinding.metadata.feeds.dimensions.values[0];

        const measureKeys = this._myDataBinding.metadata.feeds.measures.values;

        const rows = this._myDataBinding.data;

        if (!rows || rows.length === 0) {
          content.innerHTML = `<div class="empty">No Data Found</div>`;

          return;
        }

        const data = rows
          .map((row) => ({
            milestone: row[dimensionKey].label,

            invoiced: Number(row[measureKeys[0]]?.raw || 0),

            outstanding: Number(row[measureKeys[1]]?.raw || 0),
          }))
          .sort((a, b) => b.outstanding - a.outstanding);

        const maxOutstanding = Math.max(...data.map((x) => x.outstanding), 1);

        const calculatedTotalInvoiced = data.reduce(
          (sum, row) => sum + row.invoiced,
          0,
        );

        const calculatedTotalOutstanding = data.reduce(
          (sum, row) => sum + row.outstanding,
          0,
        );

        const totalInvoiced =
          this._manualTotalInvoiced !== null
            ? this._manualTotalInvoiced
            : calculatedTotalInvoiced;

        const totalOutstanding =
          this._manualTotalOutstanding !== null
            ? this._manualTotalOutstanding
            : calculatedTotalOutstanding;

        let rowsHtml = `

        <div class="table-header">
          <div>Milestone</div>
          <div>Invoiced</div>
          <div>Outstanding</div>
          <div></div>
        </div>

        `;

        data.forEach((item) => {
          const width = (item.outstanding / maxOutstanding) * 100;

          rowsHtml += `

          <div class="row">

            <div class="milestone">
              ${item.milestone}
            </div>

            <div class="invoiced">
              ${this.formatRowValue(item.invoiced)}
            </div>

            <div class="outstanding">
              ${this.formatRowValue(item.outstanding)}
            </div>

            <div class="progress-bg">

              <div
                class="progress-fill"
                style="
                  width:${width}%;
                  background:${this._barColor};
                ">
              </div>

            </div>

          </div>

          `;
        });

        content.innerHTML = `

          <div class="rows-container">

            ${rowsHtml}

          </div>

          <div class="footer">

            <div class="total-box">

              <div class="total-label">
                TOTAL INVOICED
              </div>

              <div class="total-value">
                ${this.formatValue(totalInvoiced)}
              </div>

            </div>

            <div class="total-box">

              <div class="total-label">
                TOTAL OUTSTANDING
              </div>

              <div class="total-value total-outstanding">
                ${this.formatValue(totalOutstanding)}
              </div>

            </div>

          </div>

          `;
      } catch (e) {
        content.innerHTML = `
        <div class="empty">
          Error: ${e.message}
        </div>
        `;
      }
    }

    /* =========================
      PDF EXPORT
    ========================= */

    async serializeCustomWidgetToImage() {
      const canvas = document.createElement("canvas");

      const width = this.shadowRoot.host.clientWidth || this.clientWidth || 900;

      if (
        !this._myDataBinding ||
        this._myDataBinding.state !== "success" ||
        !this._myDataBinding.data ||
        this._myDataBinding.data.length === 0
      ) {
        canvas.width = width;
        canvas.height = 400;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, 400);

        ctx.fillStyle = "#667085";
        ctx.font = "16px Arial";
        ctx.fillText("No Data Available", 30, 80);

        return canvas.toDataURL("image/png");
      }

      const dimensionKey =
        this._myDataBinding.metadata.feeds.dimensions.values[0];

      const measureKeys = this._myDataBinding.metadata.feeds.measures.values;

      const rows = this._myDataBinding.data;

      const data = rows
        .map((row) => ({
          milestone: row[dimensionKey].label,
          invoiced: Number(row[measureKeys[0]]?.raw || 0),
          outstanding: Number(row[measureKeys[1]]?.raw || 0),
        }))
        .sort((a, b) => b.outstanding - a.outstanding);

      const maxOutstanding = Math.max(...data.map((x) => x.outstanding), 1);

      const calculatedTotalInvoiced = data.reduce(
        (sum, row) => sum + row.invoiced,
        0,
      );

      const calculatedTotalOutstanding = data.reduce(
        (sum, row) => sum + row.outstanding,
        0,
      );

      const totalInvoiced =
        this._manualTotalInvoiced !== null
          ? this._manualTotalInvoiced
          : calculatedTotalInvoiced;

      const totalOutstanding =
        this._manualTotalOutstanding !== null
          ? this._manualTotalOutstanding
          : calculatedTotalOutstanding;

      const headerHeight = 50;
      const tableHeaderHeight = 40;
      const rowHeight = 44;   //--------------------------------------------------------------------------------Only for Controlling Row Height

      const canvasHeight = Math.max(
        this.shadowRoot.host.clientHeight || this.clientHeight || 300,
        300,
      );

      const footerReservedHeight = 190;
      const footerY = canvasHeight - 122;

      canvas.width = width;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext("2d");

      /* -------------------------
        BACKGROUND
      ------------------------- */

      ctx.fillStyle = "#f4f1eb";
      ctx.fillRect(0, 0, width, canvasHeight);

      ctx.shadowColor = "rgba(0,0,0,0.10)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = this._cardBackground;

      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, canvasHeight - 10, 10);
      ctx.fill();

      ctx.shadowColor = "transparent";

      /* -------------------------
        HEADER
      ------------------------- */

      ctx.save();

      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, canvasHeight - 10, 10);
      ctx.clip();

      ctx.fillStyle = this._headerBackground;
      ctx.fillRect(5, 5, width - 10, headerHeight);

      ctx.restore();

      ctx.fillStyle = this._titleColor;
      ctx.font = "bold 15px Arial";
      ctx.fillText(this._title, 20, 35);

      /* -------------------------
        TABLE HEADER
      ------------------------- */

      let y = headerHeight + 15;

      const availableRowsHeight =
        canvasHeight -
        headerHeight -
        tableHeaderHeight -
        footerReservedHeight ;

      const visibleRows = Math.max(
        1,
        Math.ceil(availableRowsHeight / rowHeight),
      );

      ctx.fillStyle = "#F4F5F7";

      ctx.beginPath();
      ctx.roundRect(15, y, width - 30, tableHeaderHeight, 6);
      ctx.fill();

      ctx.fillStyle = "#8A94A6";
      ctx.font = "bold 11px Arial";

      ctx.fillText("MILESTONE", 25, y + 25);
      ctx.fillText("INVOICED", width * 0.4, y + 25);
      ctx.fillText("OUTSTANDING", width * 0.63, y + 25);

      y += tableHeaderHeight + 5;

      /* -------------------------
        ROWS
      ------------------------- */

      data.slice(0, visibleRows).forEach((item) => {
        const percent = (item.outstanding / maxOutstanding) * 100;

        ctx.strokeStyle = "#ECECEC";

        ctx.beginPath();
        ctx.moveTo(15, y + rowHeight - 4);
        ctx.lineTo(width - 15, y + rowHeight - 4);
        ctx.stroke();

        ctx.fillStyle = "#1F2937";
        ctx.font = "bold 13px Arial";

        let milestoneText = item.milestone;

        const maxTextWidth = width * 0.28;

        while (
          ctx.measureText(milestoneText).width > maxTextWidth &&
          milestoneText.length > 0
        ) {
          milestoneText = milestoneText.slice(0, -1);
        }

        if (milestoneText !== item.milestone) {
          milestoneText += "...";
        }

        ctx.fillText(milestoneText, 25, y + 24);

        ctx.fillStyle = "#111827";
        ctx.font = "bold 13px Arial";

        ctx.fillText(this.formatRowValue(item.invoiced), width * 0.4, y + 24);

        ctx.fillStyle = "#F97316";

        ctx.fillText(
          this.formatRowValue(item.outstanding),
          width * 0.63,
          y + 24,
        );

        const barX = width - 85;

        ctx.fillStyle = "#E5E7EB";

        ctx.beginPath();
        ctx.roundRect(barX, y + 16, 60, 8, 4);
        ctx.fill();

        ctx.fillStyle = this._barColor;

        ctx.beginPath();
        ctx.roundRect(barX, y + 16, (60 * percent) / 100, 8, 4);
        ctx.fill();

        y += rowHeight;
      });

      /* -------------------------
        SCROLLBAR
      ------------------------- */

      if (data.length > visibleRows) {
        const trackHeight = availableRowsHeight - 20;

        const trackY = headerHeight + tableHeaderHeight + 30;

        const trackX = width - 6;

        ctx.fillStyle = "#E5E7EB";

        ctx.beginPath();
        ctx.roundRect(trackX, trackY, 4, trackHeight, 2);
        ctx.fill();

        const thumbHeight = Math.max(
          30,
          (visibleRows / data.length) * trackHeight,
        );

        ctx.fillStyle = "#A0AEC0";

        ctx.beginPath();
        ctx.roundRect(trackX, trackY, 4, thumbHeight, 2);
        ctx.fill();
      }

      /* -------------------------
        FOOTER FIXED AT BOTTOM
      ------------------------- */

      const drawTotalBox = (yPos, label, value, valueColor) => {
        ctx.fillStyle = "#F8F8F8";

        ctx.beginPath();
        ctx.roundRect(15, yPos, width - 30, 48, 8);
        ctx.fill();

        ctx.fillStyle = "#8A94A6";
        ctx.font = "bold 11px Arial";

        ctx.fillText(label, 30, yPos + 28);

        ctx.textAlign = "right";

        ctx.fillStyle = valueColor;
        ctx.font = "bold 18px Arial";

        ctx.fillText(this.formatValue(value), width - 30, yPos + 30);

        ctx.textAlign = "left";
      };

      drawTotalBox(footerY, "TOTAL INVOICED", totalInvoiced, "#111827");

      drawTotalBox(
        footerY + 55,
        "TOTAL OUTSTANDING",
        totalOutstanding,
        "#F97316",
      );

      ctx.restore();

      return canvas.toDataURL("image/png");
    }

    async getExportData() {
      return this.serializeCustomWidgetToImage();
    }
  }

  customElements.define("com-max-milestoneoutstanding", MilestoneOutstanding);
})();
