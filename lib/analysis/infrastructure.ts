import dns from "node:dns/promises";
import tls from "node:tls";
import type { InfrastructureSignal } from "./types";

interface UrlhausResponse {
  query_status: string;
  threat?: string;
  url_status?: string;
}

interface IpWhoIsResponse {
  success?: boolean;
  ip?: string;
  country?: string;
  country_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  flag?: {
    emoji?: string;
  };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
  };
}

/**
 * Fetch TLS Certificate details (Issuer, Subject, SANs)
 */
async function fetchTlsCertificate(hostname: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        timeout: 4000,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          if (cert && cert.issuer) {
            const issuerOrg = cert.issuer.O || cert.issuer.CN || "Unknown Authority";
            const sanList = cert.subjectaltname
              ? cert.subjectaltname.replace(/DNS:/g, "").split(", ").slice(0, 3).join(", ")
              : cert.subject?.CN || hostname;
            resolve(`${issuerOrg}: ${sanList}`);
          } else {
            resolve(undefined);
          }
        } catch {
          resolve(undefined);
        } finally {
          socket.destroy();
        }
      }
    );

    socket.on("error", () => {
      socket.destroy();
      resolve(undefined);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(undefined);
    });
  });
}

/**
 * Fetch GeoIP, ISP, and ASN metadata
 */
async function fetchGeoIpData(ip: string): Promise<IpWhoIsResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://ipwho.is/${ip}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return (await res.json()) as IpWhoIsResponse;
    }
  } catch {
    // Geo lookup fallback
  }
  return null;
}

export async function analyzeInfrastructure(targetUrl: string): Promise<InfrastructureSignal> {
  const reasons: string[] = [];
  let scoreAccumulator = 0;

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      stream: "infrastructure",
      score: null,
      unavailable: `Invalid URL: ${targetUrl}`,
      payload: {
        sourceUrl: targetUrl,
        rawScore: 0,
        reasons: ["URL could not be parsed."],
      },
    };
  }

  const isHttps = parsed.protocol === "https:";
  if (!isHttps) {
    scoreAccumulator += 30;
    reasons.push("Insecure protocol: Target does not use HTTPS");
  }

  const hostname = parsed.hostname;
  const domainParts = hostname.split(".");
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1]?.toLowerCase() : "";

  // 1. IP address hostname check
  const isDirectIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isDirectIp) {
    scoreAccumulator += 40;
    reasons.push("Host is a raw numerical IP address instead of a domain");
  }

  // 2. DNS Resolution check (with public DoH fallback to avoid local resolver errors)
  let dnsResolved = false;
  let dnsRecords: string[] = [];
  let primaryIp: string | undefined = isDirectIp ? hostname : undefined;

  try {
    const aRecords = await dns.resolve4(hostname);
    if (aRecords && aRecords.length > 0) {
      dnsResolved = true;
      dnsRecords = aRecords;
      primaryIp = aRecords[0];
    }
  } catch {
    // Fall back to Google Public DNS-over-HTTPS
    try {
      const dohRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`, {
        headers: { Accept: "application/dns-json" },
      });
      if (dohRes.ok) {
        const dohData = (await dohRes.json()) as {
          Status: number;
          Answer?: Array<{ type: number; data: string }>;
        };
        if (dohData.Status === 0 && dohData.Answer && dohData.Answer.length > 0) {
          const ips = dohData.Answer.filter((ans) => ans.type === 1).map((ans) => ans.data);
          if (ips.length > 0) {
            dnsResolved = true;
            dnsRecords = ips;
            primaryIp = ips[0];
          }
        } else if (dohData.Status !== 0) {
          dnsResolved = false;
          scoreAccumulator += 35;
          reasons.push("DNS resolution failed: Domain nameservers refused query or returned NXDOMAIN (inactive/suspended host)");
        }
      }
    } catch {
      dnsResolved = false;
    }
  }

  // 3. Brand Typosquatting / Impersonation Check in Domain
  const brandKeywords = [
    "collabstr",
    "paypal",
    "apple",
    "netflix",
    "amazon",
    "microsoft",
    "google",
    "binance",
    "coinbase",
    "chase",
    "wellsfargo",
    "bankofamerica",
    "steam",
    "discord",
    "telegram",
  ];

  let brandDetected: string | null = null;
  for (const b of brandKeywords) {
    if (hostname.toLowerCase().includes(b)) {
      brandDetected = b;
      const isAuthentic = hostname === `${b}.com` || hostname === `www.${b}.com`;
      if (!isAuthentic) {
        scoreAccumulator += 45;
        reasons.push(`Brand spoofing / typosquatting detected: Target domain mimics authentic brand '${b}'`);
      }
      break;
    }
  }

  // 4. Excessive subdomains or punycode check
  if (hostname.startsWith("xn--")) {
    scoreAccumulator += 35;
    reasons.push("Punycode/IDN homograph detected in domain name");
  }

  if (domainParts.length > 3) {
    scoreAccumulator += 15;
    reasons.push("Unusually deep subdomain hierarchy");
  }

  // 5. Free or high-abuse TLDs
  const suspiciousTlds = new Set(["top", "xyz", "buzz", "click", "rest", "surf", "cfd", "work", "sbs"]);
  if (tld && suspiciousTlds.has(tld)) {
    scoreAccumulator += 20;
    reasons.push(`High-abuse top-level domain (.${tld})`);
  }

  // 5. Threat feed lookup (URLhaus API lookup)
  let threatFeedMatch = false;
  let threatDetails: string | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const formData = new URLSearchParams();
    formData.append("url", targetUrl);

    const res = await fetch("https://urlhaus-api.abuse.ch/v1/url/", {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as UrlhausResponse;
      if (data.query_status === "ok") {
        threatFeedMatch = true;
        threatDetails = data.threat || "URLhaus listed active malware/phishing campaign";
        scoreAccumulator += 60;
        reasons.push(`Threat intelligence hit: Listed in URLhaus database (${threatDetails})`);
      }
    }
  } catch {
    // Threat feed unavailable or timed out
  }

  // 6. Redirect count and destination URL check
  let redirectedUrl = targetUrl;
  let redirectCount = 0;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const headRes = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (headRes.url && headRes.url !== targetUrl) {
      redirectedUrl = headRes.url;
      redirectCount++;
    }
  } catch {
    // Probe skipped
  }

  // 7. GeoIP, ISP, ASN, and TLS Certificate details concurrently
  let country: string | undefined;
  let countryCode: string | undefined;
  let countryFlagEmoji: string | undefined;
  let city: string | undefined;
  let latitude: number | null = null;
  let longitude: number | null = null;
  let hostingProvider: string | undefined;
  let asn: string | number | null = null;
  let certificateDetails: string | undefined;

  const [geoRes, certRes] = await Promise.allSettled([
    primaryIp ? fetchGeoIpData(primaryIp) : Promise.resolve(null),
    isHttps ? fetchTlsCertificate(hostname) : Promise.resolve(undefined),
  ]);

  if (geoRes.status === "fulfilled" && geoRes.value && geoRes.value.success) {
    const g = geoRes.value;
    country = g.country;
    countryCode = g.country_code;
    countryFlagEmoji = g.flag?.emoji;
    city = g.city;
    latitude = g.latitude ?? null;
    longitude = g.longitude ?? null;
    hostingProvider = g.connection?.org || g.connection?.isp;
    asn = g.connection?.asn ?? null;
  }

  if (certRes.status === "fulfilled" && certRes.value) {
    certificateDetails = certRes.value;
  }

  const finalScore = Math.min(Math.round(scoreAccumulator), 100);

  return {
    stream: "infrastructure",
    score: finalScore,
    payload: {
      domain: hostname,
      sourceUrl: targetUrl,
      redirectedUrl,
      tld,
      ipAddress: primaryIp,
      country,
      countryCode,
      countryFlagEmoji,
      city,
      latitude,
      longitude,
      hostingProvider,
      asn,
      certificateDetails,
      brandDetected,
      isHttps,
      dnsResolved,
      dnsRecords,
      redirectCount,
      threatFeedMatch,
      threatDetails,
      domainAgeDays: null,
      rawScore: finalScore,
      reasons,
    },
  };
}
