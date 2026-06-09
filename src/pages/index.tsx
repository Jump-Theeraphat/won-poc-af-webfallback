import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>AppsFlyer OneLink Fallback POC</title>
        <meta
          name="description"
          content="POC web fallback page for AppsFlyer OneLink Smart Script."
        />
      </Head>

      <main className="page">
        <section className="card">
          <p className="eyebrow">AppsFlyer POC</p>
          <h1>OneLink Web Fallback</h1>
          <p className="description">
            Test page for desktop fallback, generated OneLink, copy link, and QR
            code flow.
          </p>

          <Link className="button" href="/onelink-fallback">
            Open fallback page
          </Link>
        </section>
      </main>

      <style jsx>{`
        .page {
          display: grid;
          min-height: 100vh;
          place-items: center;
          padding: 24px;
        }

        .card {
          width: min(720px, 100%);
          padding: 40px;
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 20px 60px rgba(23, 32, 51, 0.08);
        }

        .eyebrow {
          margin: 0 0 12px;
          color: var(--primary);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 6vw, 64px);
          line-height: 1;
        }

        .description {
          margin: 20px 0 32px;
          color: var(--muted);
          font-size: 18px;
          line-height: 1.6;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 20px;
          border-radius: 999px;
          background: var(--primary);
          color: #ffffff;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
