import SEO from '../components/SEO';
import EnquiryForm from '../components/EnquiryForm';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './CampusMap.css';

/**
 * Google Maps embed URLs for Harish Chandra Pur & Kashim Pur, Malda, WB.
 * Using q= parameter (search query embeds) — these always work without API key.
 * The pb= parameter embed searches for the location by name.
 */
const CAMPUSES = [
  {
    id:    'hcpur',
    name:  'Harish Chandra Pur Campus',
    address: 'Station Road, Harish Chandra Pur, Malda, West Bengal — 732125',
    phone: '+91 90621 41212',
    tag:   'Main Campus',
    color: '#512da8',
    lat:   24.9892,
    lng:   87.9356,
    // Working embed: searches for the locality on Google Maps
    mapSrc: 'https://maps.google.com/maps?q=Harishchandrapur,+Malda,+West+Bengal+732125&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Harishchandrapur,Malda,West+Bengal+732125',
    mapsUrl: 'https://www.google.com/maps/search/Harishchandrapur+Malda+West+Bengal+732125',
    features: [
      'Modern classrooms & science labs',
      'Library & reading room',
      'Sports ground & play area',
      'Safe, gated campus',
      'CCTV surveillance 24×7',
    ],
    img: '/assets/H.Cpur.png',
  },
  {
    id:    'kashimpur',
    name:  'Kashim Pur Campus',
    address: 'Near NH-12 (Old NH-31), Kashim Pur, Malda, West Bengal — 732125',
    phone: '+91 90621 41212',
    tag:   'Branch Campus',
    color: '#0B1F3A',
    lat:   24.9950,
    lng:   87.9420,
    // Working embed: searches for Kashimpur near Harishchandrapur
    mapSrc: 'https://maps.google.com/maps?q=Kashimpur,+Harishchandrapur,+Malda,+West+Bengal&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Kashimpur,Harishchandrapur,Malda,West+Bengal',
    mapsUrl: 'https://www.google.com/maps/search/Kashimpur+Harishchandrapur+Malda+West+Bengal',
    features: [
      'Spacious, well-lit classrooms',
      'Computer lab with internet',
      'Activity & assembly hall',
      'Safe transport pickup hub',
      'Parent waiting area',
    ],
    img: '/assets/KashimPur.png',
  },
];

export default function CampusMap() {
  useScrollReveal();

  return (
    <>
      <SEO
        title="Our Campuses"
        description="Visit Rise & Shine Academy at our two campuses in Malda, West Bengal — Harish Chandra Pur (Pin 732125) and Kashim Pur, near NH-12."
        keywords="Rise Shine Academy campus Malda, Harishchandrapur school, Kashimpur school Malda West Bengal"
      />

      {/* Hero */}
      <div className="campus-page-hero">
        <div className="campus-page-hero-inner">
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>Our Locations</div>
          <h1>Find a Campus <span>Near You</span></h1>
          <p>Two thriving campuses in Malda, West Bengal — each equipped with modern facilities and a safe, inspiring learning environment.</p>
        </div>
      </div>

      {/* Individual campus sections */}
      {CAMPUSES.map((campus, idx) => (
        <section key={campus.id} className={`campus-block ${idx % 2 === 1 ? 'campus-block-alt' : ''}`}>
          <div className="campus-block-inner">

            {/* Info */}
            <div className="campus-info-side reveal-left">
              <span className="campus-badge" style={{ background: campus.color }}>{campus.tag}</span>
              <h2>{campus.name}</h2>

              <div className="campus-detail-row">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                <span>{campus.address}</span>
              </div>
              <div className="campus-detail-row">
                <i className="fa-solid fa-phone" aria-hidden="true" />
                <span>{campus.phone}</span>
              </div>
              <div className="campus-coords">
                <i className="fa-solid fa-map-pin" aria-hidden="true" />
                <span>{campus.lat}° N, {campus.lng}° E</span>
              </div>

              <div className="campus-features">
                <h4>Campus Facilities</h4>
                <ul>
                  {campus.features.map((f, i) => (
                    <li key={i}><i className="fa-solid fa-circle-check" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
              </div>

              <div className="campus-actions">
                <a href={campus.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-campus-primary">
                  <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" />Get Directions
                </a>
                <a href={campus.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-campus-outline">
                  <i className="fa-brands fa-google" aria-hidden="true" />Open in Google Maps
                </a>
              </div>
            </div>

            {/* Map & Photo */}
            <div className="campus-map-side reveal-right">
              {campus.img && (
                <div className="campus-photo-wrap">
                  <img src={campus.img} alt={campus.name} loading="lazy" />
                </div>
              )}
              <div className="campus-map-wrap">
                <div className="map-label">
                  <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                  Live Map — {campus.name}
                </div>
                <div className="map-frame-wrap">
                  <iframe
                    title={`Map of ${campus.name}`}
                    src={campus.mapSrc}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="map-open-link">
                  <a href={campus.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fa-solid fa-up-right-from-square" aria-hidden="true" />Open full map
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>
      ))}

      {/* Combined map */}
      <section className="both-campuses-section">
        <div className="both-campuses-inner">
          <div className="reveal">
            <div className="eyebrow">Overview</div>
            <h2 className="section-title">Both Campuses on One Map</h2>
            <p className="section-sub">Harish Chandra Pur and Kashim Pur campuses are located close to each other in Malda district, West Bengal.</p>
          </div>
          <div className="combined-map-wrap reveal">
            <iframe
              title="Both RSA Campuses — Malda, West Bengal"
              src="https://maps.google.com/maps?q=Harishchandrapur,Malda,West+Bengal&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="campus-pins-row reveal">
            {CAMPUSES.map(c => (
              <div className="campus-pin-card" key={c.id}>
                <div className="pin-dot" style={{ background: c.color }}>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                </div>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.address}</span>
                  <a href={c.directionsUrl || c.mapsUrl} target="_blank" rel="noopener noreferrer">
                    Get directions <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnquiryForm />
    </>
  );
}
