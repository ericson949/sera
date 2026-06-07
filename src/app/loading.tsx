export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-foreground text-3xl font-semibold text-background shadow-md">
        S
      </div>
      <h1 className="mt-5 font-serif text-[42px] leading-[44px] text-foreground">Sera</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Preparing your table.</p>
    </div>
  );
}
