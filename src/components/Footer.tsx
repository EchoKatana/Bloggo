export default function Footer() {
    return (
        <footer style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            zIndex: 100,
        }}>
            <a
                href="https://github.com/EchoKatana"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                className="footer-credit"
            >
                <span style={{ opacity: 0.7 }}>Created by</span>
                <span style={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Yankı M. Kılıç
                </span>
            </a>
        </footer>
    )
}
