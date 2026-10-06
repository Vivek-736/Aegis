import { Browserbase } from "@browserbasehq/sdk";
import puppeteer from "puppeteer-core";
import type { VisualSignal } from "./types";

export async function analyzeVisual(url: string): Promise<VisualSignal> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  if (!apiKey) {
    return {
      stream: "visual",
      score: null,
      unavailable: "Browserbase API key not configured",
      payload: {
        rawScore: 0,
      },
    };
  }

  let sessionId: string | undefined;
  let sessionUrl: string | undefined;

  try {
    const bb = new Browserbase({ apiKey });

    // 1. Create a remote isolated browser session on Browserbase
    // keepAlive is set to true so the user can inspect the live session embed in the report
    const session = await bb.sessions.create({
      keepAlive: true,
    });
    sessionId = session.id;

    // Immediately fetch debugger live fullscreen URL so it's guaranteed to be available
    try {
      const debugUrls = await bb.sessions.debug(sessionId);
      sessionUrl = debugUrls.debuggerFullscreenUrl;
    } catch {
      // Fallback
    }

    // 2. Connect via puppeteer-core to the remote browser's WebSocket CDP endpoint
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.connectUrl,
    });

    let formDetected = false;
    let passwordInputDetected = false;
    const visualFindings: string[] = [];
    let scoreAccumulator = 0;

    try {
      const pages = await browser.pages();
      const page = pages[0] || (await browser.newPage());

      // Set user agent and reasonable viewport
      await page.setViewport({ width: 1280, height: 800 });

      // Navigate to the target URL inside the isolated cloud browser
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Refresh debugger URL in case navigation shifted debug target
      try {
        const debugUrls = await bb.sessions.debug(sessionId);
        if (debugUrls.debuggerFullscreenUrl) {
          sessionUrl = debugUrls.debuggerFullscreenUrl;
        }
      } catch {
        // Retain original sessionUrl
      }

      // Query real rendered DOM elements in the remote page
      formDetected = await page.evaluate(() => {
        return document.querySelectorAll("form").length > 0;
      });

      passwordInputDetected = await page.evaluate(() => {
        return document.querySelectorAll("input[type='password']").length > 0;
      });

      const pageText = await page.evaluate(() => {
        return document.body ? document.body.innerText.toLowerCase() : "";
      });

      if (formDetected) {
        visualFindings.push("Rendered DOM contains interactive form inputs");
        scoreAccumulator += 15;
      }

      if (passwordInputDetected) {
        visualFindings.push("Active password input field detected in rendered UI");
        scoreAccumulator += 30;
      }

      if (
        pageText.includes("sign in") ||
        pageText.includes("log in") ||
        pageText.includes("verify account") ||
        pageText.includes("update billing") ||
        pageText.includes("enter credentials")
      ) {
        visualFindings.push("Rendered interface displays login/verification prompts");
        scoreAccumulator += 20;
      }

      const rawScore = Math.min(scoreAccumulator, 100);

      // Disconnect client WebSocket (keeps Browserbase session alive in cloud for user)
      await browser.disconnect();

      return {
        stream: "visual",
        score: rawScore,
        payload: {
          sessionId,
          sessionUrl,
          formDetected,
          passwordInputDetected,
          brandImpersonationDetected: formDetected && passwordInputDetected,
          visualFindings,
          rawScore,
        },
      };
    } catch (pageErr: unknown) {
      // Disconnect cleanly if navigation fails
      try {
        await browser.disconnect();
      } catch {
        // Ignore disconnect error
      }

      const errMsg = pageErr instanceof Error ? pageErr.message : String(pageErr);
      // If the target could not be loaded because the tunnel/connection was refused or server was seized/suspended
      const isConnectionFailure =
        errMsg.includes("ERR_TUNNEL_CONNECTION_FAILED") ||
        errMsg.includes("ERR_NAME_NOT_RESOLVED") ||
        errMsg.includes("ERR_CONNECTION_REFUSED") ||
        errMsg.includes("net::ERR_");

      const failureScore = isConnectionFailure ? 35 : null;

      return {
        stream: "visual",
        score: failureScore,
        unavailable: isConnectionFailure ? undefined : `Navigation error in isolated browser: ${errMsg}`,
        payload: {
          sessionId,
          sessionUrl,
          rawScore: failureScore ?? 0,
          visualFindings: [
            isConnectionFailure
              ? `Target unreachable in isolated cloud browser (${errMsg.split(" at ")[0]}) - indicative of a suspended or taken-down host.`
              : `Failed to navigate: ${errMsg}`,
          ],
        },
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      stream: "visual",
      score: null,
      unavailable: `Browserbase session creation failed: ${errorMsg}`,
      payload: {
        rawScore: 0,
      },
    };
  }
}
