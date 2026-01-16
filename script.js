const FontManager = {
    STORAGE_KEY: 'cmdaeo_font_data',
    COOLDOWN_MS: 10000,

    getFont() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        const now = Date.now();

        if (stored) {
            const data = JSON.parse(stored);
            const timeSinceLastRoll = now - data.timestamp;

            if (timeSinceLastRoll < this.COOLDOWN_MS) {
                return data.font;
            }
        }

        const newFont = DISPLAY_FONTS[Math.floor(Math.random() * DISPLAY_FONTS.length)];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            font: newFont,
            timestamp: now
        }));

        return newFont;
    },

    loadFont(fontName) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
};

function App() {
    const [tools, setTools] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [titleFont, setTitleFont] = React.useState('');

    React.useEffect(() => {
        const font = FontManager.getFont();
        FontManager.loadFont(font);
        setTitleFont(font);

        // Prevent all scroll events
        const preventScroll = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        // Block mousewheel and touch events
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('scroll', preventScroll, { passive: false });

        fetch('./tools-manifest.json')
            .then(res => res.json())
            .then(data => {
                setTools(data);
                setLoading(false);
            })
            .catch(err => {
                console.log('Waiting for manifest generation...', err);
                setLoading(false);
            });

        return () => {
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
            window.removeEventListener('scroll', preventScroll);
        };
    }, []);

    const scrollToExplorer = () => {
        // Enable scrolling
        document.body.classList.add('scrollable');

        // Remove scroll prevention
        const preventScroll = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        window.removeEventListener('scroll', preventScroll);

        // Scroll to explorer section
        setTimeout(() => {
            document.getElementById('explorer').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 50);
    };

    return (
        <>
            <section className="hero-container">
                <h1 className="hero-title" style={{ fontFamily: titleFont || 'Archivo Black' }}>
                    {'CMDAEO'.split('').map((letter, i) => (
                        <span key={i} className="letter" data-letter={letter}>{letter}</span>
                    ))}
                </h1>

                <div className="scroll-hint" onClick={scrollToExplorer}>
                    <div className="chevron-arrow"></div>
                    <div className="chevron-arrow"></div>
                    <div className="chevron-arrow"></div>
                    <div className="scroll-text">CLICK</div>
                </div>
            </section>

            <section id="explorer" className="explorer-section">
                <div className="max-w-7xl mx-auto">
                    <div className="section-label">
                        Tools & Utilities
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-bars">
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                                <div className="loading-bar"></div>
                            </div>
                            <div className="loading-text">LOADING</div>
                        </div>
                    ) : tools.length === 0 ? (
                        <div className="loading-container">
                            <div className="loading-text">NO TOOLS FOUND</div>
                        </div>
                    ) : (
                        <div className="tools-grid">
                            {tools.map((tool, index) => (
                                <a
                                    key={tool.filename}
                                    href={tool.url}
                                    className="tool-item"
                                >
                                    <div className="tool-index">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <h2 className="tool-name">
                                        {tool.title}
                                    </h2>
                                    <p className="tool-description">
                                        {tool.description}
                                    </p>
                                    <div className="tool-meta">
                                        <span>LAUNCH</span>
                                        <div className="tool-meta-arrow"></div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="footer">
                        <div className="footer-text">
                            made by cmdaeo
                        </div>
                        <div className="footer-text">
                            v{new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);