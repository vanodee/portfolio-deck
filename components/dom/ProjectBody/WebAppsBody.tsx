import type { ProjectDetail } from "@/data/types";
import Section from "./Section";
import SoloTextContainer from "./SoloTextContainer";
import TextImageRow from "./TextImageRow";
import MediaGallery from "./MediaGallery";
import InfoCardGrid from "./InfoCardGrid";
import LiveLinkRow from "./LiveLinkRow";

// PROJECT_PAGE_LAYOUT.md §9 — Web Apps (9 sections, webApp_-prefixed
// fields). Section-omission: each Section wrapper is only rendered when at
// least one of its backing fields has content.
export default function WebAppsBody({
  detail,
}: {
  detail: Extract<ProjectDetail, { category: "Web Apps" }>;
}) {
  const hasTeaser = Boolean(
    detail.webApp_teaserImages?.length ||
      detail.webApp_teaserVideos?.length ||
      detail.liveLinks.length ||
      detail.webApp_productContextHeading ||
      detail.webApp_productContext,
  );
  const hasProbGoals = Boolean(detail.webApp_probGoals?.length);
  const hasDiscovery = Boolean(
    detail.webApp_productStratHeading ||
      detail.webApp_productStratContent ||
      detail.webApp_uxHypothesisHeading ||
      detail.webApp_uxHypothesis?.length ||
      detail.webApp_initialDesignImages?.length,
  );
  const hasScope = Boolean(
    detail.webApp_prodScopeHeading || detail.webApp_prodScope || detail.webApp_prodScopeItems?.length,
  );
  const hasDesign = Boolean(
    detail.webApp_designSectionHeading ||
      detail.webApp_designSectionText ||
      detail.webApp_designSectionImages?.length ||
      detail.webApp_designSectionItems?.length,
  );
  const hasDev = Boolean(detail.webApp_devSectionHeading || detail.webApp_devSectionText || detail.webApp_devSectionItems?.length);
  const hasFinished = Boolean(
    detail.webApp_finishedProdHeading || detail.webApp_finishedProdText || detail.webApp_finishedProdImages?.length,
  );
  const hasOutcomes = Boolean(
    detail.webApp_outcomesSectionHeading ||
      detail.webApp_mainOutcomeHeading ||
      detail.webApp_mainOutcomeText ||
      detail.webApp_otherOutcomes?.length,
  );
  const hasKeyLearnings = Boolean(
    detail.webApp_keyLearnHeading ||
      detail.webApp_keyLearnText ||
      detail.webApp_whatWorkedHeading ||
      detail.webApp_whatWorkedText,
  );

  return (
    <>
      {hasTeaser && (
        <Section>
          <MediaGallery
            images={detail.webApp_teaserImages}
            videos={detail.webApp_teaserVideos}
            videoPosters={detail.webApp_teaserVideoPosters}
            alt="Teaser"
          />
          <LiveLinkRow links={detail.liveLinks} />
          <TextImageRow
            heading={detail.webApp_productContextHeading}
            text={detail.webApp_productContext}
            image={detail.webApp_productContextImage}
            video={detail.webApp_productContextVideo}
            videoPoster={detail.webApp_productContextVideoPoster}
            alt={detail.webApp_productContextHeading || "Product context"}
          />
        </Section>
      )}

      {hasProbGoals && (
        <Section dark>
          <InfoCardGrid
            columns={2}
            items={(detail.webApp_probGoals ?? []).map((g) => ({
              title: g.probGoalName,
              list: g.probGoalList,
            }))}
          />
        </Section>
      )}

      {hasDiscovery && (
        <Section>
          <SoloTextContainer
            heading={detail.webApp_productStratHeading}
            text={detail.webApp_productStratContent}
          />
          <TextImageRow
            reverse
            heading={detail.webApp_uxHypothesisHeading}
            bulletList={detail.webApp_uxHypothesis}
            image={detail.webApp_uxHypothesisImage}
            video={detail.webApp_uxHypothesisVideo}
            videoPoster={detail.webApp_uxHypothesisVideoPoster}
            alt={detail.webApp_uxHypothesisHeading || "UX hypothesis"}
          />
          <MediaGallery
            images={detail.webApp_initialDesignImages}
            videos={detail.webApp_initialDesignVideos}
            videoPosters={detail.webApp_initialDesignVideoPosters}
            alt="Initial design exploration"
          />
        </Section>
      )}

      {hasScope && (
        <Section dark>
          <SoloTextContainer heading={detail.webApp_prodScopeHeading} text={detail.webApp_prodScope} />
          <InfoCardGrid
            columns={3}
            items={(detail.webApp_prodScopeItems ?? []).map((item) => ({
              title: item.itemTitle,
              description: item.itemRationale,
            }))}
          />
        </Section>
      )}

      {hasDesign && (
        <Section>
          <SoloTextContainer
            heading={detail.webApp_designSectionHeading}
            text={detail.webApp_designSectionText}
          />
          <MediaGallery
            images={detail.webApp_designSectionImages}
            videos={detail.webApp_designSectionVideos}
            videoPosters={detail.webApp_designSectionVideoPosters}
            alt={detail.webApp_designSectionHeading || "Design section"}
          />
          {(detail.webApp_designSectionItems ?? []).map((item, i) => (
            <TextImageRow
              key={i}
              reverse={i % 2 === 0}
              heading={item.itemName}
              bulletList={item.itemPoints}
              image={item.itemImage}
              video={item.itemVideo}
              videoPoster={item.itemVideoPoster}
              alt={item.itemName}
            />
          ))}
        </Section>
      )}

      {hasDev && (
        <Section dark>
          <SoloTextContainer heading={detail.webApp_devSectionHeading} text={detail.webApp_devSectionText} />
          {(detail.webApp_devSectionItems ?? []).map((item, i) => (
            <TextImageRow
              key={i}
              reverse={i % 2 === 0}
              heading={item.itemName}
              bulletList={item.itemPoints}
              image={item.itemImage}
              video={item.itemVideo}
              videoPoster={item.itemVideoPoster}
              alt={item.itemName}
            />
          ))}
        </Section>
      )}

      {hasFinished && (
        <Section>
          <SoloTextContainer
            heading={detail.webApp_finishedProdHeading}
            text={detail.webApp_finishedProdText}
          />
          <MediaGallery
            images={detail.webApp_finishedProdImages}
            videos={detail.webApp_finishedProdVideos}
            videoPosters={detail.webApp_finishedProdVideoPosters}
            alt={detail.webApp_finishedProdHeading || "Finished product"}
          />
          <LiveLinkRow links={detail.liveLinks} />
        </Section>
      )}

      {hasOutcomes && (
        <Section dark>
          <SoloTextContainer heading={detail.webApp_outcomesSectionHeading} />
          <SoloTextContainer heading={detail.webApp_mainOutcomeHeading} text={detail.webApp_mainOutcomeText} />
          <InfoCardGrid
            columns={3}
            items={(detail.webApp_otherOutcomes ?? []).map((o) => ({
              title: o.outcomeTitle,
              description: o.outcomeDescription,
            }))}
          />
        </Section>
      )}

      {hasKeyLearnings && (
        <Section>
          <TextImageRow
            reverse
            heading={detail.webApp_keyLearnHeading}
            text={detail.webApp_keyLearnText}
            bulletList={detail.webApp_keyLearnList}
            image={detail.webApp_keyLearnImage}
            video={detail.webApp_keyLearnVideo}
            videoPoster={detail.webApp_keyLearnVideoPoster}
            alt={detail.webApp_keyLearnHeading || "Key learnings"}
          />
          <TextImageRow
            heading={detail.webApp_whatWorkedHeading}
            text={detail.webApp_whatWorkedText}
            bulletList={detail.webApp_whatWorkedList}
            image={detail.webApp_whatWorkedImage}
            video={detail.webApp_whatWorkedVideo}
            videoPoster={detail.webApp_whatWorkedVideoPoster}
            alt={detail.webApp_whatWorkedHeading || "What worked"}
          />
        </Section>
      )}
    </>
  );
}
