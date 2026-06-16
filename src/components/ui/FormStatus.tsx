import type { SubmitStatus } from '../../lib/useContactForm';

const MESSAGES: Record<'success' | 'error', string> = {
  success: 'Message sent. Daiana will be in touch by email soon.',
  error: 'Something went wrong. Please try again, or call Daiana directly at (908) 499-6320.',
};

/** Inline, on-brand replacement for window.alert() form feedback. */
function FormStatus({ status }: { status: SubmitStatus }) {
  if (status !== 'success' && status !== 'error') {
    return null;
  }

  return (
    <p
      className={`form-status form-status-${status}`}
      role={status === 'error' ? 'alert' : 'status'}
    >
      {MESSAGES[status]}
    </p>
  );
}

export default FormStatus;
