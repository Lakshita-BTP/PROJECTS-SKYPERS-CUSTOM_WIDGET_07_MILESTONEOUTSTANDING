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

      this.renderBase();
    }

    connectedCallback() {
      this.render();
    }

    set myDataBinding(dataBinding) {
      console.log("Milestone Data Binding");
      console.log(dataBinding);

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

    formatValue(value) {

      value = Number(value || 0);

      return (
        "₹" +
        value.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }) +
        " Cr"
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
        overflow:auto;
        padding:10px;
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

      const header =
        this.shadowRoot.getElementById("header");

      const content =
        this.shadowRoot.getElementById("content");

      const card =
        this.shadowRoot.querySelector(".card");

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

        const measureKeys =
          this._myDataBinding.metadata.feeds.measures.values;

        const rows =
          this._myDataBinding.data;

        if (!rows || rows.length === 0) {

          content.innerHTML =
            `<div class="empty">No Data Found</div>`;

          return;
        }

        const data = rows.map(row => ({

          milestone:
            row[dimensionKey].label,

          invoiced:
            Number(row[measureKeys[0]]?.raw || 0),

          outstanding:
            Number(row[measureKeys[1]]?.raw || 0)

        })).sort((a, b) => b.outstanding - a.outstanding);

        const maxOutstanding =
          Math.max(
            ...data.map(x => x.outstanding),
            1
          );

        const totalInvoiced =
          data.reduce(
            (sum, row) => sum + row.invoiced,
            0
          );

        const totalOutstanding =
          data.reduce(
            (sum, row) => sum + row.outstanding,
            0
          );

        let html = `

        <div class="table-header">
          <div>Milestone</div>
          <div>Invoiced</div>
          <div>Outstanding</div>
          <div></div>
        </div>

        `;

        data.forEach(item => {

          const width =
            (item.outstanding / maxOutstanding) * 100;

          html += `

          <div class="row">

            <div class="milestone">
              ${item.milestone}
            </div>

            <div class="invoiced">
              ${this.formatValue(item.invoiced)}
            </div>

            <div class="outstanding">
              ${this.formatValue(item.outstanding)}
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

        html += `

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

        `;

        content.innerHTML = html;

      }
      catch (e) {

        console.error(e);

        content.innerHTML = `
        <div class="empty">
          Error: ${e.message}
        </div>
        `;
      }
    }
  }

  customElements.define(
    "com-max-milestoneoutstanding",
    MilestoneOutstanding
  );

})();