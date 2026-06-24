# Nikkah Noor Design System

## Brand Position

Nikkah Noor is a dignified Islamic matrimonial product for second marriage in Pakistan. The interface should feel private, serious, premium, and calm. It should avoid casual dating language and always reinforce family involvement, verification, and respectful intent.

## Core Colors

| Token | Hex | Usage |
| --- | --- | --- |
| `--bg` | `#0D0D0D` | Main app background |
| `--bg-2` | `#1A1A2E` | Deep navy surfaces |
| `--bg-3` | `#2A2A2A` | Inputs, elevated controls |
| `--gold` | `#D4AF37` | Primary CTA, premium accent, focus |
| `--emerald` | `#2C5F4F` | Verification and trust surfaces |
| `--success` | `#2ECC71` | Active, verified, accepted states |
| `--error` | `#8B1538` | Destructive and report states |
| `--info` | `#3498DB` | Family and informational badges |

## Typography

- Primary font stack: Inter, system UI, SF Pro-compatible fallbacks.
- Urdu production font recommendation: Noto Nastaliq Urdu or Jameel Noori Nastaleeq.
- Use clear, compact mobile hierarchy:
  - H1: 32px, bold
  - H2: 24px, semibold
  - H3: 18-20px, semibold
  - Body: 14-16px
  - Caption: 12px

All letter spacing is set to `0` for mobile readability.

## Component Rules

- Primary buttons use the gold-to-copper gradient and 48px minimum tap height.
- Secondary buttons are transparent with a gold border.
- Icon buttons are circular, 44-48px minimum, and used for navigation/actions.
- Cards use dark surfaces, subtle borders, and restrained shadows.
- Bottom navigation is fixed, thumb-friendly, and limited to five main destinations.
- Sheets slide up for filters and profile details.
- Verification badges appear consistently on discovery cards and profile summaries.

## Accessibility

- Tap targets are at least 44px, with most primary actions at 48px or larger.
- Focus states use a visible gold outline.
- Reduced motion is respected with `prefers-reduced-motion`.
- Text contrast is high on dark backgrounds.
- Mobile layout avoids tiny controls, hover-only affordances, and dense unlabeled icon clusters.

## Cultural UX Rules

- Use respectful terms: match, connection, profile, family, wali, verification.
- Avoid casual dating language: hookup, flirt, hot, crush, secret, casual.
- For women, privacy and wali/family involvement should be prominent.
- For second-wife arrangements, consent and financial responsibility must be visible and explicit.
- Safety education should appear before and during early messaging.
