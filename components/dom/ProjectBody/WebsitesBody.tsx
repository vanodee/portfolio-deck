import type { ProjectDetail } from "@/data/types";
import Section from "./Section";
import SoloTextContainer from "./SoloTextContainer";
import TextImageRow from "./TextImageRow";
import MediaGallery from "./MediaGallery";
import InfoCardGrid from "./InfoCardGrid";
import LiveLinkRow from "./LiveLinkRow";

// PROJECT_PAGE_LAYOUT.md §9 — Websites (9 sections, website_-prefixed
// fields) — structurally near-identical rhythm to Web Apps.
export default function WebsitesBody({
  detail,
}: {
  detail: Extract<ProjectDetail, { category: "Websites" }>;
}) {
  const hasTeaser = Boolean(
    detail.website_teaserImages?.length ||
      detail.website_teaserVideos?.length ||
      detail.liveLinks.length ||
      detail.website_businessContextHeading ||
      detail.website_businessContextContent,
  );
  const hasProblemsDesign = Boolean(
    detail.website_problemsIdentifiedHeading ||
      detail.website_problemsIdentified?.length ||
      detail.website_designObjectivesHeading ||
      detail.website_designObjectives?.length,
  );
  const hasMarketContext = Boolean(
    detail.website_marketContextHeading ||
      detail.website_marketContext ||
      detail.website_targetAudienceHeading ||
      detail.website_targetAudience?.length,
  );
  const hasInfoArc = Boolean(
    detail.website_informationArcHeading ||
      detail.website_informationArcText ||
      detail.website_informationArcImages?.length,
  );
  const hasUxStructure = Boolean(
    detail.website_uxStructureHeading || detail.website_uxStructureText || detail.website_uxStructureItems?.length,
  );
  const hasVisualDesign = Boolean(
    detail.website_visualDesignHeading || detail.website_visualDesignText || detail.website_visualDesignImages?.length,
  );
  const hasBuild = Boolean(
    detail.website_websiteBuildHeading ||
      detail.website_websiteBuildText ||
      detail.website_websiteBuildItems?.length ||
      detail.website_websiteBuildImages?.length,
  );
  const hasAccessibilityLaunch = Boolean(
    detail.website_accessibilityHeading ||
      detail.website_accessibilityText?.length ||
      detail.website_preLaunchHeading ||
      detail.website_preLaunchChecks?.length ||
      detail.liveLinks.length,
  );
  const hasOutcomes = Boolean(
    detail.website_outcomesSectionHeading ||
      detail.website_mainOutcomeHeading ||
      detail.website_mainOutcomeText ||
      detail.website_otherOutcomes?.length,
  );
  const hasKeyLearnings = Boolean(
    detail.website_keyLearnHeading ||
      detail.website_keyLearnText ||
      detail.website_whatWorkedHeading ||
      detail.website_whatWorkedText,
  );

  return (
    <>
      {hasTeaser && (
        <Section>
          <MediaGallery
            images={detail.website_teaserImages}
            videos={detail.website_teaserVideos}
            videoPosters={detail.website_teaserVideoPosters}
            alt="Teaser"
          />
          <LiveLinkRow links={detail.liveLinks} />
          <SoloTextContainer
            heading={detail.website_businessContextHeading}
            text={detail.website_businessContextContent}
          />
          <TextImageRow
            reverse
            heading={detail.website_problemsIdentifiedHeading}
            bulletList={detail.website_problemsIdentified}
            image={detail.website_problemsIdentifiedImage}
            video={detail.website_problemsIdentifiedVideo}
            videoPoster={detail.website_problemsIdentifiedVideoPoster}
            alt={detail.website_problemsIdentifiedHeading || "Problems identified"}
          />
          <TextImageRow
            heading={detail.website_designObjectivesHeading}
            bulletList={detail.website_designObjectives}
            image={detail.website_designObjectivesImage}
            video={detail.website_designObjectivesVideo}
            videoPoster={detail.website_designObjectivesVideoPoster}
            alt={detail.website_designObjectivesHeading || "Design objectives"}
          />
        </Section>
      )}

      {hasMarketContext && (
        <Section dark>
          <SoloTextContainer
            heading={detail.website_marketContextHeading}
            text={detail.website_marketContext}
          />
          <SoloTextContainer heading={detail.website_targetAudienceHeading} />
          <InfoCardGrid
            columns={3}
            items={(detail.website_targetAudience ?? []).map((t) => ({
              title: t.member,
              description: t.rationale,
            }))}
          />
        </Section>
      )}

      {hasInfoArc && (
        <Section>
          <SoloTextContainer
            heading={detail.website_informationArcHeading}
            text={detail.website_informationArcText}
          />
          <MediaGallery
            images={detail.website_informationArcImages}
            videos={detail.website_informationArcVideos}
            videoPosters={detail.website_informationArcVideoPosters}
            alt={detail.website_informationArcHeading || "Information architecture"}
          />
        </Section>
      )}

      {hasUxStructure && (
        <Section dark>
          <SoloTextContainer heading={detail.website_uxStructureHeading} text={detail.website_uxStructureText} />
          {(detail.website_uxStructureItems ?? []).map((item, i) => (
            <TextImageRow
              key={i}
              reverse={i % 2 === 0}
              heading={item.structureName}
              bulletList={item.structurePoints}
              image={item.structureImage}
              video={item.structureVideo}
              videoPoster={item.structureVideoPoster}
              alt={item.structureName}
            />
          ))}
        </Section>
      )}

      {hasVisualDesign && (
        <Section>
          <SoloTextContainer
            heading={detail.website_visualDesignHeading}
            text={detail.website_visualDesignText}
          />
          <MediaGallery
            images={detail.website_visualDesignImages}
            videos={detail.website_visualDesignVideos}
            videoPosters={detail.website_visualDesignVideoPosters}
            alt={detail.website_visualDesignHeading || "Visual design"}
          />
        </Section>
      )}

      {hasBuild && (
        <Section dark>
          <SoloTextContainer
            heading={detail.website_websiteBuildHeading}
            text={detail.website_websiteBuildText}
          />
          {(detail.website_websiteBuildItems ?? []).map((item, i) => (
            <TextImageRow
              key={i}
              reverse={i % 2 === 0}
              heading={item.buildItemName}
              bulletList={item.buildItemPoints}
              image={item.buildItemImage}
              video={item.buildItemVideo}
              videoPoster={item.buildItemVideoPoster}
              alt={item.buildItemName}
            />
          ))}
          <MediaGallery
            images={detail.website_websiteBuildImages}
            videos={detail.website_websiteBuildVideos}
            videoPosters={detail.website_websiteBuildVideoPosters}
            alt={detail.website_websiteBuildHeading || "Website build"}
          />
        </Section>
      )}

      {hasAccessibilityLaunch && (
        <Section>
          <SoloTextContainer
            heading={detail.website_accessibilityHeading}
            bulletList={detail.website_accessibilityText}
          />
          <MediaGallery
            images={detail.website_accessibilityImages}
            videos={detail.website_accessibilityVideos}
            videoPosters={detail.website_accessibilityVideoPosters}
            alt={detail.website_accessibilityHeading || "Accessibility"}
          />
          <TextImageRow
            reverse
            heading={detail.website_preLaunchHeading}
            bulletList={detail.website_preLaunchChecks}
            image={detail.website_preLaunchImage}
            video={detail.website_preLaunchVideo}
            videoPoster={detail.website_preLaunchVideoPoster}
            alt={detail.website_preLaunchHeading || "Pre-launch checks"}
          />
          <LiveLinkRow links={detail.liveLinks} />
        </Section>
      )}

      {hasOutcomes && (
        <Section dark>
          <SoloTextContainer heading={detail.website_outcomesSectionHeading} />
          <SoloTextContainer
            heading={detail.website_mainOutcomeHeading}
            text={detail.website_mainOutcomeText}
          />
          <InfoCardGrid
            columns={3}
            items={(detail.website_otherOutcomes ?? []).map((o) => ({
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
            heading={detail.website_keyLearnHeading}
            text={detail.website_keyLearnText}
            bulletList={detail.website_keyLearnList}
            image={detail.website_keyLearnImage}
            video={detail.website_keyLearnVideo}
            videoPoster={detail.website_keyLearnVideoPoster}
            alt={detail.website_keyLearnHeading || "Key learnings"}
          />
          <TextImageRow
            heading={detail.website_whatWorkedHeading}
            text={detail.website_whatWorkedText}
            bulletList={detail.website_whatWorkedList}
            image={detail.website_whatWorkedImage}
            video={detail.website_whatWorkedVideo}
            videoPoster={detail.website_whatWorkedVideoPoster}
            alt={detail.website_whatWorkedHeading || "What worked"}
          />
        </Section>
      )}
    </>
  );
}
