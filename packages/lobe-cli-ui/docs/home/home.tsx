import {
  AgentSkillCard,
  InstallBanner,
  LandingHero,
  LandingSection,
  LogoMarquee,
} from '@lobehub/ui/awesome';
import { Link, useNavigate } from 'react-router';

import { BentoGallery } from './BentoGallery';
import { FeatureSection } from './FeatureSection';
import { ArrowRight, GitCommitHorizontal, Github, Languages, Search, Tags } from './icons';
import { renderLink } from './renderLink';

const SITE_URL = 'https://cli-ui.lobehub.com';
const GITHUB_URL = 'https://github.com/lobehub/lobe-cli-toolbox/tree/master/packages/lobe-cli-ui';
const INSTALL_COMMAND = 'pnpm add @lobehub/cli-ui';

const CLI_LOGOS = [
  { icon: GitCommitHorizontal, label: 'lobe-commit' },
  { icon: Languages, label: 'lobe-i18n' },
  { icon: Search, label: 'lobe-seo' },
  { icon: Tags, label: 'lobe-label' },
];

export default function Home({
  description,
  getStartedPathname,
}: {
  description: string;
  getStartedPathname: string;
}) {
  const navigate = useNavigate();

  return (
    <>
      <LandingHero
        accent="for CLIs"
        description={<span data-pagefind-meta="description">{description}</span>}
        renderLink={renderLink}
        title={<span data-pagefind-meta="title">Lobe CLI UI</span>}
        actions={[
          {
            href: getStartedPathname,
            icon: ArrowRight,
            iconPlacement: 'end',
            label: 'Get Started',
            primary: true,
          },
          { href: GITHUB_URL, icon: Github, label: 'GitHub' },
        ]}
        aside={
          <AgentSkillCard
            agent={{
              code: `Read ${SITE_URL}/skills.md and follow it to build Ink CLIs with @lobehub/cli-ui.`,
              description: 'Send this prompt to your agent to pick the right components',
            }}
            footer={
              <>
                <a href="/skills.md" rel="noreferrer" target="_blank">
                  skills.md
                </a>
                <a href="/llms.txt" rel="noreferrer" target="_blank">
                  llms.txt
                </a>
              </>
            }
          />
        }
        badge={
          <a href="/skills.md" rel="noreferrer" target="_blank">
            New · Agent skills for every component →
          </a>
        }
        onNavigate={navigate}
      >
        <LogoMarquee
          items={CLI_LOGOS}
          caption={
            <span>
              Powers the Lobe CLIs in{' '}
              <a
                href="https://github.com/lobehub/lobe-cli-toolbox"
                rel="noreferrer"
                target="_blank"
              >
                lobe-cli-toolbox
              </a>
            </span>
          }
        />
      </LandingHero>

      <LandingSection
        description="Three live Ink previews — open a card for the full API and more examples."
        eyebrow="Components"
        eyebrowColor="blue"
        id="home-gallery"
        renderLink={renderLink}
        title="Built for terminal workflows"
        actions={[
          {
            href: '/components/panel',
            icon: ArrowRight,
            iconPlacement: 'end',
            label: 'Browse components',
          },
        ]}
        onNavigate={navigate}
      >
        <BentoGallery />
      </LandingSection>

      <LandingSection
        actions={[{ href: '/getting-started', label: 'Install guide' }]}
        description="The same primitives every Lobe CLI ships with."
        eyebrow="Foundations"
        eyebrowColor="orange"
        id="home-features"
        renderLink={renderLink}
        title="Everything a Lobe CLI needs"
        onNavigate={navigate}
      >
        <FeatureSection />
      </LandingSection>

      <InstallBanner
        command={INSTALL_COMMAND}
        title="Install @lobehub/cli-ui"
        footnote={
          <>
            This revision is pending release · MIT license ·{' '}
            <Link to={getStartedPathname}>Get Started →</Link>
          </>
        }
      />
    </>
  );
}
