import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  italic,
  after,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  italic?: string;
  after?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            <span className="h-px w-6 bg-primary" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-4xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
          {title}
          {italic && (
            <>
              {" "}
              <em className="font-display font-normal tracking-[-0.01em] text-primary">{italic}</em>
            </>
          )}
          {after && <> {after}</>}
        </h2>
        {description && <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}
