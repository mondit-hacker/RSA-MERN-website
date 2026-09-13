import { Helmet } from 'react-helmet-async';

/**
 * SEO — Dynamic per-page meta tags, Open Graph, Twitter Card, JSON-LD schema.
 * Usage: <SEO title="Page Title" description="..." />
 */
export default function SEO({
  title       = 'Rise & Shine Academy',
  description = 'Rise & Shine Academy — Empowering students in Malda, WB with modern curriculum, experienced educators, and holistic development. Admissions open 2026–27.',
  keywords    = 'Rise Shine Academy, school Malda, best school West Bengal, eKidz, eChamps, eTechno, in Malda',
  canonical   = 'https://www.riseandshineacademy.in',
  ogImage     = 'https://www.riseandshineacademy.in/assets/logo.png',
}) {
  // Never show raw "Rise & Shine Academy" alone — suffix every inner-page title
  const fullTitle =
    title === 'Rise & Shine Academy'
      ? 'Rise & Shine Academy — Best School in Malda, WB'
      : `${title} | Rise & Shine Academy`;

  return (
    <Helmet>
      {/* ── Charset & viewport (also in index.html, but belt+suspenders) ── */}
      <html lang="en" />
      <meta charSet="UTF-8" />

      {/* ── Primary SEO ── */}
      <title>{fullTitle}</title>
      <meta name="description"  content={description} />
      <meta name="keywords"     content={keywords} />
      <meta name="author"       content="Rise & Shine Academy" />
      <meta name="robots"       content="index, follow" />
      <meta name="theme-color"  content="#0B1F3A" />
      <link rel="canonical"     href={canonical} />

      {/* ── Open Graph ── */}
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:site_name"   content="Rise & Shine Academy" />
      <meta property="og:locale"      content="en_IN" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* ── JSON-LD Schema.org School ── */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'School',
          name: 'Rise & Shine Academy',
          url: 'https://www.riseandshineacademy.in',
          logo: ogImage,
          description,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Station Road',
            addressLocality: 'Harish Chandra Pur',
            addressRegion: 'West Bengal',
            postalCode: '732125',
            addressCountry: 'IN',
          },
          telephone: '+91XXXXXXXXXX',
          sameAs: [],
        })}
      </script>
    </Helmet>
  );
}
