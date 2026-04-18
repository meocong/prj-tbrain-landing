export function NumberedBlock({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group border-t border-[#E5E7EB] py-10">
      <div className="flex items-baseline gap-8">
        <span className="font-family_avt text-sm tracking-widest text-[#78818f]">
          {n}
        </span>
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-[#0e1b2e] md:text-3xl">
            {title}
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#78818f]">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
