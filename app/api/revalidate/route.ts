import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { NextRequest, NextResponse } from "next/server";

// Sanity webhook target (Phase 9). Registered separately from the reference
// site's own webhook — both fire independently per document publish, no
// conflict (FRONTEND_INTEGRATION.md §2a). The tag scheme lives at each
// fetch's own { next: { tags: [...] } } — currently just
// lib/getProjects.ts's getProjectListing(), tagged ["project", "category"].
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Bad Request — missing _type" }, { status: 400 });
    }

    // {expire: 0} is the mandatory-as-of-Next-16 cache-profile argument —
    // reproduces the pre-Next-16 "immediate full purge" behavior explicitly
    // rather than depending on a configured named profile.
    revalidateTag(body._type, { expire: 0 });

    return NextResponse.json({ revalidated: true, now: Date.now(), type: body._type });
  } catch (err) {
    console.error("[revalidate] error", err);
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
