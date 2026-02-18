export function LogoStrip() {
  const logos = [
    { name: 'Dropbox', width: 120 },
    { name: 'Airbnb', width: 100 },
    { name: 'GitHub', width: 110 },
    { name: 'Netflix', width: 110 },
    { name: 'HBO', width: 90 },
  ];

  return (
    <section className="py-16 px-16 max-w-[1440px] mx-auto border-y border-gray-200 bg-gray-50/50">
      <div className="flex items-center justify-center gap-16 opacity-40">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="text-3xl font-bold text-gray-800"
            style={{ width: logo.width }}
          >
            {logo.name}
          </div>
        ))}
      </div>
    </section>
  );
}