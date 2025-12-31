const AdSidebar = ({ slot }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) { console.error(e); }
    }, []);

    return (
        <div className="hidden xl:flex w-[160px] h-[600px] sticky top-8 items-start justify-center overflow-hidden">
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '160px', height: '600px' }}
                data-ad-client="ca-pub-8379070221932445"
                data-ad-slot={slot}
                data-ad-format="vertical"
                data-full-width-responsive="false"></ins>
        </div>
    );
};