import type { ProjectDetail } from "@/data/types";
import Section from "./Section";
import SoloTextContainer from "./SoloTextContainer";
import TextImageRow from "./TextImageRow";
import MediaGallery from "./MediaGallery";
import InfoCardGrid from "./InfoCardGrid";
import SoloInfoCard from "./SoloInfoCard";
import PortraitImageGrid from "./PortraitImageGrid";

// PROJECT_PAGE_LAYOUT.md §9 — Logos & Branding (7 sections incl. 3
// near-identical Core Sections). No live-link CTAs anywhere in this
// category (confirmed via research — the only one of the 4 without any).
export default function LogosBrandingBody({
  detail,
}: {
  detail: Extract<ProjectDetail, { category: "Logos & Branding" }>;
}) {
  const hasTeaser = Boolean(
    detail.teaserImages?.length ||
      detail.teaserVideos?.length ||
      detail.businessContextHeading ||
      detail.businessContextContent,
  );
  const hasProblemsObjectives = Boolean(
    detail.problemsIdentifiedHeading ||
      detail.problemsIdentified?.length ||
      detail.designObjectivesHeading ||
      detail.designObjectives?.length,
  );
  const hasDesignApproach = Boolean(
    detail.designApproachHeading ||
      detail.discoveryStrategyHeading ||
      detail.discoveryStrategy ||
      detail.designApproachMethods?.length,
  );
  const hasFirstCore = Boolean(
    detail.firstCoreSectionHeading ||
      detail.firstCoreSectionText ||
      detail.firstCoreLandscapeImages?.length ||
      detail.firstCorePortraitImages?.length,
  );
  const hasSecondCore = Boolean(
    detail.secondCoreSectionHeading ||
      detail.secondCoreSectionText ||
      detail.secondCoreLandscapeImages?.length ||
      detail.secondCorePortraitImages?.length,
  );
  const hasThirdCore = Boolean(
    detail.thirdCoreSectionHeading ||
      detail.thirdCoreSectionText ||
      detail.thirdCoreLandscapeImages?.length ||
      detail.thirdCorePortraitImages?.length,
  );
  const hasOutcomes = Boolean(
    detail.outcomesSectionHeading || detail.mainOutcomeHeading || detail.mainOutcomeText || detail.otherOutcomes?.length,
  );
  const hasKeyLearnings = Boolean(
    detail.keyLearnHeading || detail.keyLearnText || detail.whatWorkedHeading || detail.whatWorkedText,
  );

  return (
    <>
      {hasTeaser && (
        <Section>
          <MediaGallery
            images={detail.teaserImages}
            videos={detail.teaserVideos}
            videoPosters={detail.teaserVideoPosters}
            alt="Teaser"
          />
          <SoloTextContainer heading={detail.businessContextHeading} text={detail.businessContextContent} />
          <TextImageRow
            reverse
            heading={detail.problemsIdentifiedHeading}
            bulletList={detail.problemsIdentified}
            image={detail.problemsIdentifiedImage}
            video={detail.problemsIdentifiedVideo}
            videoPoster={detail.problemsIdentifiedVideoPoster}
            alt={detail.problemsIdentifiedHeading || "Problems identified"}
          />
          <TextImageRow
            heading={detail.designObjectivesHeading}
            bulletList={detail.designObjectives}
            image={detail.designObjectivesImage}
            video={detail.designObjectivesVideo}
            videoPoster={detail.designObjectivesVideoPoster}
            alt={detail.designObjectivesHeading || "Design objectives"}
          />
        </Section>
      )}

      {hasDesignApproach && (
        <Section dark>
          <SoloTextContainer heading={detail.designApproachHeading} />
          <SoloInfoCard title={detail.discoveryStrategyHeading} description={detail.discoveryStrategy} />
          <InfoCardGrid
            columns={3}
            items={(detail.designApproachMethods ?? []).map((m) => ({
              title: m.approachTitle,
              description: m.approachDescription,
            }))}
          />
        </Section>
      )}

      {hasFirstCore && (
        <Section>
          <SoloTextContainer
            heading={detail.firstCoreSectionHeading}
            text={detail.firstCoreSectionText}
            bulletList={detail.firstCoreSectionList}
          />
          <MediaGallery
            images={detail.firstCoreLandscapeImages}
            videos={detail.firstCoreLandscapeVideos}
            videoPosters={detail.firstCoreLandscapeVideoPosters}
            alt={detail.firstCoreSectionHeading || "Core section"}
          />
          <PortraitImageGrid
            images={detail.firstCorePortraitImages}
            videos={detail.firstCorePortraitVideos}
            videoPosters={detail.firstCorePortraitVideoPosters}
            alt={detail.firstCoreSectionHeading || "Core section"}
          />
        </Section>
      )}

      {hasSecondCore && (
        <Section dark>
          <SoloTextContainer
            heading={detail.secondCoreSectionHeading}
            text={detail.secondCoreSectionText}
            bulletList={detail.secondCoreSectionList}
          />
          <MediaGallery
            images={detail.secondCoreLandscapeImages}
            videos={detail.secondCoreLandscapeVideos}
            videoPosters={detail.secondCoreLandscapeVideoPosters}
            alt={detail.secondCoreSectionHeading || "Core section"}
          />
          <PortraitImageGrid
            images={detail.secondCorePortraitImages}
            videos={detail.secondCorePortraitVideos}
            videoPosters={detail.secondCorePortraitVideoPosters}
            alt={detail.secondCoreSectionHeading || "Core section"}
          />
        </Section>
      )}

      {hasThirdCore && (
        <Section>
          <SoloTextContainer
            heading={detail.thirdCoreSectionHeading}
            text={detail.thirdCoreSectionText}
            bulletList={detail.thirdCoreSectionList}
          />
          <MediaGallery
            images={detail.thirdCoreLandscapeImages}
            videos={detail.thirdCoreLandscapeVideos}
            videoPosters={detail.thirdCoreLandscapeVideoPosters}
            alt={detail.thirdCoreSectionHeading || "Core section"}
          />
          <PortraitImageGrid
            images={detail.thirdCorePortraitImages}
            videos={detail.thirdCorePortraitVideos}
            videoPosters={detail.thirdCorePortraitVideoPosters}
            alt={detail.thirdCoreSectionHeading || "Core section"}
          />
        </Section>
      )}

      {hasOutcomes && (
        <Section dark>
          <SoloTextContainer heading={detail.outcomesSectionHeading} />
          <SoloInfoCard title={detail.mainOutcomeHeading} description={detail.mainOutcomeText} />
          <InfoCardGrid
            columns={3}
            items={(detail.otherOutcomes ?? []).map((o) => ({
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
            heading={detail.keyLearnHeading}
            text={detail.keyLearnText}
            bulletList={detail.keyLearnList}
            image={detail.keyLearnImage}
            video={detail.keyLearnVideo}
            videoPoster={detail.keyLearnVideoPoster}
            alt={detail.keyLearnHeading || "Key learnings"}
          />
          <TextImageRow
            heading={detail.whatWorkedHeading}
            text={detail.whatWorkedText}
            bulletList={detail.whatWorkedList}
            image={detail.whatWorkedImage}
            video={detail.whatWorkedVideo}
            videoPoster={detail.whatWorkedVideoPoster}
            alt={detail.whatWorkedHeading || "What worked"}
          />
        </Section>
      )}
    </>
  );
}
