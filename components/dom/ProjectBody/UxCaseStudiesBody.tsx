import type { ProjectDetail } from "@/data/types";
import Section from "./Section";
import SoloTextContainer from "./SoloTextContainer";
import TextImageRow from "./TextImageRow";
import SoloImageContainer from "./SoloImageContainer";
import MediaGallery from "./MediaGallery";
import InfoCardGrid from "./InfoCardGrid";
import SoloInfoCard from "./SoloInfoCard";
import DividerSection from "./DividerSection";
import LiveLinkRow from "./LiveLinkRow";

// PROJECT_PAGE_LAYOUT.md §9 — UX Case Studies (17 sections + 4 chapter
// dividers, unprefixed fields — the largest and most granular category).
export default function UxCaseStudiesBody({
  detail,
}: {
  detail: Extract<ProjectDetail, { category: "UX Case Studies" }>;
}) {
  const hasPlatformRationale = Boolean(
    detail.platformImages?.length ||
      detail.liveLinks.length ||
      detail.projectRationaleHeading ||
      detail.projectRationale?.length,
  );
  const hasMarketResearch = Boolean(detail.marketResearchHeading || detail.marketResearchContent);
  const hasCompetitiveOpportunities = Boolean(
    detail.competitiveAnalysisHeading ||
      detail.competitiveAnalysisIntro ||
      detail.competitors?.length ||
      detail.opportunitiesHeading ||
      detail.opportunitiesList?.length,
  );
  const hasSurveyValidation = Boolean(
    detail.userSurveyHeading ||
      detail.userSurveyIntro ||
      detail.surveyCharts?.length ||
      detail.assumptionValidationHeading ||
      detail.assumptionValidation?.length,
  );
  const hasKeyInsights = Boolean(detail.keyInsightsHeading || detail.keyInsights?.length || detail.opportunityText);
  const hasPersonas = Boolean(detail.personasHeading || detail.personasIntro || detail.personas?.length);
  const hasProblemGoals = Boolean(
    detail.problemStatementHeading || detail.problemStatement || detail.designGoalsHeading || detail.designGoals?.length,
  );
  const hasUserFlow = Boolean(detail.userFlowHeading || detail.userFlowDescription || detail.userFlowDiagrams?.length);
  const hasInfoArchitecture = Boolean(
    detail.informationArchitectureHeading ||
      detail.informationArchitectureDescription ||
      detail.informationArchitectureImage,
  );
  const hasWireframes = Boolean(detail.wireframesHeading || detail.wireframesDescription || detail.wireframeImages?.length);
  const hasStyleGuide = Boolean(detail.styleGuideHeading || detail.styleGuideDescription || detail.styleGuideImages?.length);
  const hasHighFidelity = Boolean(
    detail.highFidelityHeading || detail.highFidelityIntro || detail.keyScreensList?.length || detail.highFidelityMockups?.length,
  );
  const hasPrototype = Boolean(
    detail.prototypeHeading ||
      detail.prototypeDescription ||
      detail.prototypeImages?.length ||
      detail.prototypeNotes?.length ||
      detail.liveLinks.length ||
      detail.validationHeading ||
      detail.validationDescription ||
      detail.studyResultsHeading ||
      detail.prototypeUpdateHeading,
  );
  const hasAccessibility = Boolean(
    detail.accessibilityHeading || detail.accessibilityConsiderations?.length || detail.accessibilityMockup,
  );
  const hasFinalResults = Boolean(
    detail.finalResultsHeading || detail.finalResultsText || detail.expectedOutcomes?.length || detail.keyLearningsHeading,
  );
  const hasFutureImprovements = Boolean(detail.futureImprovementsHeading || detail.futureImprovements?.length);
  const hasClosingSummary = Boolean(detail.closingSummaryHeading || detail.closingSummaryText);

  return (
    <>
      {hasPlatformRationale && (
        <Section>
          <SoloImageContainer
            image={detail.platformImages?.[0]}
            video={detail.platformVideos?.[0]}
            videoPoster={detail.platformVideoPosters?.[0]}
            alt="Platform display"
          />
          <MediaGallery
            images={detail.platformImages?.slice(1)}
            videos={detail.platformVideos?.slice(1)}
            videoPosters={detail.platformVideoPosters?.slice(1)}
            alt="Platform display"
          />
          <LiveLinkRow links={detail.liveLinks} />
          <TextImageRow
            reverse
            heading={detail.projectRationaleHeading}
            bulletList={detail.projectRationale}
            image={detail.projectRationaleImage}
            video={detail.projectRationaleVideo}
            videoPoster={detail.projectRationaleVideoPoster}
            alt={detail.projectRationaleHeading || "Project rationale"}
          />
        </Section>
      )}

      <DividerSection
        title={detail.researchSectionTitle}
        image={detail.researchSectionImage}
        video={detail.researchSectionVideo}
        videoPoster={detail.researchSectionVideoPoster}
      />

      {hasMarketResearch && (
        <Section>
          <TextImageRow
            heading={detail.marketResearchHeading}
            text={detail.marketResearchContent}
            image={detail.marketResearchVisual}
            video={detail.marketResearchVisualVideo}
            videoPoster={detail.marketResearchVisualVideoPoster}
            alt={detail.marketResearchHeading || "Market research"}
          />
        </Section>
      )}

      {hasCompetitiveOpportunities && (
        <Section dark>
          <SoloTextContainer heading={detail.competitiveAnalysisHeading} text={detail.competitiveAnalysisIntro} />
          {(detail.competitors ?? []).map((c, i) => (
            <TextImageRow
              key={i}
              reverse={i % 2 === 0}
              heading={c.competitorName}
              text={c.competitorType}
              bulletList={[...(c.competitorPros ?? []), ...(c.competitorCons ?? [])]}
              image={c.competitorImage}
              video={c.competitorVideo}
              videoPoster={c.competitorVideoPoster}
              alt={c.competitorName}
            />
          ))}
          <TextImageRow
            heading={detail.opportunitiesHeading}
            bulletList={detail.opportunitiesList}
            image={detail.opportunitiesImage}
            video={detail.opportunitiesVideo}
            videoPoster={detail.opportunitiesVideoPoster}
            alt={detail.opportunitiesHeading || "Opportunities"}
          />
        </Section>
      )}

      {hasSurveyValidation && (
        <Section>
          <SoloTextContainer heading={detail.userSurveyHeading} text={detail.userSurveyIntro} />
          <MediaGallery
            images={detail.surveyCharts}
            videos={detail.surveyChartsVideo}
            videoPosters={detail.surveyChartsVideoPoster}
            alt={detail.userSurveyHeading || "User survey"}
          />
          <TextImageRow
            reverse
            heading={detail.assumptionValidationHeading}
            bulletList={detail.assumptionValidation}
            image={detail.assumptionValidationImage}
            video={detail.assumptionValidationVideo}
            videoPoster={detail.assumptionValidationVideoPoster}
            alt={detail.assumptionValidationHeading || "Assumption validation"}
          />
        </Section>
      )}

      {hasKeyInsights && (
        <Section dark>
          <SoloTextContainer heading={detail.keyInsightsHeading} />
          <InfoCardGrid
            numbered
            columns={3}
            items={(detail.keyInsights ?? []).map((insight) => ({ description: insight }))}
          />
          <SoloInfoCard description={detail.opportunityText} />
        </Section>
      )}

      {hasPersonas && (
        <Section>
          <SoloTextContainer heading={detail.personasHeading} text={detail.personasIntro} />
          <MediaGallery
            images={detail.personas}
            videos={detail.personasVideo}
            videoPosters={detail.personasVideoPoster}
            alt={detail.personasHeading || "User personas"}
          />
        </Section>
      )}

      {hasProblemGoals && (
        <Section dark>
          <SoloTextContainer heading={detail.problemStatementHeading} text={detail.problemStatement} />
          <SoloTextContainer heading={detail.designGoalsHeading} />
          <InfoCardGrid
            numbered
            columns={3}
            items={(detail.designGoals ?? []).map((goal) => ({ description: goal }))}
          />
        </Section>
      )}

      <DividerSection
        title={detail.ideationSectionTitle}
        image={detail.ideationSectionImage}
        video={detail.ideationSectionVideo}
        videoPoster={detail.ideationSectionVideoPoster}
      />

      {hasUserFlow && (
        <Section>
          <SoloTextContainer heading={detail.userFlowHeading} text={detail.userFlowDescription} />
          <MediaGallery
            images={detail.userFlowDiagrams}
            videos={detail.userFlowDiagramsVideo}
            videoPosters={detail.userFlowDiagramsVideoPoster}
            alt={detail.userFlowHeading || "User flow"}
          />
        </Section>
      )}

      {hasInfoArchitecture && (
        <Section dark>
          <SoloTextContainer
            heading={detail.informationArchitectureHeading}
            text={detail.informationArchitectureDescription}
          />
          <SoloImageContainer
            image={detail.informationArchitectureImage}
            video={detail.informationArchitectureVideo}
            videoPoster={detail.informationArchitectureVideoPoster}
            alt={detail.informationArchitectureHeading || "Information architecture"}
          />
        </Section>
      )}

      {hasWireframes && (
        <Section>
          <SoloTextContainer heading={detail.wireframesHeading} text={detail.wireframesDescription} />
          <MediaGallery
            images={detail.wireframeImages}
            videos={detail.wireframeVideos}
            videoPosters={detail.wireframeVideoPosters}
            alt={detail.wireframesHeading || "Wireframes"}
          />
        </Section>
      )}

      <DividerSection
        title={detail.visualDesignSectionTitle}
        image={detail.visualDesignSectionImage}
        video={detail.visualDesignSectionVideo}
        videoPoster={detail.visualDesignSectionVideoPoster}
      />

      {hasStyleGuide && (
        <Section>
          <SoloTextContainer heading={detail.styleGuideHeading} text={detail.styleGuideDescription} />
          <MediaGallery
            images={detail.styleGuideImages}
            videos={detail.styleGuideVideos}
            videoPosters={detail.styleGuideVideoPosters}
            alt={detail.styleGuideHeading || "Style guide"}
          />
        </Section>
      )}

      {hasHighFidelity && (
        <Section dark>
          <SoloTextContainer
            heading={detail.highFidelityHeading}
            text={detail.highFidelityIntro}
            bulletList={detail.keyScreensList}
          />
          <MediaGallery
            images={detail.highFidelityMockups}
            videos={detail.highFidelityMockupsVideo}
            videoPosters={detail.highFidelityMockupsVideoPoster}
            alt={detail.highFidelityHeading || "High fidelity designs"}
          />
        </Section>
      )}

      {hasPrototype && (
        <Section>
          <SoloTextContainer heading={detail.prototypeHeading} text={detail.prototypeDescription} />
          <MediaGallery
            images={detail.prototypeImages}
            videos={detail.prototypeVideos}
            videoPosters={detail.prototypeVideoPosters}
            alt={detail.prototypeHeading || "Interactive prototype"}
          />
          <SoloTextContainer bulletList={detail.prototypeNotes} />
          <LiveLinkRow links={detail.liveLinks} />
          <SoloTextContainer
            heading={detail.validationHeading}
            text={detail.validationDescription}
            bulletList={detail.validationMethodology}
          />
          <TextImageRow
            reverse
            heading={detail.studyResultsHeading}
            bulletList={detail.studyResults}
            image={detail.studyResultsImage}
            video={detail.studyResultsVideo}
            videoPoster={detail.studyResultsVideoPoster}
            alt={detail.studyResultsHeading || "Study results"}
          />
          <TextImageRow
            heading={detail.prototypeUpdateHeading}
            bulletList={detail.prototypeUpdates}
            image={detail.prototypeUpdatesImage}
            video={detail.prototypeUpdatesVideo}
            videoPoster={detail.prototypeUpdatesVideoPoster}
            alt={detail.prototypeUpdateHeading || "Prototype updates"}
          />
        </Section>
      )}

      {hasAccessibility && (
        <Section dark>
          <SoloTextContainer
            heading={detail.accessibilityHeading}
            bulletList={detail.accessibilityConsiderations}
          />
          <SoloImageContainer
            image={detail.accessibilityMockup}
            video={detail.accessibilityMockupVideo}
            videoPoster={detail.accessibilityMockupVideoPoster}
            alt={detail.accessibilityHeading || "Accessibility considerations"}
          />
        </Section>
      )}

      <DividerSection
        title={detail.finalThoughtsSectionHeading}
        image={detail.finalThoughtsSectionImage}
        video={detail.finalThoughtsSectionVideo}
        videoPoster={detail.finalThoughtsSectionVideoPoster}
      />

      {hasFinalResults && (
        <Section>
          <SoloTextContainer
            heading={detail.finalResultsHeading}
            text={detail.finalResultsText}
            bulletList={detail.expectedOutcomes}
          />
          {detail.outcomesDisclaimer && <p>{detail.outcomesDisclaimer}</p>}
          <TextImageRow
            reverse
            heading={detail.keyLearningsHeading}
            bulletList={detail.keyLearnings}
            image={detail.keyLearningsImage}
            video={detail.keyLearningsVideo}
            videoPoster={detail.keyLearningsVideoPoster}
            alt={detail.keyLearningsHeading || "Key learnings"}
          />
        </Section>
      )}

      {hasFutureImprovements && (
        <Section dark>
          <SoloTextContainer heading={detail.futureImprovementsHeading} />
          <InfoCardGrid
            columns={3}
            items={(detail.futureImprovements ?? []).map((f) => ({
              title: f.improvementTitle,
              description: f.improvementDescription,
            }))}
          />
        </Section>
      )}

      {hasClosingSummary && (
        <Section>
          <SoloTextContainer heading={detail.closingSummaryHeading} text={detail.closingSummaryText} />
        </Section>
      )}
    </>
  );
}
