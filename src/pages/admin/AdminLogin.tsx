function AdminLogin() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Admin</p>
          <h1>Private login for site management.</h1>
          <p>
            This page will become the secure entry point for Daiana to manage leads, appointments, media,
            and website settings.
          </p>
        </div>
        <form className="info-panel form-shell">
          <div className="input-group"><label>Email</label><input /></div>
          <div className="input-group"><label>Password</label><input type="password" /></div>
          <button className="button button-primary" type="button">Log In</button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
