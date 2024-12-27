interface BackgroundPhotoProps {
  photoUrl: string | null
}

export function BackgroundPhoto({ photoUrl }: BackgroundPhotoProps) {
  if (!photoUrl) return null

  return (
    <div 
      className="fixed inset-0 z-0"
      style={{
        backgroundImage: `url(${photoUrl})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.15
      }}
    />
  )
}