# AppsFlyer OneLink Web Fallback POC

Next.js Pages Router POC สำหรับทดสอบ AppsFlyer OneLink desktop fallback + Smart Script V2

## Current Setup

- Project path: `/Users/macbook/Documents/personal-projects/poc_af_webfallback`
- Fallback route: `/onelink-fallback`
- Page file: `src/pages/onelink-fallback.tsx`
- Free cloud target: Vercel
- Deployed domain: `https://won-poc-af-webfallback.vercel.app`
- Deployed fallback URL: `https://won-poc-af-webfallback.vercel.app/onelink-fallback`
- Test OneLink: `https://ktc-mobile-uat.onelink.me/egql/n3tzlto9`
- Smart Script template URL in page: `https://ktc-mobile-uat.onelink.me/egql`

## Custom Attributes

The fallback page generates an outgoing OneLink with these custom parameters:

- `source_code`
- `agent_code`
- `branch_code`

Default values:

- `source_code`: `default source code 001`
- `agent_code`: `default agent code 001`
- `branch_code`: `default branch code 001`

In the Smart Script config these are URL-encoded:

- `default%20source%20code%20001`
- `default%20agent%20code%20001`
- `default%20branch%20code%20001`

## Run Local

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/onelink-fallback
```

Test with custom query params:

```text
http://localhost:3000/onelink-fallback?source_code=src001&agent_code=agent001&branch_code=branch001
```

Test the deployed page with custom query params:

```text
https://won-poc-af-webfallback.vercel.app/onelink-fallback?source_code=web_test_source_001&agent_code=web_test_agent_001&branch_code=web_test_branch_001
```

## Deploy To Vercel

1. Push this project to a Git repository, or import the local project with Vercel CLI.
2. Create a Vercel project using the default Next.js settings.
3. Deploy and get a public HTTPS URL.
4. Set the AppsFlyer OneLink desktop fallback URL to:

```text
https://won-poc-af-webfallback.vercel.app/onelink-fallback
```

Ask the PO/Appsflyer admin to allowlist the domain or full fallback URL:

```text
https://won-poc-af-webfallback.vercel.app
https://won-poc-af-webfallback.vercel.app/onelink-fallback
```

## Checklist

- [x] Create minimal Next.js project files.
- [x] Initialize git repository.
- [x] Use Pages Router.
- [x] Create `src/pages/onelink-fallback.tsx`.
- [x] Load AppsFlyer Smart Script V2 from CDN.
- [x] Generate outgoing OneLink with `source_code`, `agent_code`, and `branch_code`.
- [x] Show generated link.
- [x] Add copy link button.
- [x] Show QR code from generated link.
- [x] Fix QR DOM conflict by keeping the Smart Script QR container empty and rendering the placeholder with CSS.
- [x] Add debug panel for incoming and generated query params.
- [x] Run `npm install`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run `npm run dev`.
- [x] Open `/onelink-fallback` locally.
- [x] Deploy to Vercel at `https://won-poc-af-webfallback.vercel.app`.
- [ ] Verify generated URL includes custom attributes.
- [ ] Verify QR opens the generated link on mobile.
- [ ] Configure OneLink desktop fallback to the Vercel URL.

## Notes

The sample Smart Script file uses `oneLinkURL = "https://ktc-mobile-uat.onelink.me/egql"`, while the user-facing test link is `https://ktc-mobile-uat.onelink.me/egql/n3tzlto9`. This POC follows the sample script and uses the template URL for Smart Script generation. During testing, verify in AppsFlyer that this is the expected template URL for generated outgoing links.

The QR container must stay empty in React because AppsFlyer Smart Script mutates the QR DOM directly. The placeholder is rendered with CSS `::before` to avoid React/Smart Script DOM ownership conflicts such as `Failed to execute 'removeChild' on 'Node'`.
