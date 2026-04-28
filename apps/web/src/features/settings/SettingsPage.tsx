import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Globe,
  Lock,
  Shield,
  ShieldCheck,
  TriangleAlert,
  User,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { cn } from '@/lib/utils'
import type { SettingsTab } from './settings.types'
import { ProfileSettingsForm }       from './components/ProfileSettingsForm'
import { PasswordSettingsForm }      from './components/PasswordSettingsForm'
import { NotificationSettingsForm }  from './components/NotificationSettingsForm'
import { PrivacySettingsPanel }      from './components/PrivacySettingsPanel'
import { LanguageSettingsForm }      from './components/LanguageSettingsForm'
import { DangerZone }               from './components/DangerZone'

// ── Tab definitions ───────────────────────────────────────────────────────────

interface TabDef {
  id:      SettingsTab
  icon:    React.ElementType
  danger?: boolean
}

const TABS: TabDef[] = [
  { id: 'profile',       icon: User        },
  { id: 'security',      icon: Lock        },
  { id: 'notifications', icon: Bell        },
  { id: 'privacy',       icon: ShieldCheck },
  { id: 'preferences',   icon: Globe       },
  { id: 'danger',        icon: TriangleAlert, danger: true },
]

// ── Slide animation ───────────────────────────────────────────────────────────

const contentVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' as const } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  return (
    <PageLayout
      title={t('title')}
      description={t('description')}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Left: Tab nav ───────────────────────────────────────────────── */}
        <nav
          aria-label={t('nav')}
          className="
            flex flex-row flex-wrap gap-1
            lg:flex-col lg:flex-nowrap lg:w-48 lg:shrink-0 lg:sticky lg:top-6
          "
        >
          {TABS.map(({ id, icon: Icon, danger }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-left',
                  isActive && !danger
                    ? 'bg-blue-50 text-blue-700'
                    : isActive && danger
                      ? 'bg-red-50 text-red-700'
                      : danger
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive && !danger ? 'text-blue-600' : '',
                    isActive && danger  ? 'text-red-600'  : '',
                  )}
                  aria-hidden="true"
                />
                {t(`tabs.${id}`)}
              </button>
            )
          })}
        </nav>

        {/* ── Right: Active section ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-5"
            >
              {activeTab === 'profile'       && <ProfileSection />}
              {activeTab === 'security'      && <SecuritySection />}
              {activeTab === 'notifications' && <NotificationsSection />}
              {activeTab === 'privacy'       && <PrivacySection />}
              {activeTab === 'preferences'   && <PreferencesSection />}
              {activeTab === 'danger'        && <DangerSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { t } = useTranslation('settings')
  return (
    <>
      <SectionIntro
        icon={User}
        title={t('profile.tabTitle')}
        description={t('profile.tabDescription')}
      />
      <ProfileSettingsForm />
    </>
  )
}

function SecuritySection() {
  const { t } = useTranslation('settings')
  return (
    <>
      <SectionIntro
        icon={Lock}
        title={t('security.tabTitle')}
        description={t('security.tabDescription')}
      />
      <PasswordSettingsForm />
    </>
  )
}

function NotificationsSection() {
  const { t } = useTranslation('settings')
  return (
    <>
      <SectionIntro
        icon={Bell}
        title={t('notifications.tabTitle')}
        description={t('notifications.tabDescription')}
      />
      <NotificationSettingsForm />
    </>
  )
}

function PrivacySection() {
  const { t } = useTranslation('settings')
  return (
    <>
      <SectionIntro
        icon={Shield}
        title={t('privacy.tabTitle')}
        description={t('privacy.tabDescription')}
      />
      <PrivacySettingsPanel />
    </>
  )
}

function PreferencesSection() {
  const { t } = useTranslation('settings')
  return (
    <>
      <SectionIntro
        icon={Globe}
        title={t('preferences.tabTitle')}
        description={t('preferences.tabDescription')}
      />
      <LanguageSettingsForm />
    </>
  )
}

function DangerSection() {
  const { t } = useTranslation('settings')
  return (
    <>
      <SectionIntro
        icon={TriangleAlert}
        title={t('danger.tabTitle')}
        description={t('danger.tabDescription')}
        variant="danger"
      />
      <DangerZone />
    </>
  )
}

// ── Section intro helper ──────────────────────────────────────────────────────

interface SectionIntroProps {
  icon:        React.ElementType
  title:       string
  description: string
  variant?:    'default' | 'danger'
}

function SectionIntro({ icon: Icon, title, description, variant = 'default' }: SectionIntroProps) {
  const isDanger = variant === 'danger'
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500',
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div>
        <h2 className={cn('text-base font-semibold', isDanger ? 'text-red-700' : 'text-gray-900')}>
          {title}
        </h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}
