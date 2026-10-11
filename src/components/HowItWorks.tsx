export default function HowItWorks() {
  return (
    <section id="how">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">How It Works</div>
          <h2>From request to response, coordinated end to end.</h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num">01</div>
            <h3>Request Help</h3>
            <p>Start an emergency request and share your location.</p>
          </div>
          <div className="step">
            <div className="num">02</div>
            <h3>Smart Coordination</h3>
            <p>AidFlow identifies available emergency resources and suitable hospitals.</p>
          </div>
          <div className="step">
            <div className="num">03</div>
            <h3>Track Response</h3>
            <p>Follow the ambulance response and estimated arrival through the system.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
