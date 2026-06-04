function Prompt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="text-primary select-none">visitor</span>
      <span className="text-tertiary select-none">@</span>
      <span className="text-quaternary select-none">chicocaine.dev</span>
      <span className="text-tertiary select-none">:</span>
      <span className="text-secondary select-none">~$</span>{" "}
      {children}
    </span>
  );
}

export default Prompt;
