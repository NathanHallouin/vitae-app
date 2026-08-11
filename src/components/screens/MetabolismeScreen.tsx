'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { bmiGaugePosition, energyBreakdown } from '@/lib/calc';
import { activityFactor, activityLabel, BMI_BANDS, BMI_GAUGE_LABELS } from '@/lib/constants';
import { dec, fmtFactor, kcal } from '@/lib/format';
import { DISPLAY_FONT, FS } from '@/theme/theme';
import { useProfile } from '../ProfileProvider';
import MeditatingDoodle from '../ui/doodles/MeditatingDoodle';
import Overline from '../ui/Overline';
import PageIntro from '../ui/PageIntro';
import StatTile from '../ui/StatTile';

export default function MetabolismeScreen() {
  const { metrics, profile } = useProfile();
  if (!metrics || !profile) return null;

  const factor = activityFactor(profile.daily, profile.sessions);
  const gauge = bmiGaugePosition(metrics.bmi);
  const energie = energyBreakdown(metrics);

  return (
    <Box>
      <PageIntro
        title="Mon métabolisme"
        lead="Ce que votre corps dépense sur une journée complète, et d’où vient cette dépense."
        illustration={<MeditatingDoodle />}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper
          sx={(t) => ({
            background: t.tokens.heroGradient,
            color: t.tokens.heroText,
            border: 'none',
            p: { xs: 3, sm: 4 },
          })}
        >
          <Overline onDark>Votre dépense sur une journée</Overline>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, m: '12px 0 8px' }}>
            <Typography
              component="p"
              sx={{
                fontFamily: DISPLAY_FONT,
                fontSize: { xs: 46, sm: FS.hero },
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: '-.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {kcal(metrics.tdee)}
            </Typography>
            <Typography sx={{ fontSize: FS.stat3, opacity: 0.85 }}>kcal par jour</Typography>
          </Box>
          <Typography sx={{ fontSize: FS.body, lineHeight: 1.6, opacity: 0.9, maxWidth: '56ch' }}>
            Tout compris : le fonctionnement du corps et tout ce que vous faites bouger. Le calcul
            tient compte de «&nbsp;{activityLabel(profile.daily, profile.sessions)}&nbsp;» (×&nbsp;
            {fmtFactor(factor)}). Si vous mangez à peu près cette quantité, votre poids ne bouge
            pas.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>D’où vient cette dépense</Overline>
          <Typography
            sx={(t) => ({
              fontSize: FS.base,
              lineHeight: 1.6,
              color: t.tokens.muted,
              mb: '16px',
              maxWidth: '68ch',
              textWrap: 'pretty',
            })}
          >
            Contrairement à ce qu’on imagine, le sport n’est pas le principal poste de dépense : le
            simple fait d’être en vie représente {energie.bmrPct} % de votre total, soit{' '}
            {kcal(energie.bmr)} kcal par jour.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              height: 12,
              borderRadius: '6px',
              overflow: 'hidden',
              mb: '14px',
            }}
          >
            <Box
              sx={(t) => ({
                height: 12,
                backgroundColor: t.tokens.primaryInk,
                width: `${energie.bmrPct}%`,
              })}
            />
            <Box
              sx={(t) => ({
                height: 12,
                backgroundColor: t.tokens.primary,
                opacity: 0.55,
                width: `${energie.movementPct}%`,
              })}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            <StatTile
              label={`Fonctionnement du corps · ${energie.bmrPct} %`}
              value={`${kcal(energie.bmr)} kcal`}
              note="Cœur, cerveau, respiration, température, renouvellement des cellules."
              accent
            />
            <StatTile
              label={`Mouvement · ${energie.movementPct} %`}
              value={`${kcal(energie.movement)} kcal`}
              note="Sport, mais surtout marche, ménage, escaliers, agitation quotidienne."
            />
            <StatTile
              label="Digestion"
              value={`≈ ${kcal(energie.digestion)} kcal`}
              note="Environ 10 % de ce que vous mangez, déjà compté dans le total ci-dessus."
            />
          </Box>

          <Typography
            sx={(t) => ({
              fontSize: FS.small,
              lineHeight: 1.6,
              color: t.tokens.muted,
              mt: '16px',
              maxWidth: '68ch',
              textWrap: 'pretty',
            })}
          >
            Ce qui fait varier votre métabolisme, par ordre d’importance : la quantité de muscle
            (chaque kilo consomme environ 13 kcal par jour au repos, contre 4,5 pour un kilo de
            graisse), l’âge, le sommeil et le stress. Les «&nbsp;aliments brûle-graisses&nbsp;»,
            eux, ne pèsent rien dans ce calcul.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline>Votre corpulence (IMC)</Overline>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              m: '10px 0 16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <Typography
                sx={{
                  fontFamily: DISPLAY_FONT,
                  fontSize: FS.stat,
                  fontWeight: 600,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {dec(metrics.bmi)}
              </Typography>
              <Typography sx={{ fontSize: FS.option, fontWeight: 500 }}>
                {metrics.band.label}
              </Typography>
            </Box>
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted })}>
              Poids santé pour votre taille : {metrics.healthyMin} – {metrics.healthyMax} kg
            </Typography>
          </Box>

          <Box
            role="img"
            aria-label={`IMC ${dec(metrics.bmi)} : ${metrics.band.label}`}
            sx={{ position: 'relative', height: 8, display: 'flex', gap: '2px' }}
          >
            {BMI_BANDS.slice(0, 4).map((b) => (
              <Box
                key={b.label}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: '4px',
                  backgroundColor: b.color,
                  opacity: 0.9,
                }}
              />
            ))}
            <Box
              sx={(t) => ({
                position: 'absolute',
                top: -4,
                left: `${gauge}%`,
                width: 4,
                height: 16,
                borderRadius: '2px',
                backgroundColor: t.tokens.text,
                boxShadow: `0 0 0 2px ${t.tokens.surface}`,
                transform: 'translateX(-2px)',
              })}
            />
          </Box>
          <Box
            sx={(t) => ({
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: FS.micro,
              color: t.tokens.muted2,
              mt: '6px',
              mb: '14px',
            })}
          >
            {BMI_GAUGE_LABELS.map((label) => (
              <Box component="span" key={label}>
                {label}
              </Box>
            ))}
          </Box>

          <Typography
            sx={(t) => ({
              fontSize: FS.base,
              lineHeight: 1.6,
              color: t.tokens.muted,
              maxWidth: '62ch',
              textWrap: 'pretty',
            })}
          >
            L’IMC compare simplement votre poids à votre taille. C’est un repère de population, pas
            un diagnostic : il ne fait pas la différence entre muscle et graisse, et il classe donc
            en «&nbsp;surpoids&nbsp;» des personnes très musclées qui vont très bien.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
