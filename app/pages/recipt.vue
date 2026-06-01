<template>
  <div class="page">
    <!-- ACTION -->
    <div class="toolbar">
      <button class="print-btn" @click="print">
        Generate PDF
      </button>
    </div>

    <!-- A4 RECEIPT -->
    <div id="receipt" class="receipt-a4">
      <!-- TOP HEADER -->
      <div class="top-header">
        <div class="logo-box">
          <div class="logo">S</div>
        </div>

        <div class="school-info">
          <h1>SKULTEM SCHOOL</h1>
          <p>Official School Fees Receipt</p>
          <small>Freetown, Sierra Leone • +232 000 000 • skultem.edu</small>
        </div>
      </div>

      <!-- RECEIPT INFO -->
      <div class="receipt-meta">
        <div class="meta-card">
          <span>Receipt No</span>
          <strong>SKT-2026-001</strong>
        </div>

        <div class="meta-card">
          <span>Date</span>
          <strong>25 May 2026</strong>
        </div>

        <div class="meta-card">
          <span>Status</span>
          <strong class="paid">PAID</strong>
        </div>
      </div>

      <!-- STUDENT INFO -->
      <div class="section">
        <div class="section-title">Student Information</div>

        <div class="info-grid">
          <div class="info-item">
            <label>Student Name</label>
            <p>John Doe</p>
          </div>

          <div class="info-item">
            <label>Admission No</label>
            <p>STD-1002</p>
          </div>

          <div class="info-item">
            <label>Class</label>
            <p>JSS 2A</p>
          </div>

          <div class="info-item">
            <label>Academic Term</label>
            <p>Second Term</p>
          </div>

          <div class="info-item">
            <label>Session</label>
            <p>2025/2026</p>
          </div>

          <div class="info-item">
            <label>Payment Method</label>
            <p>Cash</p>
          </div>
        </div>
      </div>

      <!-- PAYMENT TABLE -->
      <div class="section">
        <div class="section-title">Payment Breakdown</div>

        <table class="payment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Amount (SLE)</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Tuition Fee</td>
              <td>1,500</td>
            </tr>

            <tr>
              <td>2</td>
              <td>PTA Fee</td>
              <td>200</td>
            </tr>

            <tr>
              <td>3</td>
              <td>Examination Fee</td>
              <td>150</td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <th colspan="2">TOTAL PAID</th>
              <th>1,850 SLE</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- SUMMARY -->
      <div class="summary-row">
        <div class="summary-card">
          <span>Total Paid</span>
          <h2>1,850 SLE</h2>
        </div>

        <div class="summary-card">
          <span>Balance</span>
          <h2>0 SLE</h2>
        </div>
      </div>

      <!-- SIGNATURE -->
      <div class="signature-section">
        <div class="signature-box">
          <div class="line"></div>
          <p>Bursar Signature</p>
        </div>

        <div class="signature-box">
          <div class="line"></div>
          <p>Principal Signature</p>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>This is an official computer-generated receipt from SKULTEM SCHOOL.</p>
        <small>Powered by Skultem School Management System</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $generatePdf } = useNuxtApp();

const print = async () => {
  await $generatePdf("#receipt");
};
</script>

<style scoped>
.page {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 40px 0;
}

/* TOOLBAR */
.toolbar {
  width: 794px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: flex-end;
}

.print-btn {
  background: #111827;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* RECEIPT */
#receipt {
  width: 794px;
  min-height: 1123px;
  margin: auto;
  background: #ffffff;
  overflow: hidden;
  box-sizing: border-box;
  padding: 60px;
  color: #111827;
  font-family: Arial, sans-serif;
}

.receipt-a4 {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
}

/* HEADER */
.top-header {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 20px;
}

.logo-box {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo {
  color: white;
  font-size: 30px;
  font-weight: bold;
}

.school-info h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
}

.school-info p {
  margin: 6px 0;
  font-size: 16px;
  font-weight: 600;
}

.school-info small {
  color: #6b7280;
  font-size: 13px;
}

/* META */
.receipt-meta {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.meta-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  background: #f9fafb;
}

.meta-card span {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.meta-card strong {
  font-size: 15px;
}

.paid {
  color: #059669;
}

/* SECTION */
.section {
  margin-top: 35px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.info-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.info-item p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

/* TABLE */
.payment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.payment-table thead {
  background: #111827;
  color: white;
}

.payment-table th,
.payment-table td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.payment-table tfoot th {
  background: #f3f4f6;
  font-size: 15px;
}

/* SUMMARY */
.summary-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 35px;
}

.summary-card {
  border-radius: 16px;
  padding: 22px;
  background: #111827;
  color: white;
}

.summary-card span {
  font-size: 13px;
  opacity: 0.8;
}

.summary-card h2 {
  margin: 10px 0 0;
  font-size: 28px;
}

/* SIGNATURE */
.signature-section {
  margin-top: 70px;
  display: flex;
  justify-content: space-between;
}

.signature-box {
  width: 240px;
  text-align: center;
}

.signature-box .line {
  border-top: 1px solid #111827;
  margin-bottom: 8px;
}

.signature-box p {
  margin: 0;
  font-size: 13px;
}

/* FOOTER */
.footer {
  margin-top: 60px;
  text-align: center;
  color: #6b7280;
  font-size: 13px;
}

/* PRINT */
@media print {
  body {
    background: white !important;
  }

  .page {
    padding: 0;
    background: white;
  }

  .toolbar {
    display: none;
  }

  #receipt {
    width: 794px;
    min-height: 1123px;
    margin: 0 auto;
    box-shadow: none;
    page-break-after: avoid;
  }
}
</style>