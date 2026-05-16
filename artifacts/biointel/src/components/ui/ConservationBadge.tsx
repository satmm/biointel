export function ConservationBadge({ status }: { status: 'CR'|'EN'|'VU'|'NT'|'LC'|'EX'|'EW'|'DD' }) {
  const styles: Record<string, string> = {
    CR: 'bg-[var(--red-dim)] text-[var(--red-ext)] border-[rgba(255,59,92,0.3)]',
    EN: 'bg-[var(--red-dim)] text-[var(--red-ext)] border-[rgba(255,59,92,0.3)]',
    VU: 'bg-[var(--amber-dim)] text-[var(--amber)] border-[rgba(245,166,35,0.3)]',
    NT: 'bg-gray-800 text-gray-300 border-gray-600',
    LC: 'bg-[rgba(34,197,94,0.12)] text-[var(--green-safe)] border-[rgba(34,197,94,0.3)]',
    EX: 'bg-gray-900 text-gray-500 border-gray-700',
    EW: 'bg-gray-900 text-gray-400 border-gray-600',
    DD: 'bg-gray-800 text-gray-400 border-gray-600',
  };

  const labels: Record<string, string> = {
    CR: 'Critically Endangered',
    EN: 'Endangered',
    VU: 'Vulnerable',
    NT: 'Near Threatened',
    LC: 'Least Concern',
    EX: 'Extinct',
    EW: 'Extinct in the Wild',
    DD: 'Data Deficient'
  };

  return (
    <div className={`inline-flex font-mono text-[11px] tracking-[0.1em] px-[14px] py-[5px] rounded-full border ${styles[status] || styles.DD}`}>
      {labels[status] || status}
    </div>
  );
}
