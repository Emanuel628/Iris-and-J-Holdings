function Appointments() {
  return (
    <main className="admin-content">
      <div className="admin-header">
        <p className="eyebrow">Appointments</p>
        <h1>Appointment requests and scheduled calls.</h1>
        <p>This page will manage buyer consultations, seller strategy calls, general calls, and notary appointments.</p>
      </div>
      <div className="content-grid">
        <article className="content-card"><h3>Buyer Calls</h3><p>Consultations for buyers.</p></article>
        <article className="content-card"><h3>Seller Calls</h3><p>Strategy calls for homeowners.</p></article>
        <article className="content-card"><h3>Notary</h3><p>Mobile notary appointments.</p></article>
      </div>
    </main>
  );
}

export default Appointments;
