# LEGO Replacement Parts source capture

The 2026-10-10 Chrome HAR for set `10334`, search `6488969`, contains a request to the official dynamic Next.js route:

`GET https://www.lego.com/_next/data/<build-id>/en-us/service/replacement-parts/missing/10334/pieces.json?locale=en-us&setId=10334&search=6488969`

The recorded response has status 200 and an HTML body with `__NEXT_DATA__`. In this specific HAR, `6488969` occurs only in the page query. The response does not include a verifiable piece object or its displayed description. The importer therefore returns `OFFICIAL_METADATA_NOT_FOUND` and does not archive it as part identity evidence. The repository test fixture is a minimal sanitized reconstruction of that request and page query; the original HAR stays in the private runtime inbox.

The existing capability now recognizes the dynamic Next.js data route, the related official page's `__NEXT_DATA__` payload, and the legacy Customer Service GraphQL operation. Browser capture and HAR import use the same extractor. A candidate must have matching request set/search scope and a response object containing the matching Element ID, set context, and part description. Design ID is taken only from that object. If absent, `extractedDesignId` is `null`. Conflicting official candidates fail closed. No visible page text, URL query, or third-party crosswalk is used to infer Design ID.

## MCP calls

Call `get_lego_replacement_parts_config` for the page pattern, allowed transports, and private HAR inbox. Call `capture_lego_replacement_parts_metadata` with `session_id`, unique `source_id`, `set_id`, and `element_id` to open the dedicated browser. The first call returns `BROWSER_INTERACTION_REQUIRED` until the user searches. After the user sees one result, call the same tool again with the same arguments. The browser page, current `?search=` URL, and earlier official responses are retained for ten minutes. A client-side filter needs no second network request. The DOM only confirms the currently selected result; Element, description, and optional Design ID must come from a matching official response. If official metadata has no Design ID, the capture succeeds with `designId: null` and `reason: OFFICIAL_DESIGN_ID_NOT_EXPOSED`.

If the dedicated browser cannot get a verifiable response, export a Chrome HAR with content to the private inbox as `<har_file_id>.har` and call `import_lego_replacement_parts_har` with those same fields plus `har_file_id`.

Successful capture stores the request body, raw response, SHA-256 digests, selected official transport, extracted metadata, and a manifest under the immutable source archive. Cookie and token headers are omitted from public evidence. Use `inspect_archived_lego_replacement_parts` and `read_archived_lego_replacement_parts_range` to verify and read it. A HAR import records its source HAR digest and body representation; because HAR is browser-exported, it does not prove raw wire bytes beyond that representation.
