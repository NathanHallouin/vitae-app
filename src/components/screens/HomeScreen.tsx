'use client';

import Link from 'next/link';
import { BENEFITS } from '@/lib/constants';
import { kcal } from '@/lib/format';
import { useProfile } from '../ProfileProvider';
import HomeIllustration from '../ui/HomeIllustration';
import Icon from '../ui/Icon';
import Overline from '../ui/Overline';
import { Button } from '../ui/primitives';

export default function HomeScreen() {
  const { status, metrics } = useProfile();
  const known = status === 'ready' && metrics !== null;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 sm:px-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-8">
        <div>
          <h1 className="mb-4 font-display text-h1 font-semibold leading-[1.15] tracking-[-.015em]">
            Combien votre corps brûle-t-il de calories&nbsp;?
          </h1>
          <p className="mb-2 max-w-[58ch] text-body leading-[1.6] text-muted text-pretty">
            Même au repos, votre corps consomme de l’énergie pour respirer, faire battre votre cœur
            et vous garder au chaud. Savoir combien, c’est le point de départ pour perdre du gras,
            prendre du muscle ou simplement rester stable.
          </p>
          <p className="mb-8 max-w-[58ch] text-base leading-[1.6] text-muted2">
            Quatre questions, une minute. Rien n’est envoyé sur internet : vos réponses restent dans
            ce navigateur. Vous pouvez aussi parcourir directement{' '}
            <Link href="/recettes" className="text-primary-ink underline underline-offset-2">
              les recettes
            </Link>
            .
          </p>

          {known && metrics ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button as={Link} href="/metabolisme" variant="contained" size="large">
                Voir mes résultats
              </Button>
              <Button as={Link} href="/profil" variant="outlined" size="large">
                Modifier mes infos
              </Button>
              <p className="w-full text-small text-muted2">
                Dernier calcul : {kcal(metrics.tdee)} kcal dépensées par jour,{' '}
                {kcal(metrics.target)} kcal à manger pour votre objectif.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button as={Link} href="/profil" variant="contained" size="large">
                Commencer
              </Button>
              <Button as={Link} href="/profil?mode=form" variant="outlined" size="large">
                Tout saisir d’un coup
              </Button>
            </div>
          )}
        </div>

        <div>
          <HomeIllustration />

          <div className="card mt-6 p-6">
            <Overline className="mb-5">Ce que vous obtenez</Overline>
            {BENEFITS.map((b) => (
              <div key={b.n} className="flex gap-4 border-t border-divider py-3">
                <span
                  aria-hidden
                  className="flex size-[30px] flex-none items-center justify-center rounded-full bg-primary-tint text-primary-ink"
                >
                  <Icon name={b.icon} size={18} />
                </span>
                <div>
                  <p className="mb-[2px] text-option font-medium">{b.title}</p>
                  <p className="text-small leading-[1.5] text-muted">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
