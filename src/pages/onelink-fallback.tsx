import Head from "next/head";
import Script from "next/script";
import { useCallback, useMemo, useState } from "react";

type AppsFlyerSmartScriptResult = {
  clickURL: string;
};

type AppsFlyerSmartScript = {
  generateOneLinkURL: (config: {
    oneLinkURL: string;
    afParameters: Record<string, unknown>;
  }) => AppsFlyerSmartScriptResult | null;
  displayQrCode?: (
    elementId: string,
    options?: { codeColor?: string; logo?: string },
  ) => unknown;
};

declare global {
  interface Window {
    AF_SMART_SCRIPT?: AppsFlyerSmartScript;
  }
}

const SMART_SCRIPT_SRC =
  "https://onelinksmartscript.appsflyersdk.com/onelink-smart-script-latest.js";

const ONE_LINK_TEMPLATE_URL = "https://ktc-mobile-uat.onelink.me/egql";
const TEST_ONE_LINK_URL = "https://ktc-mobile-uat.onelink.me/egql/n3tzlto9";
const QR_CONTAINER_ID = "generated-onelink-qr";

const afParameters = {
  mediaSource: { defaultValue: "default%20pid%20001" },
  afCustom: [
    {
      paramKey: "source_code",
      keys: ["source_code"],
      defaultValue: "default%20source%20code%20001",
    },
    {
      paramKey: "agent_code",
      keys: ["agent_code"],
      defaultValue: "default%20agent%20code%20001",
    },
    {
      paramKey: "branch_code",
      keys: ["branch_code"],
      defaultValue: "default%20branch%20code%20001",
    },
    {
      paramKey: "af_ss_ui",
      defaultValue: "true",
    },
  ],
};

function getIncomingParams() {
  if (typeof window === "undefined") {
    return {};
  }

  return Object.fromEntries(new URLSearchParams(window.location.search));
}

function getGeneratedParams(generatedUrl: string) {
  try {
    return Object.fromEntries(new URL(generatedUrl).searchParams);
  } catch {
    return {};
  }
}

export default function OneLinkFallbackPage() {
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [scriptStatus, setScriptStatus] = useState<
    "loading" | "ready" | "error" | "empty"
  >("loading");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [incomingParams, setIncomingParams] = useState<Record<string, string>>(
    {},
  );
  const [generatedParams, setGeneratedParams] = useState<
    Record<string, string>
  >({});

  const canCopy = Boolean(generatedUrl);

  const generateLink = useCallback(() => {
    setIncomingParams(getIncomingParams());

    const result = window.AF_SMART_SCRIPT?.generateOneLinkURL({
      oneLinkURL: ONE_LINK_TEMPLATE_URL,
      afParameters,
    });

    if (!result?.clickURL) {
      setGeneratedUrl("");
      setGeneratedParams({});
      setScriptStatus("empty");
      return;
    }

    setGeneratedUrl(result.clickURL);
    setGeneratedParams(getGeneratedParams(result.clickURL));
    setScriptStatus("ready");

    const qrElement = document.getElementById(QR_CONTAINER_ID);
    if (qrElement) {
      qrElement.innerHTML = "";
      window.AF_SMART_SCRIPT?.displayQrCode?.(QR_CONTAINER_ID, {
        codeColor: "#172033",
      });
    }
  }, []);

  const copyGeneratedLink = useCallback(async () => {
    if (!generatedUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    window.setTimeout(() => setCopyStatus("idle"), 1800);
  }, [generatedUrl]);

  const statusLabel = useMemo(() => {
    if (scriptStatus === "ready") return "Generated";
    if (scriptStatus === "empty") return "No output from Smart Script";
    if (scriptStatus === "error") return "Smart Script failed to load";
    return "Loading Smart Script";
  }, [scriptStatus]);

  return (
    <>
      <Head>
        <title>OneLink Fallback POC</title>
        <meta
          name="description"
          content="Desktop fallback page for AppsFlyer OneLink Smart Script POC."
        />
      </Head>

      <Script
        src={SMART_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={generateLink}
        onError={() => setScriptStatus("error")}
      />

      <main className="page">
        <section className="hero">
          <p className="eyebrow">AppsFlyer OneLink POC</p>
          <h1>Continue on your mobile device</h1>
          <p className="description">
            This desktop fallback page generates a mobile OneLink with
            `source_code`, `agent_code`, and `branch_code` custom attributes.
            Copy the generated link or scan the QR code with your phone.
          </p>
        </section>

        <section className="grid">
          <div className="card linkCard">
            <div className="cardHeader">
              <div>
                <p className="label">Generated link</p>
                <h2>{statusLabel}</h2>
              </div>
              <span className={`status ${scriptStatus}`}>{scriptStatus}</span>
            </div>

            <textarea
              aria-label="Generated OneLink URL"
              readOnly
              value={generatedUrl || "Waiting for Smart Script output..."}
            />

            <div className="actions">
              <button disabled={!canCopy} type="button" onClick={copyGeneratedLink}>
                {copyStatus === "copied" ? "Copied" : "Copy link"}
              </button>
              <a
                aria-disabled={!generatedUrl}
                className={!generatedUrl ? "disabled" : ""}
                href={generatedUrl || undefined}
                rel="noreferrer"
                target="_blank"
              >
                Open generated link
              </a>
            </div>

            {copyStatus === "failed" ? (
              <p className="copyError">
                Copy failed. Please select and copy the link manually.
              </p>
            ) : null}
          </div>

          <div className="card qrCard">
            <p className="label">QR code</p>
            <div
              id={QR_CONTAINER_ID}
              className={`qrBox ${generatedUrl ? "hasQr" : "empty"}`}
            />
            <p className="hint">
              Scan this QR with a mobile device that has the app installed to
              validate app redirect and custom attributes.
            </p>
          </div>
        </section>

        <section className="card debugCard">
          <div className="cardHeader">
            <div>
              <p className="label">Debug</p>
              <h2>POC configuration</h2>
            </div>
          </div>

          <dl>
            <div>
              <dt>OneLink template URL</dt>
              <dd>{ONE_LINK_TEMPLATE_URL}</dd>
            </div>
            <div>
              <dt>Test OneLink URL</dt>
              <dd>{TEST_ONE_LINK_URL}</dd>
            </div>
            <div>
              <dt>Incoming query params</dt>
              <dd>
                <pre>{JSON.stringify(incomingParams, null, 2)}</pre>
              </dd>
            </div>
            <div>
              <dt>Generated query params</dt>
              <dd>
                <pre>{JSON.stringify(generatedParams, null, 2)}</pre>
              </dd>
            </div>
          </dl>
        </section>
      </main>

      <style jsx>{`
        .page {
          width: min(1120px, 100%);
          margin: 0 auto;
          padding: 56px 24px;
        }

        .hero {
          max-width: 820px;
          margin-bottom: 28px;
        }

        .eyebrow,
        .label {
          margin: 0 0 10px;
          color: var(--primary);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        h1,
        h2 {
          margin: 0;
          color: var(--foreground);
        }

        h1 {
          font-size: clamp(36px, 7vw, 72px);
          line-height: 0.98;
          letter-spacing: -0.05em;
        }

        h2 {
          font-size: 24px;
          letter-spacing: -0.02em;
        }

        .description {
          margin: 22px 0 0;
          color: var(--muted);
          font-size: 18px;
          line-height: 1.65;
        }

        .grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
          gap: 20px;
        }

        .card {
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 20px 60px rgba(23, 32, 51, 0.08);
        }

        .linkCard,
        .qrCard,
        .debugCard {
          padding: 24px;
        }

        .debugCard {
          margin-top: 20px;
        }

        .cardHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #eef2ff;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .status.ready {
          background: #e8f7ef;
          color: var(--success);
        }

        .status.error,
        .status.empty {
          background: #fff3e0;
          color: var(--warning);
        }

        textarea {
          display: block;
          width: 100%;
          min-height: 144px;
          padding: 16px;
          resize: vertical;
          border: 1px solid var(--border);
          border-radius: 16px;
          color: var(--foreground);
          background: #fbfcff;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
        }

        button,
        .actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: 999px;
          background: var(--primary);
          color: #ffffff;
          cursor: pointer;
          font-weight: 800;
          text-decoration: none;
        }

        button:hover,
        .actions a:hover {
          background: var(--primary-dark);
        }

        button:disabled,
        .actions a.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .actions a {
          background: #172033;
        }

        .copyError {
          margin: 12px 0 0;
          color: var(--danger);
        }

        .qrBox {
          display: grid;
          min-height: 280px;
          place-items: center;
          border: 1px dashed var(--border);
          border-radius: 18px;
          background: #fbfcff;
          color: var(--muted);
        }

        .qrBox.empty::before {
          content: "QR will appear here";
          color: var(--muted);
        }

        .qrBox :global(canvas),
        .qrBox :global(img),
        .qrBox :global(svg) {
          max-width: 240px;
          max-height: 240px;
        }

        .hint {
          margin: 16px 0 0;
          color: var(--muted);
          line-height: 1.6;
        }

        dl {
          display: grid;
          gap: 16px;
          margin: 0;
        }

        dl > div {
          display: grid;
          gap: 8px;
        }

        dt {
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
        }

        dd {
          margin: 0;
          overflow-wrap: anywhere;
        }

        pre {
          overflow-x: auto;
          margin: 0;
          padding: 14px;
          border-radius: 12px;
          background: #101828;
          color: #e4e7ec;
          font-size: 13px;
          line-height: 1.5;
        }

        @media (max-width: 780px) {
          .page {
            padding: 32px 16px;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
