import Link from 'next/link';

/**
 * Ce qu'on affiche à la place des chiffres quand aucun profil n'est enregistré.
 *
 * Remplace l'ancienne redirection vers la saisie : rediriger privait le visiteur — et le moteur de
 * recherche — des explications de la page, alors qu'elles se lisent très bien sans avoir rien
 * calculé. Ici la page reste entière, seuls les chiffres manquent, et on dit comment les obtenir.
 */
export default function CalculPrompt({ quoi }: { quoi: string }) {
  return (
    <div className="card p-6">
      <h2 className="mb-2 font-display text-h3 font-semibold">Vos chiffres, en une minute</h2>
      <p className="mb-5 max-w-[62ch] text-base leading-[1.6] text-muted text-pretty">
        {quoi} Quatre questions suffisent : votre sexe, votre date de naissance, vos mesures et
        votre objectif. Rien n’est envoyé sur internet, vos réponses restent dans ce navigateur.
      </p>
      <Link
        href="/profil"
        className="inline-flex items-center justify-center rounded-[var(--radius-control)] bg-primary px-[26px] py-[13px] text-option font-semibold text-hero-text transition-colors hover:bg-primary-dark"
      >
        Calculer mes chiffres
      </Link>
    </div>
  );
}
