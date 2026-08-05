const ACM_MEMBER_URL = 'https://aspireup.ai/organization/acm-vnrvjiet/event/100107';
const NON_MEMBER_URL = 'https://example.com'; // placeholder — replace when ready

/**
 * MembershipModal
 * Props:
 *   isOpen  — boolean
 *   onClose — () => void
 */
const MembershipModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleYes = () => {
    onClose();
    window.open(ACM_MEMBER_URL, '_blank', 'noopener,noreferrer');
  };

  const handleNo = () => {
    onClose();
    window.open(NON_MEMBER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-auto rounded-2xl border border-[#0d9c57]/40 p-8 text-center"
        style={{ background: '#06120E', boxShadow: '0 0 40px rgba(13,156,87,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#024028] to-[#0d9c57]" />

        {/* Title */}
        <h2 className="tektur-title text-xl sm:text-2xl font-bold text-white mb-2">
          ACM Membership
        </h2>

        {/* Body */}
        <p className="cal-sans-regular text-white/70 text-sm sm:text-base mb-8 leading-relaxed">
          Are you an ACM member?
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={handleYes}
            className="cal-sans-regular flex-1 py-2.5 rounded-full font-semibold text-white
                       bg-gradient-to-r from-[#024028] to-[#0d9c57]
                       transition-all duration-300 hover:scale-105
                       hover:shadow-[0_0_20px_rgba(13,156,87,0.55)]
                       text-sm sm:text-base"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="cal-sans-regular flex-1 py-2.5 rounded-full font-semibold
                       text-white/80 border border-[#0d9c57]/50
                       bg-transparent transition-all duration-300
                       hover:border-[#0d9c57] hover:text-white hover:scale-105
                       text-sm sm:text-base"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
