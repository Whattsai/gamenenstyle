const operation = 'CustomerServiceReplacementPartsSetPiecesSearch';
const nextPath = /^\/_next\/data\/([A-Za-z0-9_-]{6,128})\/([a-z]{2}-[a-z]{2})\/service\/replacement-parts\/missing\/([0-9]{4,7})\/pieces\.json$/i;
const pagePath = /^\/([a-z]{2}-[a-z]{2})\/service\/replacement-parts\/missing\/([0-9]{4,7})\/pieces$/i;
const graphqlPath = `/api/graphql/${operation}`;
const forbiddenQuery = /authorization|cookie|token|secret|password|api.?key|credential|signature|session|access.?key|user.?id|analytics/i;
const id = value => typeof value === 'string' || typeof value === 'number' ? String(value) : null;
const fail = code => { throw new Error(`LEGO_REPLACEMENT_${code}`); };

function jsonDocuments(bytes) {
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return []; }
  const documents = [];
  try { documents.push(JSON.parse(text)); } catch {}
  // Next.js may return an HTML shell rather than JSON. Only parse the JSON script,
  // never treat displayed text or the route query as piece metadata.
  const match = text.match(/<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (match) { try { documents.push(JSON.parse(match[1])); } catch {} }
  // RSC Flight records are serialized JSON arrays inside these script calls.
  for (const chunk of text.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\);/g)) {
    try { documents.push(JSON.parse(chunk[1])); } catch {}
  }
  for (const line of text.split(/\r?\n/)) {
    const frame = line.match(/^[0-9a-f]+:([\[{].*)$/i);
    if (frame) { try { documents.push(JSON.parse(frame[1])); } catch {} }
  }
  return documents;
}

function pieceCandidates(value, elementId, inheritedSet, output, state, depth = 0) {
  if (typeof value === 'string' && value.length < 100000) {
    const frame = value.trim().match(/^(?:[0-9a-f]+:)?([\[{][\s\S]*)$/i);
    if (frame) { try { pieceCandidates(JSON.parse(frame[1]), elementId, inheritedSet, output, state, depth + 1); } catch {} }
    return;
  }
  if (!value || typeof value !== 'object' || depth > 30 || ++state.visited > 100000) return;
  if (Array.isArray(value)) {
    for (const child of value) pieceCandidates(child, elementId, inheritedSet, output, state, depth + 1);
    return;
  }
  const set = id(value.setId ?? value.setNumber ?? value.setNo ?? value.set?.number) ?? inheritedSet;
  const element = id(value.elementId ?? value.elementID ?? value.elementNumber ?? value.element?.id);
  const name = value.description ?? value.name ?? value.partName ?? value.designName;
  if (element === elementId && typeof name === 'string' && name.trim() && name.length <= 512 && set) {
    const rawDesign = value.designId ?? value.designID ?? value.designNumber ?? null;
    const designId = rawDesign === null ? null : id(rawDesign);
    if (designId === null || /^[A-Za-z0-9_-]{1,64}$/.test(designId))
      output.push({ setId: set, elementId: element, description: name.trim(), designId });
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'query' || key === 'variables' || key === 'translations') continue;
    if (typeof child === 'string' && child.length > 0 && child.length < 100000 && /^[\[{]/.test(child)) {
      try { pieceCandidates(JSON.parse(child), elementId, set, output, state, depth + 1); } catch {}
    } else pieceCandidates(child, elementId, set, output, state, depth + 1);
  }
}

export class ReplacementPartsEvidenceExtractor {
  constructor(origin = 'https://www.lego.com') { this.origin = origin; }

  correlation(value, setId, elementId) {
    if (!value || value.resultCount !== 1 || value.setId !== setId || value.elementId !== elementId) return false;
    let page;
    try { page = this.target(value.pageUrl); } catch { return false; }
    return page.transport === 'next-page' && page.routeSetId === setId &&
      page.url.searchParams.get('search') === elementId && page.url.searchParams.getAll('search').length === 1;
  }

  target(value) {
    let url;
    try { url = new URL(value); } catch { fail('TARGET_NOT_ALLOWED'); }
    if (url.protocol !== 'https:' || url.origin !== this.origin || url.username || url.password || url.hash ||
        [...url.searchParams.keys()].some(key => forbiddenQuery.test(key))) fail('TARGET_NOT_ALLOWED');
    const next = url.pathname.match(nextPath), page = url.pathname.match(pagePath);
    const transport = next ? 'next-data' : page ? 'next-page' : url.pathname === graphqlPath ? 'graphql' : null;
    if (!transport) fail('TARGET_NOT_ALLOWED');
    return { url, transport, routeSetId: next?.[3] ?? page?.[2] ?? null };
  }

  scope(exchange, setId, elementId, correlation = null) {
    const target = this.target(exchange.requestUrl);
    const correlated = this.correlation(correlation, setId, elementId);
    if (target.transport === 'graphql') {
      if (exchange.method === 'POST') {
        let payload;
        try { payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(exchange.requestBytes)); } catch { fail('MALFORMED_REQUEST'); }
        const variables = payload?.variables;
        if (payload?.operationName !== operation || !variables || typeof variables !== 'object' ||
          id(variables.setId) !== setId || id(variables.search ?? variables.elementId) !== elementId ||
          /"(?:authorization|cookie|token|secret|password|api.?key|credential|signature|session|user.?id|analytics.?id)"\s*:/i.test(exchange.requestBytes.toString('utf8')) ||
          (payload.query !== undefined && (typeof payload.query !== 'string' || !/^\s*query\b/.test(payload.query)))) fail('REQUEST_SCOPE_INVALID');
      } else if (exchange.method === 'GET') {
        if (exchange.requestBytes.length || target.url.searchParams.get('setId') !== setId ||
          target.url.searchParams.get('search') !== elementId || target.url.searchParams.getAll('setId').length !== 1 ||
          target.url.searchParams.getAll('search').length !== 1) fail('REQUEST_SCOPE_INVALID');
      } else fail('REQUEST_SCOPE_INVALID');
    } else {
      const querySet = target.url.searchParams.get('setId');
      const queryElement = target.url.searchParams.get('search') ?? target.url.searchParams.get('element');
      if (exchange.method !== 'GET' || exchange.requestBytes.length || target.routeSetId !== setId ||
        (target.transport === 'next-data' && querySet !== setId) ||
        (querySet !== null && querySet !== setId) || target.url.searchParams.getAll('setId').length > 1 ||
        (queryElement !== elementId && !(correlated && queryElement === null)) ||
        target.url.searchParams.getAll('search').length + target.url.searchParams.getAll('element').length > 1 ||
        (!correlated && (querySet !== setId || queryElement !== elementId))) fail('REQUEST_SCOPE_INVALID');
    }
    return target;
  }

  extract(exchange, setId, elementId, correlation = null) {
    const target = this.scope(exchange, setId, elementId, correlation);
    if (exchange.status < 200 || exchange.status >= 300) return null;
    const documents = jsonDocuments(exchange.responseBytes), pieces = [];
    for (const document of documents) {
      if (document?.query?.setId !== undefined && id(document.query.setId) !== setId) continue;
      if (document?.query?.search !== undefined && id(document.query.search) !== elementId) continue;
      const contextSet = id(document?.data?.setId ?? document?.props?.pageProps?.setId);
      pieceCandidates(document, elementId, contextSet, pieces, { visited: 0 });
    }
    const visible = typeof correlation?.visibleText === 'string' ? correlation.visibleText.replace(/\s+/g, ' ').toUpperCase() : null;
    const verified = pieces.filter(piece => piece.setId === setId &&
      (!visible || visible.includes(piece.description.replace(/\s+/g, ' ').toUpperCase())));
    if (!verified.length) return null;
    const signatures = new Set(verified.map(piece => JSON.stringify([piece.description, piece.designId])));
    if (signatures.size !== 1) fail('OFFICIAL_METADATA_AMBIGUOUS');
    return { ...verified[0], sourceTransport: target.transport };
  }

  select(exchanges, setId, elementId, correlation = null) {
    const candidates = [];
    for (const exchange of exchanges) {
      try { const metadata = this.extract(exchange, setId, elementId, correlation); if (metadata) candidates.push({ exchange, metadata }); }
      catch (error) { if (String(error.message).includes('OFFICIAL_METADATA_AMBIGUOUS')) throw error; }
    }
    if (!candidates.length) fail('OFFICIAL_METADATA_NOT_FOUND');
    const signatures = new Set(candidates.map(({ metadata }) => JSON.stringify([metadata.setId, metadata.elementId, metadata.description, metadata.designId])));
    if (signatures.size !== 1) fail('OFFICIAL_METADATA_AMBIGUOUS');
    const priority = { 'next-data': 0, graphql: 1, 'next-page': 2 };
    candidates.sort((a, b) => priority[a.metadata.sourceTransport] - priority[b.metadata.sourceTransport]);
    return candidates[0];
  }
}
