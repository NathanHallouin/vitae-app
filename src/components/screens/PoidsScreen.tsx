'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { buildProjection, rateAssessment } from '@/lib/calc';
import { dec, fmtKg, fmtWeekly, kcal, monthIn } from '@/lib/format';
import { FS } from '@/theme/theme';
import { useProfile } from '../ProfileProvider';
import ProjectionChart from '../result/ProjectionChart';
import LevitateDoodle from '../ui/doodles/LevitateDoodle';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import PageIntro from '../ui/PageIntro';

export default function PoidsScreen() {
  const { metrics, profile, targetKey, setTargetKey } = useProfile();
  if (!metrics || !profile) return null;

  const projection = buildProjection(metrics, profile.goal, targetKey);
  const cible = `${dec(projection.selected.w)} kg`;
  const rythme = projection.coherent ? rateAssessment(metrics, projection.rate) : null;

  return (
    <Box>
      <PageIntro
        title="Mon poids"
        lead={`Vous êtes à ${dec(metrics.poids)} kg. Voici où vous pourriez aller, et en combien de temps si vous mangez ${kcal(metrics.target)} kcal par jour.`}
        illustration={<LevitateDoodle />}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>Quel poids viser&nbsp;?</Overline>
          <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '14px' })}>
            Trois repères calculés pour votre taille. Choisissez celui qui vous parle, rien n’est
            définitif.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
            }}
          >
            {projection.options.map((o) => (
              <OptionButton
                key={o.key}
                selected={o.key === projection.key}
                onClick={() => setTargetKey(o.key)}
                sx={{ p: '14px 16px' }}
              >
                <Typography
                  sx={{
                    fontSize: FS.stat3,
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'inherit',
                  }}
                >
                  {dec(o.w)} kg
                </Typography>
                <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mt: '2px' })}>
                  {o.label}
                </Typography>
                <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted })}>
                  {o.sub}
                </Typography>
              </OptionButton>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '14px' }}>Combien de temps&nbsp;?</Overline>

          {projection.coherent ? (
            <>
              <Typography
                sx={(t) => ({
                  fontSize: FS.body,
                  lineHeight: 1.6,
                  color: t.tokens.text,
                  mb: '18px',
                  maxWidth: '62ch',
                  textWrap: 'pretty',
                })}
              >
                En mangeant {kcal(metrics.target)} kcal par jour, vous atteindriez{' '}
                <strong>{cible}</strong> en environ{' '}
                <strong>
                  {projection.weeks} {projection.weeks > 1 ? 'semaines' : 'semaine'}
                </strong>
                , soit vers {monthIn(projection.weeks)}.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '20px',
                  mb: '20px',
                }}
              >
                <Stat
                  label="À perdre ou à prendre"
                  value={fmtKg(projection.selected.w - metrics.poids)}
                />
                <Stat label="Rythme" value={fmtWeekly((projection.rate * 7700) / 7)} />
                <Stat
                  label="Durée"
                  value={`${projection.weeks} ${projection.weeks > 1 ? 'semaines' : 'semaine'}`}
                  note={`≈ ${dec(Math.round(projection.months * 10) / 10)} mois`}
                />
                <Stat label="Objectif atteint vers" value={monthIn(projection.weeks)} />
              </Box>

              <Box
                sx={(t) => ({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: FS.caption,
                  color: t.tokens.muted2,
                  mb: '4px',
                })}
              >
                <span>
                  Poids projeté, de {projection.hiLabel} à {projection.loLabel}
                </span>
                <span>Cible {cible}</span>
              </Box>
              <ProjectionChart projection={projection} targetLabel={cible} />
            </>
          ) : null}

          <Typography
            sx={(t) => ({
              fontSize: FS.base,
              lineHeight: 1.6,
              color: t.tokens.muted,
              mt: projection.coherent ? '16px' : 0,
              maxWidth: '62ch',
              textWrap: 'pretty',
            })}
          >
            {projection.note}
          </Typography>

          {rythme ? (
            <Box
              sx={(t) => ({
                backgroundColor: rythme.level === 'bon' ? t.tokens.surface2 : t.tokens.warnBg,
                color: rythme.level === 'bon' ? t.tokens.text : t.tokens.warnInk,
                borderRadius: 1,
                p: '14px',
                fontSize: FS.small,
                lineHeight: 1.55,
                mt: '14px',
                maxWidth: '68ch',
                textWrap: 'pretty',
              })}
            >
              {rythme.text}
            </Box>
          ) : null}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '12px' }}>À quoi vous attendre en chemin</Overline>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ATTENTES.map((item) => (
              <Box key={item.titre}>
                <Typography sx={{ fontSize: FS.option, fontWeight: 500, mb: '2px' }}>
                  {item.titre}
                </Typography>
                <Typography
                  sx={(t) => ({
                    fontSize: FS.base,
                    lineHeight: 1.55,
                    color: t.tokens.muted,
                    maxWidth: '72ch',
                    textWrap: 'pretty',
                  })}
                >
                  {item.texte}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

/** Ce que la courbe ne montre pas, et qui fait abandonner quand on ne s'y attend pas. */
const ATTENTES = [
  {
    titre: 'La balance monte et descend de 1 à 2 kg sans raison',
    texte:
      'Ce sont surtout de l’eau et le contenu du tube digestif : un repas salé, des glucides, les règles, une séance intense. Pesez-vous une fois par semaine dans les mêmes conditions, ou faites la moyenne de plusieurs pesées.',
  },
  {
    titre: 'Les premiers kilos partent vite, puis ça ralentit',
    texte:
      'La première semaine fait souvent perdre plus : c’est l’eau liée aux réserves de glucides. Le rythme réel apparaît à partir de la troisième semaine.',
  },
  {
    titre: 'Un palier de 2 à 3 semaines est normal',
    texte:
      'Le corps s’adapte : vous bougez un peu moins sans vous en rendre compte et vous dépensez un peu moins. Vérifiez d’abord vos portions et vos pas avant de baisser encore les calories.',
  },
  {
    titre: 'Refaites le calcul tous les 4 à 5 kg',
    texte:
      'Vos besoins baissent avec votre poids. Mettre à jour votre poids sur cette page suffit à recalculer l’ensemble.',
  },
];

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Box>
      <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: FS.stat3, fontWeight: 500 }}>{value}</Typography>
      {note ? (
        <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted })}>{note}</Typography>
      ) : null}
    </Box>
  );
}
