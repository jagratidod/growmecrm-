export default function SectionLabel({ label, className = '' }) {
  return (
    <div className={`section-label mb-4 ${className}`}>
      {label}
    </div>
  );
}
