'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { buildMacros, proteinBasisNote, rangeBar, rangeCaption, warningText } from '@/lib/calc';
import { GOALS } from '@/lib/constants';
import { fmtGap, fmtWeekly, kcal } from '@/lib/format';
import { useTokens } from '@/theme/ThemeRegistry';
import { DISPLAY_FONT, FS } from '@/theme/theme';
import { useProfile } from '../ProfileProvider';
import PlantDoodle from '../ui/doodles/PlantDoodle';
import Icon from '../ui/Icon';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import PageIntro from '../ui/PageIntro';
import StatTile from '../ui/StatTile';
import RecipesCard from './RecipesCard';

export default function AlimentationScreen() {
  const { metrics, profile, setGoal } = useProfile();
  const tokens = useTokens();
  if (!metrics || !profile) return null;

  const bar = rangeBar(metrics);
  const warning = warningText(metrics);
  const macros = buildMacros(metrics, {
    prot: tokens.macroProt,
    fat: tokens.macroFat,
    carb: tokens.macroCarb,
  });
  const gapAtMin = metrics.min - metrics.tdee;
  const gapAtMax = metrics.max - metrics.tdee;

  return (
    <Box>
      <PageIntro
        title="Ce que je mange"
        lead="Combien manger chaque jour pour aller dans le sens de votre objectif, et comment répartir ces calories."
        illustration={<PlantDoodle />}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>Mon objectif</Overline>
          <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '14px' })}>
            Changez-le quand vous voulez : tous les chiffres du site se recalculent.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px',
            }}
          >
            {GOALS.map((g) => (
              <OptionButton
                key={g.key}
                selected={profile.goal === g.key}
                onClick={() => setGoal(g.key)}
                sx={{ p: '14px 16px' }}
              >
                <Typography sx={{ fontSize: FS.option, fontWeight: 500, color: 'inherit' }}>
                  {g.label}
                </Typography>
                <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mt: '2px' })}>
                  {g.desc}
                </Typography>
                <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted })}>
                  {g.detail}
                </Typography>
              </OptionButton>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline>Votre repère quotidien</Overline>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, m: '10px 0 8px' }}>
            <Typography
              sx={(t) => ({
                fontFamily: DISPLAY_FONT,
                fontSize: FS.display,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: '-.02em',
                color: t.tokens.primaryInk,
                fontVariantNumeric: 'tabular-nums',
              })}
            >
              {kcal(metrics.target)}
            </Typography>
            <Typography sx={(t) => ({ fontSize: FS.option, color: t.tokens.muted })}>
              kcal par jour
            </Typography>
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
            {metrics.goal.note}
          </Typography>

          <Box sx={(t) => ({ borderTop: `1px solid ${t.tokens.divider}`, mt: '20px', pt: '18px' })}>
            <Overline sx={{ mb: '4px' }}>{rangeCaption(metrics.goal.key)}</Overline>
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '16px' })}>
              Inutile de viser juste : tant que vous restez dans cette fourchette, ça marche.
            </Typography>

            <Box
              sx={(t) => ({
                position: 'relative',
                height: 10,
                backgroundColor: t.tokens.divider,
                borderRadius: '5px',
                mb: '10px',
              })}
            >
              <Box
                sx={(t) => ({
                  position: 'absolute',
                  top: 0,
                  height: 10,
                  borderRadius: '5px',
                  backgroundColor: t.tokens.primaryInk,
                  opacity: 0.5,
                  left: `${bar.low}%`,
                  width: `${bar.width}%`,
                })}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  top: -3,
                  width: 2,
                  height: 16,
                  backgroundColor: tokens.marker,
                  left: `${bar.tdee}%`,
                }}
              />
            </Box>
            <Box
              sx={(t) => ({
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: FS.micro,
                color: t.tokens.muted2,
                mb: '18px',
              })}
            >
              <span>Ce que vous brûlez au repos</span>
              <span>Ce que vous brûlez en tout</span>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              <StatTile
                label="Au minimum"
                value={`${kcal(metrics.min)} kcal`}
                note={`${fmtGap(gapAtMin)} par rapport à votre dépense · ${fmtWeekly(gapAtMin)}`}
              />
              <StatTile
                label="Au maximum"
                value={`${kcal(metrics.max)} kcal`}
                note={`${fmtGap(gapAtMax)} par rapport à votre dépense · ${fmtWeekly(gapAtMax)}`}
              />
            </Box>

            {warning ? (
              <Box
                sx={(t) => ({
                  backgroundColor: t.tokens.warnBg,
                  color: t.tokens.warnInk,
                  borderRadius: 1,
                  p: '12px 14px',
                  fontSize: FS.small,
                  lineHeight: 1.55,
                  mt: '12px',
                  textWrap: 'pretty',
                })}
              >
                {warning}
              </Box>
            ) : null}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>Comment répartir ces calories</Overline>
          <Typography
            sx={(t) => ({
              fontSize: FS.small,
              color: t.tokens.muted,
              mb: '18px',
              maxWidth: '68ch',
            })}
          >
            Des repères, pas des règles. Le plus important reste le total de la journée.{' '}
            {proteinBasisNote(metrics)}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {macros.map((m) => (
              <Box key={m.label}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 2,
                    mb: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box component="span" sx={{ color: m.color, display: 'flex' }}>
                      <Icon name={m.icon} size={19} />
                    </Box>
                    <Box component="span" sx={{ fontSize: FS.base, fontWeight: 500 }}>
                      {m.label}
                    </Box>
                    <Box
                      component="span"
                      sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, ml: 1 })}
                    >
                      {m.hint}
                    </Box>
                  </Box>
                  <Typography
                    component="span"
                    sx={(t) => ({
                      fontSize: FS.base,
                      color: t.tokens.muted,
                      fontVariantNumeric: 'tabular-nums',
                    })}
                  >
                    {m.grams} g · {m.kcal} kcal
                  </Typography>
                </Box>
                <Box
                  sx={(t) => ({
                    height: 6,
                    backgroundColor: t.tokens.divider,
                    borderRadius: '3px',
                    overflow: 'hidden',
                  })}
                >
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: '3px',
                      width: `${m.pct}%`,
                      backgroundColor: m.color,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        <RecipesCard metrics={metrics} goal={profile.goal} />
      </Box>
    </Box>
  );
}
