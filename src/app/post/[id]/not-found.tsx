export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'var(--spacing-xl)'
        }}>
            <div className="animate-fade-in">
                <h1 style={{
                    fontSize: 'clamp(4rem, 10vw, 8rem)',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    404
                </h1>
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
                    Yazı Bulunamadı
                </h2>
                <p style={{
                    fontSize: '1.125rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    Aradığınız yazı mevcut değil veya kaldırılmış.
                </p>
                <Link href="/" className="back-link">
                    ← Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    )
}
