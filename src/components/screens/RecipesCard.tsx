'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Metrics } from '@/lib/calc';
import type { GoalKey } from '@/lib/constants';
import { fmtPortions, kcal } from '@/lib/format';
import { eatingTips } from '@/lib/nutrition';
import { buildRecipeSuggestions, type Suggestion, snackKcal } from '@/lib/recipes';
import { FS } from '@/theme/theme';
import Icon from '../ui/Icon';
import Overline from '../ui/Overline';

/**
 * Des recettes existantes plutôt qu'un menu fabriqué.
 *
 * Une liste d'aliments pesés au gramme près se lit bien mais ne se cuisine pas : personne n'ouvre
 * son frigo pour « 145 g de féculent complet cuit ». Ici chaque proposition est une vraie recette,
 * publiée ailleurs, avec ses calories annoncées et un lien direct vers son auteur.
 */
export default function RecipesCard({ metrics, goal }: { metrics: Metrics; goal: GoalKey }) {
  const meals = buildRecipeSuggestions(metrics, goal);
  const tips = eatingTips(metrics);
  const collation = snackKcal(metrics);

  return (
    <Paper sx={{ p: 3 }}>
      <Overline sx={{ mb: '4px' }}>Des recettes pour ces repères</Overline>
      <Typography
        sx={(t) => ({
          fontSize: FS.base,
          lineHeight: 1.6,
          color: t.tokens.muted,
          mb: '20px',
          maxWidth: '68ch',
          textWrap: 'pretty',
        })}
      >
        Des recettes publiées sur des sites de cuisine, choisies pour tomber près de vos{' '}
        {kcal(metrics.target)} kcal et de vos besoins en protéines. Les valeurs affichées sont
        celles annoncées par chaque site, pour une portion. Cliquez sur une recette pour l’ouvrir
        chez son auteur.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {meals.map((meal) => (
          <Box key={meal.name}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 1,
                mb: '10px',
                flexWrap: 'wrap',
              }}
            >
              <Typography sx={{ fontSize: FS.option, fontWeight: 500 }}>{meal.name}</Typography>
              <Typography
                sx={(t) => ({
                  fontSize: FS.small,
                  color: t.tokens.muted2,
                  fontVariantNumeric: 'tabular-nums',
                })}
              >
                environ {kcal(meal.budget)} kcal
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '12px',
              }}
            >
              {meal.recipes.map((recipe) => (
                <RecipeLink key={recipe.url} recipe={recipe} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Typography
        sx={(t) => ({
          fontSize: FS.small,
          lineHeight: 1.6,
          color: t.tokens.muted,
          mt: '20px',
          maxWidth: '68ch',
          textWrap: 'pretty',
        })}
      >
        Ces trois repas couvrent environ 90 % de votre journée. Il reste {kcal(collation)} kcal pour
        une collation&nbsp;: un fruit, un yaourt, une poignée d’amandes. Rien à calculer.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '20px' }}>
        {tips.map((tip) => (
          <Box
            key={tip}
            sx={(t) => ({
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              backgroundColor: t.tokens.surface2,
              borderRadius: 1,
              p: '14px',
            })}
          >
            <Box
              aria-hidden
              sx={(t) => ({
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: t.tokens.primaryInk,
                flex: 'none',
                mt: '7px',
              })}
            />
            <Typography sx={{ fontSize: FS.base, lineHeight: 1.55 }}>{tip}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

/**
 * La carte entière est le lien : sur mobile, une cible de la taille du doigt vaut mieux qu'un
 * titre souligné de 14 px. `noreferrer` en plus de `noopener` : le site de destination n'a pas à
 * savoir d'où vient le visiteur.
 */
function RecipeLink({ recipe }: { recipe: Suggestion }) {
  const portions = `${fmtPortions(recipe.portions)} portion${recipe.portions > 1 ? 's' : ''}`;

  return (
    <Box
      component="a"
      href={recipe.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={(t) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: `1px solid ${t.tokens.border}`,
        borderRadius: 1,
        p: '14px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color .15s ease, background-color .15s ease',
        '&:hover': { borderColor: t.tokens.primaryInk, backgroundColor: t.tokens.surface2 },
      })}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Typography
          sx={(t) => ({
            fontSize: FS.base,
            fontWeight: 500,
            lineHeight: 1.4,
            color: t.tokens.primaryInk,
            flex: 1,
          })}
        >
          {recipe.title}
        </Typography>
        <Box aria-hidden sx={(t) => ({ color: t.tokens.muted2, flex: 'none', mt: '2px' })}>
          <Icon name="lienExterne" size={15} />
        </Box>
      </Box>

      <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
        {recipe.source}
        <Box
          component="span"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          }}
        >
          {' '}
          (ouvre un nouvel onglet)
        </Box>
      </Typography>

      <Typography
        sx={(t) => ({
          fontSize: FS.small,
          color: t.tokens.muted,
          fontVariantNumeric: 'tabular-nums',
        })}
      >
        {kcal(recipe.kcal)} kcal · {recipe.prot} g de protéines par portion
      </Typography>

      {recipe.portions !== 1 ? (
        <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
          Comptez {portions} pour ce repas, soit {kcal(recipe.totalKcal)} kcal et {recipe.totalProt}{' '}
          g de protéines.
        </Typography>
      ) : null}

      {recipe.missingKcal > 0 ? (
        <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
          Il manquera {kcal(recipe.missingKcal)} kcal pour le repère de ce repas&nbsp;: ajoutez du
          pain, du riz ou un laitage plutôt qu’une portion de plus.
        </Typography>
      ) : null}
    </Box>
  );
}
