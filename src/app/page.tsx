import PostCard from '@/components/PostCard'
import { getAllPosts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default function HomePage() {
    const posts = getAllPosts()

    return (
        <main className="container">
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                marginBottom: 'var(--spacing-2xl)',
                padding: 'var(--spacing-xl) 0'
            }}>
                <h1 className="animate-fade-in" style={{ marginBottom: 'var(--spacing-md)' }}>
                    Hoş Geldiniz 🚀
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.8'
                }}>
                    Düşüncelerinizi paylaşın, hikayelerinizi anlatın. Modern ve güçlü blog platformu ile yazılarınızı dünyayla buluşturun.
                </p>
            </section>

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-2xl)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--glass-border)'
                }}>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        Henüz yazı yok. İlk yazıyı siz yazın! ✍️
                    </p>
                    <a href="/create" className="btn btn-primary">
                        İlk Yazınızı Oluşturun
                    </a>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-2xl)'
                }}>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </main>
    )
}
