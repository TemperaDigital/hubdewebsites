interface Props {
  title: string
  moreLabel?: string
  onMore?: () => void
}

/** Cabeçalho de seção: barra amarela + título em caixa alta + link opcional. */
export function SectionHeader({ title, moreLabel = 'Ver mais', onMore }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="section-title">{title}</h2>
      {onMore && (
        <button
          onClick={onMore}
          className="text-xs font-semibold text-hub-primary-600 hover:underline"
        >
          {moreLabel}
        </button>
      )}
    </div>
  )
}
